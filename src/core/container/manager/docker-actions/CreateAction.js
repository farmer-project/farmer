'use strict';

var Q           = require('q'),
    urljoin     = require('url-join'),
    request     = require('request'),
    querystring = require('querystring');

/**
 * @constructor
 */
function CreateAction () {
    this.configuration = {};
    this.queryParameters = '';
}

/**
 * Set request options
 * @param {Object} opt - Options
 */
CreateAction.prototype.options = function (opt) {
    if (opt.Name) {
        this.queryParameters = '?' + querystring.stringify({name: opt.Name});
        delete opt['Name'];
    }

    this.configuration = opt;
    return this;
};

/**
 * Create container by send request to docker create API
 * `POST /containers/create`
 * https://docs.docker.com/v1.5/reference/api/docker_remote_api_v1.17/#create-a-container
 * @param {Object} serverConfig - Docker server target config
 * @returns {*|promise}
 */
CreateAction.prototype.executeOn = function (serverConfig) {
    var deferred = Q.defer(),
        options = {
            uri: urljoin(serverConfig.api, '/containers/create', this.queryParameters),
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
            var errorMsg = '';
            if (response.statusCode == 404) { errorMsg = 'no such container'; }
            if (response.statusCode == 406) { errorMsg = 'impossible to attach'; }
            if (response.statusCode == 409) { errorMsg = 'conflict name already assigned'; }
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

module.exports = CreateAction;
