var Q       = require('q'),
    request = require('request'),
    config  = require(require('path').resolve(__dirname, '../../../../../config'));

function ListImages () {

}

/**
 * Get list of all available images
 *
 * Work with docker API
 *
 * @returns {*|promise}
 */
ListImages.prototype.execute = function ()
{
    var deferred = Q.defer();

    var options = {
        uri: config.docker_server + '/images/json',
        method: "GET"
    };

    request(options, function (error, response, body) {

        if (!error && response.statusCode == 200) {
            // 200 – no error
            deferred.resolve({
                code: response.statusCode,
                message: JSON.parse(body)
            });

        } else {
            var error = "";
            if( response.statusCode == 500) error = "server error";
            deferred.reject({
                code: response.statusCode,
                message: error
            });
        }

    });

    return deferred.promise;
};

module.exports = ListImages;