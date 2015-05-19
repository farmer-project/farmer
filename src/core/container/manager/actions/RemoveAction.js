'use strict';

var Q           = require('q'),
    urljoin     = require('url-join'),
    request     = require('request'),
    querystring = require('querystring');

/**
 * @constructor
 */
function RemoveAction () {
    this.identifier = null;
    this.queryParameters = {};
}

/**
 * Set remove request options
 * @param {Object} opt - Options
 * @returns {RemoveAction}
 */
RemoveAction.prototype.options = function (opt) {
    if (!opt.Id || typeof opt.Id !== 'string') {
        throw new Error('Unknown container Id ' + opt.Id);
    }

    this.identifier = opt.Id;

    if (opt.RemoveVolume)  { this.queryParameters['v'] = true; }
    if (opt.ForceStop)     { this.queryParameters['force'] = true; }
    this.queryParameters = '?' + querystring.stringify(this.queryParameters);

    return this;
};

/**
 * Remove container by send request to docker remove API
 * https://docs.docker.com/v1.5/reference/api/docker_remote_api_v1.17/#remove-a-container
 * @param {Object} serverConfig - Docker server target config
 * @returns {*|promise}
 */
RemoveAction.prototype.executeOn = function (serverConfig) {
    var deferred = Q.defer(),
        options = {
        uri: urljoin(serverConfig.api, '/containers/', this.identifier, this.queryParameters),
        method: 'DELETE'
    };
    console.log('options> >>>> >>>', options);
    request(options, function (error, response, body) {
        if (!error && response.statusCode == 204) {
            // 204 – no error
            deferred.resolve({
                code: response.statusCode,
                result: '',
                message: 'successful'
            });

        } else {
            var errorMsg = '';
            if (response.statusCode == 400) { errorMsg = 'bad parameter'; }
            if (response.statusCode == 404) { errorMsg = 'no such container'; }
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

module.exports = RemoveAction;
