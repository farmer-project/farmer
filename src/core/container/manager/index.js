var _            = require('underscore'),
    Q            = require('q'),
    path         = require('path'),
    Repository   = require('../Repository'),
    DockerClient = require('./docker-client'),
    log          = require(path.resolve(__dirname, '../../debug/log')),
    config       = require(path.resolve(__dirname, '../../../config'));

/**
 * @param {string} type - Container manager type
 * @constructor
 */
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
 * Container manager can be moderator container technology
 * @returns {*|string}
 */
Manager.prototype.type = function () {
    return this.type;
};

/**
 * Return target server configuration to send request
 * @returns {{api: string}}
 */
Manager.prototype.targetServerConfig = function () {
    // TODO: in future version this method change by a class that it will be decide which server must be responsible for this request
    return {
        api: config.CONTAINER_SERVER_API
    }
};

/**
 * Create container
 * @param {Object} opt - A container Object
 * @returns {Bluebird.Promise|*}
 */
Manager.prototype.createContainer = function (opt) {
    var targetServerConfig = this.targetServerConfig();

    return this.containerClient
        .buildCreateAction()
        .options(opt)
        .executeOn(targetServerConfig)
        .then(function (response) {
            var repository = new Repository(targetServerConfig);
            return repository.containerInfo(response.result.Id).then(function (containerInfo) {
                return containerInfo;

            }).catch(log.error);

        }).catch(log.error);
};

/**
 * Start the created container
 * @param {Object} opt - Start container options
 * @returns {Bluebird.Promise|*}
 */
Manager.prototype.startContainer = function (opt) {
    var targetServerConfig = this.targetServerConfig();
    return this.containerClient
        .buildStartAction()
        .options(opt)
        .executeOn(targetServerConfig)
        .then(function (response) {
            console.log('start response >>>', response);
            var repository = new Repository(targetServerConfig);
            return repository.containerInfo(response.result.Id).then(function (res) {

                return res.result;

            }).catch(log.error);

        }).catch(log.error);
};

/**
 * Stop the container
 * @param {string} identifier - Container identifier
 * @param {Object} opt - Stop container options
 * @returns {Bluebird.Promise|*}
 */
Manager.prototype.stopContainer = function (identifier, opt) {
    return this.containerClient
        .buildStopAction(identifier)
        .options(opt)
        .executeOn(this.targetServerConfig())
        .tap(log.trace)
        .catch(log.error);
};

/**
 * Remove container
 * @param {Object} opt - Remove container options
 * @returns {Bluebird.Promise|*}
 */
Manager.prototype.removeContainer = function (opt) {
    return this.containerClient
        .buildRemoveAction()
        .options(opt)
        .executeOn(this.targetServerConfig())
        .then(log.info, log.error);
};

/**
 * Restart container
 * @param {string} identifier - container identifier
 * @returns {Bluebird.Promise}
 */
Manager.prototype.restartContainer = function (identifier) {
    return this.containerClient
        .buildRestartAction(identifier)
        .executeOn(this.targetServerConfig())
        .tap(log.trace)
        .catch(log.error);
};

module.exports = Manager;
