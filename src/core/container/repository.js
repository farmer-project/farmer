var _           = require('underscore'),
    Q           = require('q'),
    path        = require('path'),
    log         = require(path.resolve(__dirname, '../debug/log')),
    config      = require(path.resolve(__dirname, '../../config')),
    ContainerClient= require('./manager/docker-client');

function Repository() {
    this.containerClient = new ContainerClient();
}

/**
 * Return target server configuration to send request
 *
 * @returns {{api: string}}
 */
Repository.prototype.targetServerConfig = function () {
    // TODO: in future version this method change by a class that it will be decide which server must be responsible for this request
    return {
        api: config.docker_server
    }
};

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
        .executeOn(this.targetServerConfig())
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
        .executeOn(this.targetServerConfig())
        .then(log.trace ,log.error);
};

module.exports = new Repository();
