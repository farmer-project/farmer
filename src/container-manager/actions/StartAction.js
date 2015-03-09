var Q = require('q'),
    config = require('../../config'),
    request = require('request');

function StartAction (identifier) {
    this.identifier = identifier;
    this.HostConfig = {};
}

StartAction.prototype.setConfig = function (HostConfig) {
    this.HostConfig = HostConfig;
    this.HostConfig["NetworkMode"] = "bridge";

    this.HostConfig["PublishAllPorts"] =
        typeof this.HostConfig["PublishAllPorts"] !== 'undefined' ?
            this.HostConfig["PublishAllPorts"] : true;

    return this;
};

StartAction.prototype.execute = function ()
{
    var deferred = Q.defer();

    var options = {
        uri: config.docker_server + '/containers/' + this.identifier + '/start',
        method: "POST",
        json: this.HostConfig
    };

    request(options, function (error, response, body) {

        if (!error && response.statusCode == 204) {
            deferred.resolve({
                code: response.statusCode,
                message: this.identifier
            });

        } else {
            var errorMessage = "";
            if( response.statusCode == 304) errorMessage = "container already started";
            if( response.statusCode == 404) errorMessage = "no such container";
            if( response.statusCode == 500) errorMessage = "server error";
            deferred.reject({
                code: response.statusCode,
                message: error
            });
        }

    });

    return deferred.promise;
};

module.exports = StartAction;