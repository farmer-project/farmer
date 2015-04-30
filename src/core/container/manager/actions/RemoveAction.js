var Q       = require('q'),
    url     = require('url'),
    request = require('request');

function RemoveAction () {
    this.identifier = null;
    this.queryParamiters = '?';
}

/**
 * Set remove request options
 *
 * @param opt
 * @returns {RemoveAction}
 */
RemoveAction.prototype.options = function (opt) {
    if (!opt.Id || typeof opt.Id !== 'string') {
        throw new Error('Unknown container Id '+ opt.Id);
    }

    this.identifier =  opt.Id;
    if (opt.ForceStop)        this.queryParamiters = url.resolve(this.queryParamiters, 'force=1');
    if (opt.RemoveVolume) this.queryParamiters = url.resolve(this.queryParamiters, '&v=1');

    return this;
};

/**
 * Remove a container
 *
 * Remove container by send request to docker remove API
 * https://docs.docker.com/v1.5/reference/api/docker_remote_api_v1.17/#remove-a-container
 *
 * @returns {*|promise}
 */
RemoveAction.prototype.executeOn = function (serverConfig)
{
    var deferred = Q.defer(),
        options = {
        uri: url.resolve(serverConfig.api, '/containers/', this.identifier, this.queryParamiters),
        method: "DELETE"
    };

    request(options, function (error, response, body) {
        if (!error && response.statusCode == 204) {
            // 204 – no error
            deferred.resolve({
                code: response.statusCode,
                result: '',
                message: "successful"
            });

        } else {
            var errorMsg = "";
            if( response.statusCode == 400) errorMsg = "bad parameter";
            if( response.statusCode == 404) errorMsg = "no such container";
            if( response.statusCode == 500) errorMsg = "server error";
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