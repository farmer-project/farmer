'use strict';

var _                = require('underscore'),
    Q                = require('q'),
    path             = require('path'),
    del              = require('del'),
    SshClient        = require('ssh2').Client,
    fs               = require('fs'),
    models           = require('../models'),
    Repository       = require('./Repository'),
    log              = require(path.resolve(__dirname, '../debug/log')),
    config           = require(path.resolve(__dirname, '../../config')),
    ContainerManager = require('./manager');

/**
 * @param {string} [type = docker] - container type
 * @constructor
 */
function Container (type) {
    this.configuration = {};
    this.metadata = {};
    this.type = type || 'docker';
    this.containermanager = new ContainerManager(this.type);
}

/**
 * Get container configuration based on container identifier.
 * this identifier can be container name or id
 * @param {string} identifier - Container identifier
 * @returns {*|promise}
 */
Container.prototype.getInstance  = function (identifier) {
    var self = this,
        // TODO: create system to find created container server
        repository = new Repository({api: config.CONTAINER_SERVER_API});

    return repository.containerInfo(identifier).then(function (configuration) {
        self.configuration = configuration;
        return models.Container
            .find({
                where: {id: identifier}
            }).then(function (container) {
                self.metadata = JSON.parse(container.metadata);
                return self;
            });
    });
};

/**
 * Set container configuration
 * @param {Object} config
 * @private
 */
Container.prototype._setConfiguration = function (config) {
    this.configuration = config;
};

/**
 * Return container configuration entry
 * @param {string} entry - entry tag name get all container config with '*' input
 * @returns {*}
 */
Container.prototype.getConfigurationEntry = function (entry) {
    if ('*' === entry) {
        return this.configuration;
    }

    var found = [];
    var recurse = function (obj, key) {
        for (var p in obj) {
            if (p === key) {
                found.push(obj[p]);
            }
            if (typeof obj[p] === 'object') {
                recurse(obj[p], key);
            }
        }
    };
    recurse(this.configuration, entry);

    if (2 > found.length) {
        return found[0];
    }

    return found;
};

/**
 * Update container configuration entry data
 * @param {string} entry - Container entry tag name
 * @param {string|Object} data - New data
 */
Container.prototype.updateConfigurationEntry = function (entry, data) {
    if (this.configuration !== {}) {
        var recurse = function (obj, key) {
            for (var p in obj) {
                if (p === key) {
                    obj[p] = data;
                    break;
                }
                if (typeof obj[p] === 'object') {
                    recurse(obj[p], key);
                }
            }
        };
        recurse(this.configuration, entry);
    }
};

/**
 * Get container metadata
 * @returns {*}
 */
Container.prototype.getMetadata = function () {
    return this.metadata;
};

/**
 * Run a container
 * @param {Object} [config] - Container config is optional for stopped container object
 * @returns {*}
 */
Container.prototype.run = function (config) {
    if (!config.Image) {
        return Q.reject('Unknown container base image');
    }

    var self = this,
        id   = this.getConfigurationEntry('Id');
    if (!id) {
        return this.containermanager.createContainer(config).then(function (containerConfig) {
            self._setConfiguration(containerConfig);
            self.setState('created');
            config.Id = self.getConfigurationEntry('Id');
            return self.containermanager.startContainer(config).then(function (conf) {
                self._setConfiguration(conf);
                self.setState('running');
                return self;
            });
        });
    } else {
        config['Id'] = id;
        return self.containermanager.startContainer(config).then(function (containerConfig) {
            self._setConfiguration(containerConfig);
            return self.setState('running');
        });
    }
};

/**
 * Shutdown a container
 * @param {Number} second - Number of seconds to wait before killing the container
 * @returns {*}
 */
Container.prototype.shutdown = function (second) {
    var self = this,
        sec = (second) ? second : 0;
    return this.containermanager.stopContainer(
        this.getConfigurationEntry('Id'), {t: sec}).then(function () {
        self.setState('shutdown');
    });
};

/**
 * Destroy the container
 * @param {boolean} removeVolume - true to force remove container with their volumes
 * @returns {Bluebird.Promise|*}
 */
Container.prototype.destroy = function (removeVolume) {
    var self = this;
    return this.containermanager.removeContainer({
        Id: self.getConfigurationEntry('Id'),
        ForceStop: true,
        RemoveVolume: removeVolume
    }).tap(function () {
        self._delete();
    });
};

