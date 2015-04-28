var _           = require('underscore'),
    Q           = require('q'),
    path        = require('path'),
    DockerClient= require('./docker-client'),
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
 * @param containerObj
 * @returns {*|promise}
 */
ContainerClient.prototype.createContainer = function (containerObj) {
    var configuration = containerObj.getConfigurationSync();

    return DockerClient
        .buildCreateAction(configuration)
        .execute()
        .then(function (info) {
            return info.Id;
        }, log.error);
};

/**
 * Start container
 *
 * @param config
 * @returns {Bluebird.Promise|*}
 */
ContainerClient.prototype.startContainer = function (config) {
    return DockerClient
        .buildStartAction(config.id)
        .setConfig(config.HostConfig)
        .execute()
        .then(function (info) {
            log.info("container start").debug(info);

            return models
                .Container
                .update({
                    state: "running",
                    volumes: JSON.stringify(config.HostConfig.Binds)
                },{
                    where: { id: config.id }
                }).then(function (info) {
                    log.trace("container "+ config.id +" info update");

                }, log.error);
        });
};

/**
 * Delete Container
 *
 * @param config
 * @returns {Bluebird.Promise|*}
 */
ContainerClient.prototype.deleteContainer = function (config)
{
    var self = this;

    return this.stopContainer(config.id)
        .then(function (info) {
            return self.removeContainer(config);
        })
        ;
};

/**
 * Stop container
 *
 * @param identifier
 * @returns {Bluebird.Promise|*}
 */
ContainerClient.prototype.stopContainer = function (identifier)
{
    return DockerClient
        .buildStopAction(identifier)
        .execute()
        .then(function (info) {

            return models
                .Container
                .update({
                    "state": "stop"
                },{
                    where: { id: identifier }
                }).then(function (info) {
                    log.info("container " + containerId + " stop").debug(info);

                }, function (error) {
                    log.error("Stop " + containerId + " update Error").error(error);
                });

        }, function (error) {
            log.error("Can't stop container " + containerId).error(error);
        });

};

/**
 * Remove container
 *
 * @param config
 * @returns {Bluebird.Promise|*}
 */
ContainerClient.prototype.removeContainer = function (config)
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
