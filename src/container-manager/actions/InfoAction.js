var Q = require('q'),
    config = require('../../config'),
    request = require('request');

function InfoAction (identifier) {
    this.identifier = identifier;
}

InfoAction.prototype.execute = function ()
{
    if (typeof this.identifier !== 'string' || !this.identifier) {
        throw new Error('Container ID must be set when getting container info.');
    }

    var deferred = Q.defer();

    var options = {
        uri: config.docker_server + '/containers/' + this.identifier + '/json',
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
            var error = "";
            if( response.statusCode == 404) error = "no such container";
            if( response.statusCode == 500) error = "server error";
            deferred.reject({
                code: response.statusCode,
                message: error
            });
        }

    });

    return deferred.promise;
};

module.exports = InfoAction;