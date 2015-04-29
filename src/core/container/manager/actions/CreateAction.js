'use strict';

var Q       = require('q'),
    url     = require('url'),
    request = require('request');

function CreateAction () {
    this.configuration = {};
    this.queryParamiters = '?';
}


CreateAction.prototype.options = function (opt) {
    if (opt.Name) {
        this.queryParamiters = url.resolve(this.queryParamiters, opt.Name);
        delete opt['Name'];
    }

    this.configuration = opt;
};

/**
 * Create container
 *
 * Create container by send request to docker create API
 * `POST /containers/create`
 * https://docs.docker.com/v1.5/reference/api/docker_remote_api_v1.17/#create-a-container
 *
 * @returns {*|promise}
 */
CreateAction.prototype.executeOn = function (serverConfig)
{
    var deferred = Q.defer(),
        options = {
            uri: url.resolve(serverConfig.docker_server, '/containers/create/', this.queryParamiters),
            method: 'POST',
            json: this.configuration
        };

    request(options, function (error, response, body) {
        if (!error && response.statusCode == 201) {
            // 201 – no error
            deferred.resolve({
                code: response.statusCode,
                result: body,
                message: 'successful'
            });

        } else {
            var errorMsg = "";
            if( response.statusCode == 404) errorMsg = "no such container";
            if( response.statusCode == 406) errorMsg = "impossible to attach (container not running)";
            if( response.statusCode == 500) errorMsg = "server error";
            deferred.reject({
                code: response.statusCode,
                result: null,
                message: errorMsg
            });
        }

    });

    return deferred.promise;
};

module.exports = CreateAction;
