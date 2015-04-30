var _           = require('underscore'),
    Q           = require('q'),
    path        = require('path'),
    DockerClient= require('./docker-client'),
    repository  = require('../repository'),
    log         = require(path.resolve(__dirname, '../../debug/log')),
    config      = require(path.resolve(__dirname, '../../../config'));

function Manager(type) {
    switch (type) {
        case 'docker':
            this.type = 'docker';
            this.containerClient = new DockerClient();
            break;
        default:
            this.type = 'docker';
            this.containerClient = new DockerClient();
    }
}

/**
 * return manager type
 *
 * Container manager can be moderator container technology
 * today we use docker only
 *
 * @returns {*|string}
 */
Manager.prototype.type = function () {
    return this.type;
};

/**
 * Return target server configuration to send request
 *
 * @returns {{api: string}}
 */
Manager.prototype.targetServerConfig = function () {
    // TODO: in future version this method change by a class that it will be decide which server must be responsible for this request
    return {
        api: config.docker_server
    }
};

/*{
 image: IMAGE_NAME,
 hostname: HOSTNAME,
 name: NAME
 ports: [
 PORT, PORT, ...
 ],
 volumes: [
 "/tmp:/app/folder",
 "/tmp:/app/folder",
 ...
 ]
 }*/

/**
 * Create container
 *
 * @param opt
 *      a Container Object
 * @returns {Bluebird.Promise|*}
 */
Manager.prototype.createContainer = function (opt) {
    return this.containerClient
        .buildCreateAction()
        .options(opt)
        .executeOn(this.targetServerConfig())
        .then(function (response) {
            return repository.containerInfo(response.result.Id).then(function (configuration) {

                return configuration;

            }, log.error);

        },log.error);
};

/**
 * Start the created container
 *
 * @param opt
 * @returns {Bluebird.Promise|*}
 */
Manager.prototype.startContainer = function (opt) {
    return this.containerClient
        .buildStartAction()
        .options(opt)
        .executeOn(this.targetServerConfig())
        .then(function (response) {
            return repository.containerInfo(response.result.Id).then(function (configuration) {

                return configuration;

            }, log.error);

        }, log.error);
};

/**
 * Stop the container
 *
 * @param identifier
 * @returns {Bluebird.Promise|*}
 */
Manager.prototype.stopContainer = function (identifier) {
    return this.containerClient
        .buildStopAction(identifier)
        .executeOn(this.targetServerConfig())
        .then(log.info, log.error);
};

/**
 * Remove container
 *
 * @param opt
 * @returns {Bluebird.Promise|*}
 */
Manager.prototype.removeContainer = function (opt) {
    return this.containerClient
        .buildRemoveAction()
        .options(opt)
        .executeOn(this.targetServerConfig())
        .then(log.info, log.error);
};


module.exports = new Manager();
