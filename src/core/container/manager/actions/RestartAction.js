'use strict';

var Q       = require('q'),
    url     = require('url'),
    urljoin = require('url-join'),
    request = require('request'),
    querystring = require('querystring');

function RestartAction (id) {
    this.id = id;
    this.queryParameters = '';
}

/**
 * Set request option
 *
 * @param opt
 * @returns {StopAction}
 */
RestartAction.prototype.options = function (opt) {
    if (opt.t) this.queryParameters = '?' + querystring.stringify({t: opt.t});

    return this;
};

/**
 * Restart a container
 *
 * Restart container work with docker API
 * https://docs.docker.com/v1.5/reference/api/docker_remote_api_v1.17/#restart-a-container
 *
 * @returns {*|promise}
 */
RestartAction.prototype.executeOn = function (serverConfig) {
    var deferred = Q.defer(),
        self = this,
        options = {
            uri: urljoin(serverConfig.api, '/containers/', this.id, '/restart', this.queryParameters),
            method: "POST"
        };

    request(options, function (error, response, body) {
        if (!error && ( response.statusCode == 204)) {
            // 204 – no error
            deferred.resolve({
                code: response.statusCode,
                result: { Id: self.id },
                message: 'successful'
            });

        } else {
            var errorMsg = "";
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

module.exports = RestartAction;
