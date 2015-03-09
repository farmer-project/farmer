var Q = require('q'),
    config = require('../../config'),
    request = require('request');

function StopAction (identifier) {
    this.identifier = identifier;
}

StopAction.prototype.execute = function ()
{
    if (typeof this.identifier !== 'string' || !this.identifier) {
        throw new Error('Container identifier must be set when getting container info.');
    }

    var deferred = Q.defer(),
        self = this;

    var options = {
        uri: config.docker_server + '/containers/' + this.identifier + '/stop',
        method: "POST"
    };

    request(options, function (error, response, body) {

        if (!error && ( response.statusCode == 204 || response.statusCode == 304)) {
            // 204 – no error
            // 304 – container already stopped
            deferred.resolve({
                code: response.statusCode,
                message: {
                    "id": self.identifier
                }
            });

        } else {
            var errorMessage = "";
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

module.exports = StopAction;