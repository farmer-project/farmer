var _            = require('underscore'),
    Q            = require('q'),
    path         = require('path'),
    Repository   = require('../Repository'),
    log          = require(path.resolve(__dirname, '../../debug/log')),
    config       = require(path.resolve(__dirname, '../../../config'));

/**
 * @param {string} type - Container manager type
 * @constructor
 */
function Manager(type) {
    this.type = type;
    var ContainerClient = require('./' + type + '-client');
    this.containerClient = new ContainerClient();
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
Manager.prototype.targetServer = function (server) {
    // TODO: in future version this method change by a class that it will be decide which server must be responsible for this request
    if (!server) {
        // decided to which server
        return {
            tag: 'server_a',
            config: {
                api: config.SERVERS['server_a'][this.type + '_api']
            }
        }

    } else {
        return {
            tag: server,
            config: {
                api: config.SERVERS[server][this.type + '_api']
            }
        }
    }

};

/**
 * Create container
 * @param {Object} opt - A container Object
 * @returns {Bluebird.Promise|*}
 */
Manager.prototype.createContainer = function (opt) {
    var targetServer = this.targetServer();

    return this.containerClient
        .buildCreateAction()
        .options(opt)
        .executeOn(targetServer.config)
        .then(function (response) {
            var repository = new Repository(targetServer.config);
            return repository.containerInfo(response.result.Id).then(function (containerInfo) {

                return Q.when([targetServer.tag, containerInfo]);

            }).catch(log.error);

        }).catch(log.error);
};

/**
 * Start the created container
 * @param {string} server - Server tag name
 * @param {Object} opt - Start container options
 * @returns {Bluebird.Promise|*}
 */
Manager.prototype.startContainer = function (server, opt) {
    var targetServer = this.targetServer(server);

    return this.containerClient
        .buildStartAction()
        .options(opt)
        .executeOn(targetServer.config)
        .then(function (response) {
            var repository = new Repository(targetServer.config);
            return repository.containerInfo(response.result.Id).then(function (res) {

                return res;

            }).catch(log.error);

        }).catch(log.error);
};

/**
 * Stop the container
 * @param {string} server - server tag
 * @param {string} identifier - Container identifier
 * @param {Object} opt - Stop container options
 * @returns {Bluebird.Promise|*}
 */
Manager.prototype.stopContainer = function (server, identifier, opt) {
    var targetServer = this.targetServer(server);

    return this.containerClient
        .buildStopAction(identifier)
        .options(opt)
        .executeOn(targetServer.config)
        .then(function (res) {
            log.trace(res);
            return Q.when(res);

        }, function (err) {
            log.error(err);
            return Q.reject(err);

        })
    ;
};

/**
 * Remove container
 * @param {string} server - Server tag name
 * @param {string} identifier - Container identifier
 * @param {Object} opt - Remove container options
 * @returns {Bluebird.Promise|*}
 */
Manager.prototype.removeContainer = function (server, identifier, opt) {
    var targetServer = this.targetServer(server);

    return this.containerClient
        .buildRemoveAction(identifier)
        .options(opt)
        .executeOn(targetServer.config)
        .then(function (res) {
            log.trace(res);
            return Q.when(res);

        }, function (err) {
            log.error(err);
            return Q.reject(err);

        })
    ;
};

/**
 * Restart container
 * @param {string} server - Server tag name
 * @param {string} identifier - Container identifier
 * @param {Object} opt - Remove container options
 * @returns {Bluebird.Promise}
 */
Manager.prototype.restartContainer = function (server, identifier, opt) {
    var targetServer = this.targetServer(server);

    return this.containerClient
        .buildRestartAction(identifier)
        .options(opt)
        .executeOn(targetServer.config)
        .then(function (res) {
            log.trace(res);
            return Q.when(res);

        }, function (err) {
            log.error(err);
            return Q.reject(err);

        })
    ;
};

module.exports = Manager;
