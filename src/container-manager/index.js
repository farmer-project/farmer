var Q = require('q'),
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

            console.log('config: ', config);

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
    var deferred = Q.defer();

    DockerClient
        .buildCreateAction(config)
        .execute()
        .then(function (info) {

            LogCenter.info("Container Create");
            LogCenter.debug(config);

            models
                .Container
                .create({
                    "id": info.message.Id,
                    "name": config.name,
                    "ports": JSON.stringify(config.ports),
                    "type": config.type,
                    "state": "created"
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
    var deferred = Q.defer();

    DockerClient
        .buildStartAction(config.id)
        .setConfig(config.HostConfig)
        .execute()
        .then(function (info) {
            console.log('start in Container manager THEN');
            models
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
                });

            deferred.resolve(info);
        }, function (error) {
            deferred.reject(error);
        })
    ;

    return deferred.promise;
};


ContainerManager.prototype.getContainerInfo = function (identifier)
{
    var deferred = Q.defer();

    DockerClient
        .buildInfoAction(identifier)
        .execute()
        .then(function (info) {
            LogCenter.debug("Fetch " + identifier + " container info");
            deferred.resolve(info);
        }, function (error) {
            LogCenter.error("Container ID/Name " + identifier + " not found");
            LogCenter.error(error);
            deferred.reject(error);
        })
    ;

    return deferred.promise;
};

ContainerManager.prototype.getListImages = function ()
{
    var deferred = Q.defer();

    DockerClient
        .buildListImagesAction()
        .execute()
        .then(function (info) {
            LogCenter.debug("Fetch images list");
            deferred.resolve(info);
        }, function (error) {
            LogCenter.error("Error on fetch images list");
            LogCenter.error(error);
            deferred.reject(error);
        })
    ;

    return deferred.promise;
};

ContainerManager.prototype.deleteContainer = function (config)
{
    var deferred = Q.defer(),
        self = this;

    this.stopContainer(config.id)
        .then(function (info) {

            self.removeContainer(config)
                .then(function (info) {

                    deferred.resolve(info);
                }, function (error) {
                    deferred.reject(error);
                });
        }, function (error) {
            deferred.reject(error);
        });


    return deferred.promise;
};

ContainerManager.prototype.stopContainer = function (identifier)
{
    var deferred = Q.defer();

    DockerClient
        .buildStopAction(identifier)
        .execute()
        .then(function (info) {

            models
                .Container
                .update({
                    "state": "stop"
                },{
                    where: { id: containerId }
                }).then(function (info) {
                    LogCenter.info("container " + containerId + " stop");
                    LogCenter.debug(info);

                }, function (error) {
                    LogCenter.error("Stop " + containerId + " update Error");
                    LogCenter.error(error);
                });

            deferred.resolve(info);
        }, function (error) {
            LogCenter.error("Can't stop container " + containerId);
            LogCenter.error(error);
            deferred.reject(error);
        })
    ;

    return deferred.promise;
};

ContainerManager.prototype.removeContainer = function (config)
{
    var deferred = Q.defer();
    console.log("removeVolume".red, config.removeVolume);

    DockerClient
        .buildRemoveAction(config.id)
        .removeVolumeFunc(config.removeVolume)
        .execute()
        .then(function (info) {

            models
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

            deferred.resolve(info);
        }, function (error) {
            LogCenter.error("Remove " + config.id + " Error");
            LogCenter.error(error);
            deferred.reject(error);
        })
    ;

    return deferred.promise;
};

module.exports = new ContainerManager();
