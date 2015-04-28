'use strict';

var Q               = require('q'),
    path            = require('path'),
    deasync         = require('deasync'),
    models          = require('../models'),
    containerClient = require('./container-api-client'),
    repository      = require('./repository');


function Container (identifier) {
    this.identifier = identifier;
    this.configuration = 'undefined';
    this.metadata = {};
    this.state = 'created';
}

/**
 * Set container config
 *
 * Any container can have their configuration and external information as metadata
 *
 * @param configuration
 */
Container.prototype.setConfiguration = function (configuration) {
    this.metadata = configuration['metadata'];
    delete configuration.metadata;

    this.configuration = configuration;
};

/**
 * Get container configuration
 *
 * Get container configuration based on container identifier.
 * this identifier can be container name or id
 *
 * @returns {*|promise}
 */
Container.prototype.getConfiguration = function () {
    var self = this;
    if (!this.configuration) {
        return repository.getContainerInfo(this.identifier).then(function (config) {
            return models
                .Container
                .find({
                    where: {id: self.identifier}
                }).then(function (container) {

                    self.metadata = container.metadata;
                    return self.configuration = config[0];
                });
        });
    }

    return Q.when(this.configuration);
};

/**
 * Get container configuration synchronise
 *
 * @returns {string|*}
 */
Container.prototype.getConfigurationSync = function () {
    var self = this,
        done = false;
    if (!this.configuration) {
        repository.containerInfo(this.identifier).then(function (config) {
            return models
                .Container
                .find({
                    where: {id: self.identifier}
                }).then(function (container) {

                    self.metadata = container.metadata;
                    self.configuration = config[0];
                    done = true;
                });
        });
        while(!done) {
            deasync.runLoopOnce();
        }
    }

    return this.configuration;
};

/**
 * Update container configuration entry data
 *
 * @param entry
 * @param data
 */
Container.prototype.updateConfiguration = function (entry, data) {
    var config = this.getConfigurationSync(),
        found = [];
    var recurse = function (obj, key) {
        for (var p in obj) {
            if (p === key) {
                obj[p] = data;
            }
            if (typeof obj[p] === 'object') recurse(obj[p], key);
        }
    };
    recurse(config, entry);
    return found;
};

/**
 * Return container configuration entry
 *
 * @param entryName
 * @returns {Array}
 */
Container.prototype.getConfigurationEntry = function (entryName) {
    var config = this.getConfigurationSync(),
        found = [];
    var recurse = function (obj, key) {
        for (var p in obj) {
            if (p === key) {
                found.push(obj[p]);
            }
            if (typeof obj[p] === 'object') recurse(obj[p], key);
        }
    };
    recurse(config, entryName);
    return found;
};

/**
 * Get container metadata
 *
 * @returns {*}
 */
Container.prototype.getMetadata = function () {
    var self = this;
    if (!this.configuration) {
        return this.getConfiguration().then(function () {
            return self.metadata;
        });
    }

    return Q.when(self.metadata);
};

/**
 * Get container metadata synchronise
 *
 * @returns {*}
 */
Container.prototype.getMetadataSync = function () {
    var self = this,
        done = false;
    if (!this.configuration) {
        return this.getConfiguration().then(function () {
            done = true;
        });
        while(!done) {
            deasync.runLoopOnce();
        }
    }

    return self.metadata;
};

/**
 * Create configured container
 *
 * @returns {*}
 */
Container.prototype.create = function () {
    if (!this.configuration.Image) {
        return Q.reject('Image should be set when building Create command.');
    }
    var self = this;
    return containerClient
        .createContainer(this)
        .then(self.save);
};


Container.prototype.save = function () {
    models
        .Container
        .create({
            id: info.result.Id,
            name: configuration.Name,
            ports: ports,
            image: configuration.Image,
            metadata: metadata,
            state: "created",
            request: JSON.stringify(configuration)
        }).complete(function (err, container) {
            if (!error) {
                log.info("Insert in table");
                deferred.resolve(info);
            } else {
                log.error(error);
                deferred.reject(error);
            }
        });
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
