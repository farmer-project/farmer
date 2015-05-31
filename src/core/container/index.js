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
    this.type = type || config.CONTAINER.default;
    this.containermanager = new ContainerManager(this.type);
    this.domains = [];
    this.status = undefined;
    this.server = null;
    this.metadata = {};
    this.configuration = {};
}

/**
 * Get container configuration based on container identifier.
 * this identifier can be container name or id
 * @param {string} identifier - Container identifier
 * @returns {*|promise}
 */
Container.prototype.getInstance  = function (identifier) {
    var self = this;

    return models
        .Container
        .find({
            where: {id: identifier},
            include: [
                {
                    model: models.Domain,
                    as: 'domains'
                }
            ]
        }).then(function (container) {
            if (!container) {
                return Q.reject('container does not exist!');
            }

            self.server = container.server;
            self.type   = container.type;
            self.domains = container.domains.map(function (record) {
                return record.domain;
            });

            var repository = new Repository({
                api: config.SERVERS[container.server][self.type + '_api']
            });

            return repository.containerInfo(identifier).then(function (configuration) {
                self.configuration = configuration;
                return self;
            });
        })
    ;
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
        return this.containermanager
            .createContainer(config)
            .spread(function (server, containerConfig) {

                self._setConfiguration(containerConfig);
                config.Id   = self.getConfigurationEntry('Id');
                self.server = server;

                self.setStatus('created');

                return self.containermanager
                    .startContainer(server, config)
                    .then(function (conf) {
                        self._setConfiguration(conf);
                        self.setStatus('running');
                        return self;
                    })
                ;

            })
        ;

    } else {

        config['Id'] = id;

        return self.containermanager
            .startContainer(self.server, config)
            .then(function (containerConfig) {

                self._setConfiguration(containerConfig);
                return self.setStatus('running');

            })
        ;
    }
};

/**
 * Shutdown a container
 * @param {Number} second - Number of seconds to wait before killing the container
 * @returns {*}
 */
Container.prototype.shutdown = function (second) {
    var self = this,
        sec = (second) ? second : 1;

    return this.containermanager.stopContainer(
        self.server,
        self.getConfigurationEntry('Id'),
        {
            t: sec
        }
    ).then(function () {
        self.setStatus('shutdown');
    });
};

/**
 * Destroy the container
 * @param {boolean} removeVolume - true to force remove container with their volumes
 * @returns {Bluebird.Promise|*}
 */
Container.prototype.destroy = function (removeVolume) {
    var self = this,
        id   = self.getConfigurationEntry('Id'),
        domainManager    = require('../sysadmin/domain-manager');

    return this
        .containermanager
        .removeContainer(
            self.server,
            id,
            {
                ForceStop: true,
                RemoveVolume: removeVolume
            }
        ).then(function () {

            // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
            return models
                .Domain
                .findAll({
                    where:{container_id: id}
                }).then(function (domains) {

                    return domainManager
                        .unassign(self, domains)
                        .then(function () {
                            return self._delete();
                        });

                });
            // jscs:enable requireCamelCaseOrUpperCaseIdentifiers

        })
    ;
};

/**
 * Restart the container
 * @param {Number} second - Number of seconds to wait before restart the container
 */
Container.prototype.restart = function (second) {
    var sec = (second) ? second : 1;

    return this.containermanager
        .restartContainer(
            this.server,
            this.getConfigurationEntry('Id'),
            {
                t: sec
            }
        )
    ;
};

/**
 * Save container status in database
 * @param {string} status
 * @returns {Bluebird.Promise|*}
 */
Container.prototype.setStatus = function (status) {
    var self = this;
    switch (status) {
        case 'created':

            self.status = status;

            return models.Container
                .create({
                    id: self.getConfigurationEntry('Id'),
                    name: self.configuration.Name.replace('/', ''),
                    ports: JSON.stringify(self.getConfigurationEntry('ExposedPorts')),
                    public: self.getConfigurationEntry('PublishAllPorts'),
                    image: self.configuration.Config.Image,
                    status: status,
                    server: self.server,
                    type: self.type,
                    metadata: JSON.stringify(self.metadata),
                    configuration: JSON.stringify(self.getConfigurationEntry('*'))
                }).then(log.info, log.error);

        case 'running':

            self.status = status;

            return models.Container
                .update({
                    status: status,
                    ports: JSON.stringify(self.getConfigurationEntry('Ports')),
                    volumes: JSON.stringify(self.getConfigurationEntry('Binds')),
                    configuration: JSON.stringify(self.getConfigurationEntry('*'))
                }, {
                    where: {id: self.getConfigurationEntry('Id')}
                }).then(log.info, log.error);

        case 'shutdown':

            self.status = status;

            return models.Container
                .update({
                    status: status
                }, {
                    where: {id: self.getConfigurationEntry('Id')}
                }).then(log.info, log.error);

        default :

            self.status = status;

            return Q.reject('unknown status ' + status);
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
            var volumeArray = _.clone(JSON.parse(container.volumes));

            if (volumeArray !== null) {
                volumeArray.forEach(function (mountPoints) {
                    del.sync([mountPoints.split(':')[0] + '/*']);
                    del.sync([mountPoints.split(':')[0]], {force: true});
                });
            }

            return container.destroy();
        })
    ;
};

// TODO: remote server container shell executer
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

    var self        = this,
        deferred    = Q.defer(),
        conn        = new SshClient(),
        sshConfig   = _.clone(config.SSH_CONFIG);

    fs.readFile(sshConfig.privateKey, function (error, privateKey) {
        if (error) {
            log.error('read privateKey error ' + error.toString());
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
                                    publisher.sendRaw(data.toString());
                                })
                                .stderr.on('data', function (data) {
                                    publisher.sendRaw(data.toString());
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
                publisher.sendRaw(error);
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

/**
 * Set container domain
 * @param {string} domain - url
 * @param {Number} port - container http port
 */
Container.prototype.setDomain = function (domain, port) {
    var self        = this,
        ports       = this.getConfigurationEntry('Ports'),
        httpPort    = ports[port + '/tcp'][0]['HostPort'];

    // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
    return models
        .Domain
        .create(
            {
                container_id: self.getConfigurationEntry('Id'),
                domain: domain,
                port: port
            }
        ).then(function () {
            self.domains.push(domain);
            return 'http://' + config.SERVERS[self.server]['ip'] + ':' + httpPort;
        })
    ;
    // jscs:enable requireCamelCaseOrUpperCaseIdentifiers
};

/**
 * Unset container domain on specific port
 * @param {string} domain - domain url
 * @param {Number} port - port number
 */
Container.prototype.unsetDomain = function (domain, port) {
    var self = this;

    // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
    return models
        .Domain
        .find({
            where: {
                domain: domain,
                port: port,
                container_id: self.getConfigurationEntry('Id')
            }
        }).then(function (domainRow) {
            if (domainRow) {
                return domainRow.destroy();
            }
        });
    // jscs:enable requireCamelCaseOrUpperCaseIdentifiers
};

module.exports = Container;
