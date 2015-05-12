'use strict';

var Q       = require('q'),
    urljoin = require('url-join'),
    request = require('request');

/**
 * @param {string} identifier - identifier
 * @constructor
 */
function InfoAction (identifier) {
    this.identifier = identifier;
}

/**
 * Get container Inspect information from docker API
 * https://docs.docker.com/v1.5/reference/api/docker_remote_api_v1.17/#inspect-a-container
 * @param {Object} serverConfig - Docker server target config
 * @returns {*|promise}
 */
InfoAction.prototype.executeOn = function (serverConfig) {
    var deferred = Q.defer(),
        options = {
            uri: urljoin(serverConfig.api, '/containers/', this.identifier, '/json'),
            method: 'GET'
        };

    request(options, function (error, response, body) {
        console.log('body >>>>>', body)
        if (!error && response.statusCode == 200) {
            deferred.resolve({
                code: response.statusCode,
                result: JSON.parse(body),
                message: 'successful'
            });

        } else {
            var errorMsg = '';
            if (response.statusCode == 404) { errorMsg = 'no such container'; }
            if (response.statusCode == 500) { errorMsg = 'server error'; }
            deferred.reject({
                code: response.statusCode,
                result: null,
                message: errorMsg
            });
        }

    });

    return deferred.promise;
};

module.exports = InfoAction;
