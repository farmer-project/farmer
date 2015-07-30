'use strict';

var Q       = require('q'),
    url     = require('url'),
    request = require('request');

function ListImages () {

}

/**
 * Get list of all available images
 * Work with docker API
 * https://docs.docker.com/v1.5/reference/api/docker_remote_api_v1.17/#22-images
 * @param {Object} serverConfig - Docker server target config
 * @returns {*|promise}
 */
ListImages.prototype.executeOn = function (serverConfig) {
    var deferred = Q.defer(),
        options = {
            uri: url.resolve(serverConfig.api, '/images/json'),
            method: 'GET'
        };

    request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            // 200 – no error
            deferred.resolve({
                code: response.statusCode,
                result: JSON.parse(body),
                message: 'successful'
            });

        } else {
            var errorMsg = '';
            if (response.statusCode == 500) { errorMsg = 'server error'; }
            deferred.reject({
                code: response.statusCode,
                result: '',
                message: errorMsg
            });
        }

    });

    return deferred.promise;
};

module.exports = ListImages;
