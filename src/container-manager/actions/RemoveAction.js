var Q = require('q'),
    config = require('../../config'),
    request = require('request');

function RemoveAction () {
    this.containerId = null;
    this.removeVolume = 0;
}

RemoveAction.prototype.setContainerId = function (containerId)
{
    this.containerId = containerId;
    return this;
};

RemoveAction.prototype.removeVolumeFunc = function (removeVolume)
{
    if (typeof removeVolume !== "undefined" && removeVolume > 0) {
        this.removeVolume = 1;
    }

    return this;
};

RemoveAction.prototype.execute = function ()
{
    if (typeof this.containerId !== 'string' || !this.containerId) {
        throw new Error('Container ID must be set when getting container info.');
    }

    var deferred = Q.defer(),
        self = this;

    var options = {
        uri: config.docker_server + '/containers/' + this.containerId + '?force=1&v=' + this.removeVolume,
        method: "DELETE"
    };

    request(options, function (error, response, body) {

        if (!error && response.statusCode == 204) {
            // 204 – no error
            deferred.resolve({
                code: response.statusCode,
                message: ""
            });

        } else {
            // 400 – bad parameter
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

module.exports = RemoveAction;