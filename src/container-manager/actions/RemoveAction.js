var Q       = require('q'),
    config  = require(require('path').resolve(__dirname, '../../config')),
    request = require('request');

function RemoveAction (identifier) {
    this.identifier = identifier;
    this.removeVolume = 0;
}

RemoveAction.prototype.removeVolumeFunc = function (removeVolume)
{
    if (typeof removeVolume !== "undefined" && removeVolume > 0) {
        this.removeVolume = 1;
    }

    return this;
};

RemoveAction.prototype.execute = function ()
{
    if (typeof this.identifier !== 'string' || !this.identifier) {
        throw new Error('Container identifier must be set when getting container info.');
    }

    var deferred = Q.defer(),
        self = this;

    var options = {
        uri: config.docker_server + '/containers/' + this.identifier + '?force=1&v=' + this.removeVolume,
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
            var errorMessage = "";
            if( response.statusCode == 400) errorMessage = "bad parameter";
            if( response.statusCode == 404) errorMessage = "no such container";
            if( response.statusCode == 500) errorMessage = "server error";
            deferred.reject({
                code: response.statusCode,
                message: errorMessage
            });
        }

    });

    return deferred.promise;
};

module.exports = RemoveAction;