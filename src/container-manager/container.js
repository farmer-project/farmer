'use strict';

var Q = require('q'),
    ContainerManager = require(require('path').resolve(__dirname, './index'));

function Container (identifier) {
    this.identifier = identifier;
    this.inspect = {};
}

Container.prototype.setInspect = function (inspect) {
    this.inspect = inspect;
};

Container.prototype.getInspect = function () {
    var self = this;
    if (!this.inspect) {
        return ContainerManager.getContainerInfo(this.identifier).then(function (info) {
            self.inspect = info;
        });
    }

    return Q.when(this.inspect);
};

Container.prototype.getNetworkSettings = function () {
    return this.inspect.then(function (info) {
        return info.NetworkSettings;
    });
};

module.exports = Container;