'use strict';

var Q               = require('q'),
    path            = require('path'),
    models          = require('../models'),
    repository      = require('./repository'),
    log             = require(path.resolve(__dirname, '../debug/log')),
    ContainerApiFactory = require('./manager/factory');


function Container (type) {
    this.configuration = {};
    this.metadata = {};
    this.type = type || 'docker';
    this.containerState = ['created', 'running', 'stop', 'destroyed'];
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
    var self = this;
    return repository.containerInfo(identifier).then(function (config) {
        return models
            .Container
            .find({
                where: {id: self.identifier}
            }).then(function (container) { self.metadata = container.metadata;
            }).finally(function () {
                self.configuration = config[0];
            });
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

// promise method
Container.prototype.run = function (config) {
    if (!config.Image) {
        return Q.reject('Unknown container base image');
    }

    var containerClient = new ContainerApiFactory(this.type);
    containerClient.createContainer(this);
    return containerClient.startContainer(this);
};

Container.prototype.shutdown = function () {

};

Container.prototype.destroy = function () {
    if (!this.getConfigurationEntry('Id')) {
        return Q.reject('container is not created yet');
    }

    return containerClient.deleteContainer(this);
};

Container.prototype.restart = function () {

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
        case "Created":
        case "CREATED":
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
        case "Running":
        case "RUNNING":
            return models
                .Container
                .update({
                    state: "running",
                    volumes: JSON.stringify(self.getConfigurationEntry('Binds'))
                },{
                    where: { id: self.getConfigurationEntry('id') }
                }).then(log.info, log.error);
        case "stop":
        case "Stop":
        case "STOP":
            return models
                .Container
                .update({
                    state: "stop"
                },{
                    where: { id: self.getConfigurationEntry('id') }
                }).then(log.info, log.error);
        default :
            return Q.reject('unknown state ' + state);
    }

};


/*--------------SAMPLE----------------*/
/**
 * Run container
 *
 * run command contain create an start command
 *
 * @param config
 * @returns {*|promise}
 */
Container.prototype.runContainer = function () {
    var deferred = Q.defer(),
        self = this;

    this.createContainer(this.configuration)
        .then(function (info) {
            config['id'] = info.message.Id;

            self.startContainer(config)
                .then(function (info) {
                    log.info(info);

                    info['id'] = config.id;
                    deferred.resolve(info);
                }, function (error) {
                    log.error(error);
                    deferred.reject(error);
                });

        }, deferred.reject);

    return deferred.promise;
};

/**
 * Execute a command on container
 *
 * Connect to container with ssh service and run command
 *
 * @param ip
 * @param command
 */
Container.prototype.execOnContainer = function (ip, command) {
    var deferred = Q.defer(),
        ssh = new SshClient({
            host: ip,
            username: 'root',
            privateKey: config.container_private_key
        });

    ssh.connect().then(function () {
        ssh.exec(command).then(function (result) {
            if (result.stderr) {
                deferred.reject(result.stderr);
            }
            deferred.resolve(result.stdout);

        }, deferred.reject).finally(function () {
            ssh.exec('exit');
        });

        return deferred.promise;
    });
};

module.exports = Container;
