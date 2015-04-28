var _           = require('underscore'),
    Q           = require('q'),
    containerClient= require('./container-api-client');

function Repository() {

}

/**
 * Get container info
 *
 * Get container info by id or name
 *
 * @param identifier
 * @returns {Bluebird.Promise|*}
 */
Repository.prototype.containerInfo = function (identifier)
{
    return containerClient.getContainerInfo(identifier);
};

/**
 * Get list of images
 *
 * @returns {Bluebird.Promise|*}
 */
Repository.prototype.images = function ()
{
    return containerClient.getImages();
};

module.exports = new Repository();
