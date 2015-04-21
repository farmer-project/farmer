var Q       = require('q'),
    config  = require(require('path').resolve(__dirname, '../../config')),
    request = require('request');

function CreateAction (config) {
    this.name = '';

    if (typeof config.Name !== 'undefined') {
        this.name = '?name=' + config.Name;
        delete config['Name'];
    }

    this.sendData = config;
}

CreateAction.prototype.execute = function ()
{
    var deferred = Q.defer(),
        image = this.sendData["Image"];

    if (typeof this.sendData.Image !== 'string' || !this.sendData.Image) {
        deferred.reject({
            code: 500,
            message: 'Image should be set when building Create command.'
        });

        return deferred.promise;
    }

    var options = {
        uri: config.docker_server + '/containers/create' + this.name,
        method: 'POST',
        json: this.sendData
    };

    request(options, function (error, response, body) {
        if (!error && response.statusCode == 201) {
            // 201 – no error
            deferred.resolve({
                code: response.statusCode,
                message: body
            });

        } else {
            var errorMsg = "";
            if( response.statusCode == 404) errorMsg = "no such container";
            if( response.statusCode == 406) errorMsg = "impossible to attach (container not running)";
            if( response.statusCode == 500) errorMsg = "server error";
            deferred.reject({
                code: response.statusCode,
                message: errorMsg
            });
        }

    });

    return deferred.promise;
};

module.exports = CreateAction;
