var _ = require('underscore'),
    Q = require('q'),
    DockerClient = require('./docker-client'),
    models = require('../models'),
    LogCenter = require('../log-center');

function ContainerManager() {

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
ContainerManager.prototype.runContainer = function (config)
{
    var deferred = Q.defer(),
        self = this;

    this.createContainer(config)
        .then(function (info) {
            config['id'] = info.message.Id;

            self.startContainer(config)
                .then(function (info) {

                    console.log('info: ', info);

                    info['id'] = config.id;
                    deferred.resolve(info);
                }, function (error) {

                    console.log('error: ', error);

                    deferred.reject(error);
                });
        }, function (error) {

            console.log('wow Error: ', error);

            deferred.reject(error);
        })
    ;


    return deferred.promise;
};

ContainerManager.prototype.createContainer = function (config)
{
    var deferred = Q.defer(),
        reqConfig = _.clone(config),
        ports = (config.HostConfig.PublishAllPorts) ?
            JSON.stringify(config.ExposedPorts) : "";

        // our manual extended information
        delete config.Type;
        delete config.Metadata;

    DockerClient
        .buildCreateAction(config)
        .execute()
        .then(function (info) {

            LogCenter.info("Container Create");
            LogCenter.debug(reqConfig);

            models
                .Container
                .create({
                    "id": info.message.Id,
                    "name": reqConfig.Name,
                    "ports": ports,
                    "type": reqConfig.Type,
                    "state": "created",
                    "metadata": reqConfig.Metadata,
                    "request": JSON.stringify(reqConfig)
                }).complete(function (err, container) {
                    if (!err) {
                        LogCenter.info("Insert in table");
                    } else {
                        LogCenter.error("Insert in container table");
                        LogCenter.error(err);
                    }

                    deferred.resolve(info);
                });

        }, function (error) {

            LogCenter.error("Create container");
            LogCenter.error(error);

            deferred.reject(error);
        })
    ;

    return deferred.promise;
};

ContainerManager.prototype.startContainer = function (config)
{
    return DockerClient
        .buildStartAction(config.id)
        .setConfig(config.HostConfig)
        .execute()
        .then(function (info) {
            return models
                .Container
                .update({
                    "state": "running",
                    "volumes": JSON.stringify(config.HostConfig.Binds)
                },{
                    where: { id: config.id }
                }).then(function (info) {
                    LogCenter.info("container start");
                    LogCenter.debug(info);

                }, function (error) {
                    LogCenter.error("Update Error");
                    LogCenter.error(error);
                })
            ;
        })
    ;
};


ContainerManager.prototype.getContainerInfo = function (identifier)
{
    return DockerClient
        .buildInfoAction(identifier)
        .execute()
        .then(function (info) {
            LogCenter.debug("Fetch " + identifier + " container info");
        }, function (error) {
            LogCenter.error("Container ID/Name " + identifier + " not found");
            LogCenter.error(error);
        })
    ;
};

ContainerManager.prototype.getListImages = function ()
{
    return DockerClient
        .buildListImagesAction()
        .execute()
        .then(function (info) {
            LogCenter.debug("Fetch images list");
        }, function (error) {
            LogCenter.error("Error on fetch images list");
            LogCenter.error(error);
        })
    ;
};

ContainerManager.prototype.deleteContainer = function (config)
{
    var self = this;

    return this.stopContainer(config.id)
        .then(function (info) {
            return self.removeContainer(config);
        })
    ;
};

ContainerManager.prototype.stopContainer = function (identifier)
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
                    LogCenter.info("container " + containerId + " stop");
                    LogCenter.debug(info);

                }, function (error) {
                    LogCenter.error("Stop " + containerId + " update Error");
                    LogCenter.error(error);
                });

        }, function (error) {
            LogCenter.error("Can't stop container " + containerId);
            LogCenter.error(error);
        })
    ;
};

ContainerManager.prototype.removeContainer = function (config)
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
                    LogCenter.info("container " + config.id + " remove");
                    LogCenter.debug(info);

                }, function (error) {
                    LogCenter.error("Remove " + config.id + " update Error");
                    LogCenter.error(error);
                });

        }, function (error) {
            LogCenter.error("Remove " + config.id + " Error");
            LogCenter.error(error);
        })
    ;
};

module.exports = new ContainerManager();
