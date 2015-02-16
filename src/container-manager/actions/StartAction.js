var Q = require('q'),
    config = require('../../config'),
    request = require('request');

function StartAction () {
    this.id = "";
    this.volumes = [];

}

StartAction.prototype.setId = function (id)
{
    this.id = id;

    return this;
};

StartAction.prototype.addVolume = function (volumes)
{
    if (typeof volumes === "undefined") {
        volumes = [];
    }

    if (typeof volumes === "string") {
        volumes = [volumes];
    }

    this.volumes = this.volumes.concat(volumes);

    return this;
};

StartAction.prototype.execute = function ()
{
    var deferred = Q.defer();

    var options = {
        uri: config.docker_server + '/containers/' + this.id + '/start',
        method: "POST",
        json: {
            "PublishAllPorts": true,
            "NetworkMode": "bridge",
            "Binds": this.volumes
        }
    };

    request(options, function (error, response, body) {

        if (!error && response.statusCode == 204) {
            // 204 – no error
            deferred.resolve({
                code: response.statusCode,
                message: this.id
            });

        } else {
            // 304 – container already started
            // 404 – no such container
            // 500 – server error
            deferred.reject({
                code: response.statusCode,
                message: error
            });
        }

    });

    return deferred.promise;
};

module.exports = StartAction;