var Q = require('q'),
    config = require('../../config'),
    request = require('request');

function CreateAction () {
    this.hostname = "";
    this.name = "";
    this.image = "";
    this.ports = [];
}

CreateAction.prototype.setHostname = function (hostname)
{
    this.hostname = hostname;
    return this;
};

CreateAction.prototype.setName = function (name)
{
    this.name = name;
    return this;
};

CreateAction.prototype.addPort = function (ports)
{
    if (typeof ports === "undefined") {
        ports = [];
    }

    if (typeof ports === "string") {
        ports = [ports];
    }

    this.ports = this.ports.concat(ports);

    return this;
};

CreateAction.prototype.setImage = function (image)
{
    this.image = image;
    return this;
};

CreateAction.prototype.execute = function ()
{
    var deferred = Q.defer();

    if (typeof this.image !== 'string' || !this.image) {
        throw new Error('Image should be set when building Create command.');
    }

    var ExposedPorts = {};
    if (this.ports.length) {
        for (var c = this.ports.length, i = 0; i < c; i++) {
            ExposedPorts[this.ports[i]+'/tcp'] = {};
        }
    }

    var options = {
        uri: config.docker_server + '/containers/create?name=' + this.name,
        method: 'POST',
        json: {
            "Hostname": this.hostname,
            "Image": this.image,
            "ExposedPorts": ExposedPorts
        }
    };

    request(options, function (error, response, body) {
        if (!error && response.statusCode == 201) {
            // 201 – no error
            deferred.resolve({
                code: response.statusCode,
                message: body
            });

        } else {
            // 404 – no such container
            // 406 – impossible to attach (container not running)
            // 500 – server error
            deferred.reject({
                code: response.statusCode,
                message: error
            });
        }

    });

    return deferred.promise;
};

module.exports = CreateAction;
