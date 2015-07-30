var _           = require('underscore'),
    Q           = require('q'),
    path        = require('path'),
    log         = require(path.resolve(__dirname, '../debug/log')),
    ContainerClient = require('./manager/docker-client');

/**
 *
 * @param {Object} targetServerConfig - Target server config
 * @constructor
 */
function Repository(targetServerConfig) {
    this.targetServerConfig = targetServerConfig;
    this.containerClient = new ContainerClient();
}

/**
 * Get container info
 * @param {string} identifier
 * @returns {Bluebird.Promise|*}
 */
Repository.prototype.containerInfo = function (identifier)
{
    return this.containerClient
        .buildInfoAction(identifier)
        .executeOn(this.targetServerConfig)
        .then(function (response) {return Q.when(response.result); })
        .tap(log.trace)
        .catch(log.error);
};

/**
 * Get list of image
 * @returns {Bluebird.Promise|*}
 */
Repository.prototype.images = function ()
{
    return this.containerClient
        .buildListImagesAction()
        .executeOn(this.targetServerConfig)
        .then(function (response) {return Q.when(response.result); })
        .tap(log.trace)
        .catch(log.error);
};

module.exports = Repository;
