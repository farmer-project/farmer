'use strict';

var Q                = require('q'),
    path             = require('path'),
    SshClient        = require('ssh2').Client,
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

    return repository.containerInfo(identifier).then(function (config) {
        self.configuration = config;
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
 * @param {Object} config - Container config
 * @returns {*}
 */
Container.prototype.run = function (config) {
    if (!config.Image) {
        return Q.reject('Unknown container base image');
    }

    var self = this;
    if (!this.getConfigurationEntry('Id')) {
        return this.containermanager.createContainer(config).then(function (containerConfig) {
            self._setConfiguration(containerConfig);
            self.setState('created'); // TODO: maybe this line is buggy
            return self.containermanager.startContainer(containerConfig).then(function (conf) {
                self._setConfiguration(conf);
                self.setState('running');
                return self;
            });
        });
    } /*else { // TODO: minify these code
        return self.containermanager.startContainer({}).then(function (containerConfig) {
            self._setConfiguration(containerConfig);
            return self.setState('running');
        });
    }*/
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
    return this.containermanager.removeContainer({
        Id: this.getConfigurationEntry('Id'),
        ForceStop: true,
        RemoveVolume: removeVolume
    }).then(this._delete);
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
                    name: self.getConfigurationEntry('Name'),
                    ports: JSON.stringify(self.getConfigurationEntry('ExposedPorts')),
                    public: self.getConfigurationEntry('PublishAllPorts'),
                    image: self.getConfigurationEntry('Image')[0],
                    state: 'created',
                    metadata: JSON.stringify(self.metadata),
                    configuration: JSON.stringify(self.getConfigurationEntry('*'))
                }).then(log.info, log.error);

        case 'running':
            return models.Container
                .update({
                    state: 'running',
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
            return container.destroy();
        });
};

/**
 * Execute a command on container
 * Connect to container with ssh and run command
 * @param {string} command - Shell command
 * @param {Publisher} publisher - Publisher object
 */
Container.prototype.execShell = function (command, publisher) {
    var self = this,
        deferred = Q.defer(),
        host = this.getConfigurationEntry('IPAddress'),
        conn = new SshClient();

    conn.connect({
        host: host,
        port: 22,
        username: 'root',
        privateKey: require('fs').readFileSync(config.CONTAINER_PRIVATE_KEY)
    });

    conn.on('ready', function () {
        conn.exec(command, function (err, stream) {
            if (err) {
                deferred.reject(err);
            }

            stream.on('close', function (code, signal) {
                conn.end();
                deferred.resolve(signal);

            }).on('data', function (data) {
                publisher.toClient(data.toString());

            }).stderr.on('data', function (data) {
                    publisher.toClient(data.toString());
                });
        });

    }).on('error', function (error) {
        publisher.toClient(error);
        deferred.reject(error);
    });

    return deferred.promise;
};

module.exports = Container;
