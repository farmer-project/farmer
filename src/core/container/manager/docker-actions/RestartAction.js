'use strict';

var Q           = require('q'),
    urljoin     = require('url-join'),
    request     = require('request'),
    querystring = require('querystring');

/**
 * @param {string} identifier -
 * @constructor
 */
function RestartAction (identifier) {
    this.id = identifier;
    this.queryParameters = '';
}

/**
 * Set request option
 * @param {Object} opt - Options
 * @returns {StopAction}
 */
RestartAction.prototype.options = function (opt) {
    if (opt.t) { this.queryParameters = '?' + querystring.stringify({t: opt.t}); }

    return this;
};

/**
 * Restart container work with docker API
 * https://docs.docker.com/v1.5/reference/api/docker_remote_api_v1.17/#restart-a-container
 * @param {Object} serverConfig - Docker server target config
 * @returns {*|promise}
 */
RestartAction.prototype.executeOn = function (serverConfig) {
    var deferred = Q.defer(),
        url = urljoin(serverConfig.api, '/containers/', this.id, '/restart', this.queryParameters),
        self = this,
        options = {
            uri: url,
            method: 'POST'
        };

    request(options, function (error, response, body) {
        if (!error && response.statusCode == 204) {
            // 204 – no error
            deferred.resolve({
                code: response.statusCode,
                result: {Id: self.id},
                message: 'successful'
            });

        } else {
            var errorMsg = '';
            if (response.statusCode == 404) { errorMsg = 'no such container'; }
            if (response.statusCode == 500) { errorMsg = 'docker server error'; }

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
