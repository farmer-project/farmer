'use strict';

var Q       = require('q'),
    urljoin = require('url-join'),
    request = require('request'),
    querystring = require('querystring');

function StopAction (id) {
    this.id = id;
    this.queryParameters = '';
}

/**
 * Set request option
 *
 * @param opt
 * @returns {StopAction}
 */
StopAction.prototype.options = function (opt) {
    if (opt.t) this.queryParameters = '?' + querystring.stringify({t: opt.t});

    return this;
};

/**
 * Stop a container
 *
 * Stop container work with docker API
 * https://docs.docker.com/v1.5/reference/api/docker_remote_api_v1.17/#stop-a-container
 *
 * @returns {*|promise}
 */
StopAction.prototype.executeOn = function (serverConfig) {
    var deferred = Q.defer(),
        self = this,
        options = {
            uri: urljoin(serverConfig.api, '/containers/', this.id, '/stop', this.queryParameters),
            method: "POST"
        };

    request(options, function (error, response, body) {
        if (!error && ( response.statusCode == 204 || response.statusCode == 304)) {
            // 204 – no error
            // 304 – container already stopped
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

module.exports = StopAction;
