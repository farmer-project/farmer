var Q = require('q'),
    config = require('../../config'),
    request = require('request');

function InfoAction () {
    this.containerId = null;
}

InfoAction.prototype.setContainerId = function (containerId)
{
    this.containerId = containerId;
    return this;
};

InfoAction.prototype.execute = function ()
{
    if (typeof this.containerId !== 'string' || !this.containerId) {
        throw new Error('Container ID must be set when getting container info.');
    }

    var deferred = Q.defer();

    var options = {
        uri: config.docker_server + '/containers/' + this.containerId + '/json',
        method: "GET"
    };

    request(options, function (error, response, body) {

        if (!error && response.statusCode == 200) {
            // 200 – no error
            deferred.resolve({
                code: response.statusCode,
                message: JSON.parse(body)
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

module.exports = InfoAction;