var Q = require('q'),
    config = require('../../config'),
    request = require('request');

function StopAction () {
    this.containerId = null;
}

StopAction.prototype.setContainerId = function (containerId)
{
    this.containerId = containerId;
    return this;
};

StopAction.prototype.execute = function ()
{
    if (typeof this.containerId !== 'string' || !this.containerId) {
        throw new Error('Container ID must be set when getting container info.');
    }

    var deferred = Q.defer(),
        self = this;

    var options = {
        uri: config.docker_server + '/containers/' + this.containerId + '/stop',
        method: "POST"
    };

    request(options, function (error, response, body) {

        if (!error && ( response.statusCode == 204 || response.statusCode == 304)) {
            // 204 – no error
            // 304 – container already stopped
            deferred.resolve({
                code: response.statusCode,
                message: {
                    "id": self.containerId
                }
            });

        } else {
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

module.exports = StopAction;