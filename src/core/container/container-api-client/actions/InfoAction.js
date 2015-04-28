var Q       = require('q'),
    request = require('request'),
    config  = require(require('path').resolve(__dirname, '../../../../../config'));

function InfoAction (identifier) {
    this.identifier = identifier;
}

/**
 * Get container Inspect information
 *
 * Get container Inspect information from docker API
 *
 * @returns {*|promise}
 */
InfoAction.prototype.execute = function () {
    if (typeof this.identifier !== 'string' || !this.identifier) {
        throw new Error('Container ID must be set when getting container info.');
    }

    var deferred = Q.defer(),
        options = {
        uri: config.docker_server + '/containers/' + this.identifier + '/json',
        method: "GET"
    };

    request(options, function (error, response, body) {

        if (!error && response.statusCode == 200) {
            deferred.resolve({
                code: response.statusCode,
                result: JSON.parse(body),
                message: ''
            });

        } else {
            var error = "";
            if( response.statusCode == 404) error = "no such container";
            if( response.statusCode == 500) error = "server error";
            deferred.reject({
                code: response.statusCode,
                result: null,
                message: error
            });
        }

    });

    return deferred.promise;
};

module.exports = InfoAction;
