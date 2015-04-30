'use strict';

var Q               = require('q'),
    path            = require('path'),
    models          = require('../models'),
    Repository      = require('./repository'),
    log             = require(path.resolve(__dirname, '../debug/log')),
    config          = require(path.resolve(__dirname, '../../config')),
    ContainerManager= require('./manager');


function Container (type) {
    this.configuration = {};
    this.metadata = {};
    this.type = type || 'docker';
    this.containermanager = new ContainerManager(this.type);
}

/**
 * Get container configuration
 *
 * Get container configuration based on container identifier.
 * this identifier can be container name or id
 *
 * @returns {*|promise}
 */
Container.prototype.getInstance  = function (identifier) {
    var self = this,
        // TODO: create system to find created container server
        repository = new Repository({ api: config.docker_server });

    return repository.containerInfo(identifier).then(function (config) {
        self.configuration = config[0];
        return models.Container
            .find({
                where: {id: identifier}
            }).then(function (container) { self.metadata = container.metadata; });
    });
};

Container.prototype._setConfiguration = function (config) {
    this.configuration = config;
};

/**
 * Return container configuration entry
 *
 * @param entryName
 * @returns {Array}
 */
Container.prototype.getConfigurationEntry = function (entry) {
    if (this.configuration !== {}) {

        if (entry == '*') {
            return this.configuration;
        }

        var found = [];
        var recurse = function (obj, key) {
            for (var p in obj) {
                if (p === key) {
                    found.push(obj[p]);
                }
                if (typeof obj[p] === 'object') recurse(obj[p], key);
            }
        };
        recurse(config, entry);
        return found;
    }
};

/**
 * Update container configuration entry data
 *
 * @param entry
 * @param data
 */
Container.prototype.updateConfigurationEntry = function (entry, data) {
    if (this.configuration !== {}) {
        var recurse = function (obj, key) {
            for (var p in obj) {
                if (p === key) {
                    obj[p] = data;
                    break;
                }
                if (typeof obj[p] === 'object') recurse(obj[p], key);
            }
        };
        recurse(this.configuration, entry);
    }
};

/**
 * Get container metadata
 *
 * @returns {*}
 */
Container.prototype.getMetadata = function () {
    return this.metadata;
};

/**
 * Run a container
 *
 * @param config
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
                return self.setState('running');
            });
        });
    } else { // TODO: minify these code
        return self.containermanager.startContainer({}).then(function (containerConfig) {
            self._setConfiguration(containerConfig);
            return self.setState('running');
        });
    }
};

/**
 * Shutdown a container
 *
 * @param second
 * @returns {*}
 */
Container.prototype.shutdown = function (second) {
    var self = this,
        sec = (second)? second: 0;
    return this.containermanager.stopContainer(this.getConfigurationEntry('Id'), { t: sec }).then(function () {
        self.setState('shutdown');
    });
};

/**
 * Destroy the container
 *
 * @param removeVolume
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
 *
 * @param second
 */
Container.prototype.restart = function (second) {
    var sec = (second)? second: 0;
    this.containermanager.restartContainer(this.getConfigurationEntry('Id'), sec);
};

/**
 * Save container state in database
 *
 * @param state
 * @returns {Bluebird.Promise|*}
 */
Container.prototype.setState = function (state) {
    var self = this;
    switch (state) {
        case "created":
            return models.Container
                .create({
                    id: self.getConfigurationEntry('Id'),
                    name: self.getConfigurationEntry('Name'),
                    ports: JSON.stringify(self.getConfigurationEntry('ExposedPorts')),
                    public: self.getConfigurationEntry('PublishAllPorts'),
                    image: self.getConfigurationEntry('Image'),
                    metadata: JSON.stringify(self.metadata),
                    state: "created",
                    request: JSON.stringify(self.getConfiguration())
                }).then(log.info, log.error);

        case "running":
            return models.Container
                .update({
                    state: "running",
                    volumes: JSON.stringify(self.getConfigurationEntry('Binds'))
                },{
                    where: { id: self.getConfigurationEntry('id') }
                }).then(log.info, log.error);

        case "shutdown":
            return models.Container
                .update({
                    state: "shutdown"
                },{
                    where: { id: self.getConfigurationEntry('id') }
                }).then(log.info, log.error);
        default :
            return Q.reject('unknown state ' + state);
    }

};

/**
 * Delete the container from DB
 *
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
 *
 * Connect to container with ssh service and run command
 *
 * @param ip
 * @param command
 */
Container.prototype.execOnContainer = function (command) {
    var deferred = Q.defer(),
        ssh = new SshClient({
            host: this.getConfigurationEntry('IPAddress'),
            username: 'root',
            privateKey: config.container_private_key
        });

    ssh.connect().then(function () {
        ssh.exec(command).then(function (result) {
            if (result.stderr) {
                deferred.reject(result.stderr);
            } else {
                deferred.resolve(result.stdout);
            }

        }, deferred.reject).finally(function () {
            ssh.exec('exit');
        });

        return deferred.promise;
    });
};

module.exports = Container;
