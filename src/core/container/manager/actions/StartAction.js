'use strict';

var Q       = require('q'),
    url     = require('url'),
    request = require('request');

function StartAction () {
    this.configuration = {};
}

/**
 * Set container config to start
 *
 * @param HostConfig
 * @returns {StartAction}
 */
StartAction.prototype.options = function (opt) {
    this.configuration = opt;

    if (!opt.NetworkMode) {
        this.configuration["NetworkMode"] = "bridge";
    }

    return this;
};

/**
 * Start a container
 *
 * @returns {*|promise}
 */
StartAction.prototype.executeOn = function (serverConfig)
{
    var deferred = Q.defer(),
        id = this.configuration.Id,
        options = {
            uri: url.resolve(serverConfig.api, '/containers/', id, '/start'),
            method: "POST",
            json: this.configuration // ID is extra data!!
        };

    request(options, function (error, response, body) {
        if (!error && response.statusCode == 204) {
            deferred.resolve({
                code: response.statusCode,
                result: { Id: id },
                message: 'successful'
            });

        } else {
            var errorMsg = "";
            if( response.statusCode == 304) errorMsg = "container already started";
            if( response.statusCode == 404) errorMsg = "no such container";
            if( response.statusCode == 500) errorMsg = "docker server error";
            deferred.reject({
                code: response.statusCode,
                result: null,
                message: errorMsg
            });
        }

    });

    return deferred.promise;
};

module.exports = StartAction;