/**
 * Restart the container
 * @param {Number} second - Number of seconds to wait before restart the container
 */
Container.prototype.restart = function (second) {
    var sec = (second) ? second : 0;
    this.containermanager.restartContainer(this.getConfigurationEntry('Id'), sec);
};

/**
 * Save container state in database
 * @param {string} state
 * @returns {Bluebird.Promise|*}
 */
Container.prototype.setState = function (state) {
    var self = this;
    switch (state) {
        case 'created':
            return models.Container
                .create({
                    id: self.getConfigurationEntry('Id'),
                    name: self.configuration.Name.replace('/', ''),
                    ports: JSON.stringify(self.getConfigurationEntry('ExposedPorts')),
                    public: self.getConfigurationEntry('PublishAllPorts'),
                    image: self.configuration.Config.Image,
                    state: 'created',
                    metadata: JSON.stringify(self.metadata),
                    configuration: JSON.stringify(self.getConfigurationEntry('*'))
                }).then(log.info, log.error);

        case 'running':
            return models.Container
                .update({
                    state: 'running',
                    ports: JSON.stringify(self.getConfigurationEntry('Ports')),
                    volumes: JSON.stringify(self.getConfigurationEntry('Binds')),
                    configuration: JSON.stringify(self.getConfigurationEntry('*'))
                }, {
                    where: {id: self.getConfigurationEntry('Id')}
                }).then(log.info, log.error);

        case 'shutdown':
            return models.Container
                .update({
                    state: 'shutdown'
                }, {
                    where: {id: self.getConfigurationEntry('Id')}
                }).then(log.info, log.error);
        default :
            return Q.reject('unknown state ' + state);
    }

};

/**
 * Delete the container from DB
 * @returns {Bluebird.Promise|*}
 * @private
 */
Container.prototype._delete = function () {
    return models.Container
        .find({
            where: {id: this.getConfigurationEntry('Id')}
        }).then(function (container) {
            // TODO: Remove this code part when docker api remove volume issue solved
            var volArr = JSON.parse(container.volumes);
            if (null !== volArr) {
                volArr.forEach(function (mountPoints) {
                    del.sync(mountPoints.split(':')[0] + '/*', {force: true});
                    del.sync(mountPoints.split(':')[0] + '/', {force: true});
                });
            }
            return container.destroy();
        });
};

/**
 * Execute a command on container
 * Connect to container with ssh and run command
 * @param {string[]} commands - Shell command
 * @param {Publisher} publisher - Publisher object
 */
Container.prototype.execShell = function (commands, publisher) {
    if (typeof commands !== 'object' || !commands.length) {
        return Q.when(0);
    }

    var self = this,
        deferred = Q.defer(),
        conn = new SshClient(),
        sshConfig = _.clone(config.SSH_CONFIG);

    fs.readFile(sshConfig.privateKey, function (error, privateKey) {
        if (error) {
            console.log('read privateKey error', error);
            deferred.reject(error);
            return;
        }

        sshConfig['privateKey'] = privateKey;
        sshConfig['host'] = self.getConfigurationEntry('IPAddress');

        conn.connect(sshConfig);

        conn
            .on('ready', function () {
                _(commands).reduce(function (prevCommandPromise, command) {
                    return prevCommandPromise.then(function () {
                        var commandDeferred = Q.defer();

                        conn.exec(command, function (error, stream) {
                            console.log('   * Command Started: ' + command);

                            if (error) {
                                commandDeferred.reject(error);
                                return;
                            }

                            stream
                                .on('close', function (code) {
                                    if (0 === code) {
                                        commandDeferred.resolve(code);
                                    } else {
                                        commandDeferred.reject(code);
                                    }
                                })
                                .on('data', function (data) {
                                    publisher.toClient(data.toString());
                                })
                                .stderr.on('data', function (data) {
                                    publisher.toClient(data.toString());
                                });
                        });

                        return commandDeferred.promise;
                    });
                }, Q.when(true))
                    .then(deferred.resolve, deferred.reject)
                    .finally(function () {
                        conn.end();
                    })
                ;
            })
            .on('error', function (error) {
                publisher.toClient(error);
                deferred.reject(error);
            })
            .on('connect', function () {
                log.trace('STREAM CONNECT');
            })
            .on('end', function () {
                log.trace('STREAM END');
            })
        ;
    });

    return deferred.promise;
};

module.exports = Container;
