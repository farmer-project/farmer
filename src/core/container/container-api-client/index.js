var _           = require('underscore'),
    Q           = require('q'),
    path        = require('path'),
    DockerClient= require('./docker-client'),
    repository  = require('../repository'),
    models      = require(path.resolve(__dirname, '../../models')),
    log         = require(path.resolve(__dirname, '../../debug/log')),
    config      = require(path.resolve(__dirname, '../../../config'));

function ContainerClient() {

}

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
 * @param container
 *      a Container Object
 * @returns {Bluebird.Promise|*}
 */
ContainerClient.prototype.createContainer = function (container) {
    var configuration = container.getConfigurationSync();

    return DockerClient
        .buildCreateAction(configuration)
        .execute()
        .then(function (response) {
            return repository.containerInfo(response.result.Id).then(function (configuration) {
                container.setConfiguration(configuration);
                container.setState('created');

                return container;
            }, log.error);

        },log.error);
};

/**
 * Start created container
 *
 * @param container
 * @returns {Bluebird.Promise|*}
 */
ContainerClient.prototype.startContainer = function (container) {
    var id = container.getConfigurationEntry('Id');

    return DockerClient
        .buildStartAction(id)
        .setConfig(container.getConfigurationEntry('HostConfig'))
        .execute()
        .then(function (response) {
            return repository.containerInfo(id).then(function (configuration) {
                container.setConfiguration(configuration);
                container.setState('running');

                return container;
            }, log.error);

        }, log.error);
};

/**
 * Delete Container
 *
 * @param config
 * @returns {Bluebird.Promise|*}
 */
ContainerClient.prototype.deleteContainer = function (container, rmVolume)
{
    return this.stopContainer(container)
        .then(this.removeContainer(container));
};

/**
 * Stop container
 *
 * @param container
 * @returns {Bluebird.Promise|*}
 */
ContainerClient.prototype.stopContainer = function (container)
{
    var id = container.getConfigurationEntry('Id');

    return DockerClient
        .buildStopAction(id)
        .execute()
        .then(function (info) {
            return container.setState('stop');

        },log.error);

};

/**
 * Remove container
 *
 * @param container
 * @returns {Bluebird.Promise|*}
 */
ContainerClient.prototype.removeContainer = function (container)
{
    return DockerClient
        .buildRemoveAction(config.id)
        .removeVolumeFunc(config.removeVolume)
        .execute()
        .then(function (info) {

            return models
                .Container
                .update({
                    "state": "remove"
                },{
                    where: { id: config.id }
                }).then(function (info) {
                    log.trace("container " + config.id + " remove")
                        .debug(info);

                }, function (error) {
                    log.trace("Remove " + config.id + " update Error")
                        .error(error);
                });

        }, function (error) {
            log.error("Remove " + config.id + " Error").error(error);
        })
        ;
};

/**
 * Get container info
 *
 * @param identifier
 * @returns {Bluebird.Promise|*}
 */
ContainerClient.prototype.getContainerInfo = function (identifier)
{
    return DockerClient
        .buildInfoAction(identifier)
        .execute()
        .then(log.trace, log.error);
};

/**
 * Get list of images
 *
 * Get list of image form docker API
 *
 * @returns {Bluebird.Promise|*}
 */
ContainerClient.prototype.getImages = function ()
{
    return DockerClient
        .buildListImagesAction()
        .execute()
        .then(log.trace ,log.error);
};


module.exports = new ContainerClient();
