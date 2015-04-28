var Q       = require('q'),
    request = require('request'),
    config  = require(require('path').resolve(__dirname, '../../../../../config'));

function CreateAction (config) {
    this.name = '';

    if (typeof config.Name !== 'undefined') {
        this.name = '?name=' + config.Name;
        delete config['Name'];
    }

    this.dockerConfiguration = config;
}

/**
 * Create container
 *
 * Create container by send request to docker create API
 * `POST /containers/create`
 * https://docs.docker.com/v1.5/reference/api/docker_remote_api_v1.17/#create-a-container
 *
 * @returns {*|promise}
 */
CreateAction.prototype.execute = function ()
{
    var deferred = Q.defer(),
        options = {
            uri: config.docker_server + '/containers/create' + this.name,
            method: 'POST',
            json: this.dockerConfiguration
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
