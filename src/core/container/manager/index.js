var _           = require('underscore'),
    Q           = require('q'),
    path        = require('path'),
    Repository  = require('../Repository'),
    DockerClient= require('./docker-client'),
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

/**
 * Create container
 *
 * @param opt
 *      a Container Object
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
            return repository.containerInfo(response.result.Id).then(function (res) {

                return res.result;

            }).catch(log.error);

        }).catch(log.error);
};

/**
 * Start the created container
 *
 * @param opt
 * @returns {Bluebird.Promise|*}
 */
Manager.prototype.startContainer = function (opt) {
    var targetServerConfig = this.targetServerConfig();
    console.log('<<<<<<<<<>>>>>>>>>>>>>> opt', opt);
    return this.containerClient
        .buildStartAction()
        .options(opt)
        .executeOn(targetServerConfig)
        .then(function (response) {
            var repository = new Repository(targetServerConfig);
            return repository.containerInfo(response.result.Id).then(function (res) {

                return res.result;

            }).catch(log.error);

        }).catch(log.error);
};

/**
 * Stop the container
 *
 * @param identifier
 * @param opt
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

Manager.prototype.restartContainer = function (identifier) {
    return this.containerClient
        .buildRestartAction(identifier)
        .executeOn(this.targetServerConfig())
        .tap(log.trace)
        .catch(log.error);
};

module.exports = Manager;
