var _           = require('underscore'),
    Q           = require('q'),
    path        = require('path'),
    log         = require(path.resolve(__dirname, '../debug/log')),
    ContainerClient= require('./manager/docker-client');

function Repository(targetServerConfig) {
    this.targetServerConfig = targetServerConfig;
    this.containerClient = new ContainerClient();
}

/**
 * Get container info
 *
 * @param identifier
 * @returns {Bluebird.Promise|*}
 */
Repository.prototype.containerInfo = function (identifier)
{
    return this.containerClient
        .buildInfoAction(identifier)
        .executeOn(this.targetServerConfig)
        .then(log.trace, log.error);
};

/**
 * Get list of images
 *
 * Get list of image form docker API
 *
 * @returns {Bluebird.Promise|*}
 */
Repository.prototype.images = function ()
{
    return this.containerClient
        .buildListImagesAction()
        .executeOn(this.targetServerConfig)
        .then(log.trace ,log.error);
};

module.exports = Repository;
