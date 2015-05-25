'use strict';

var Q = require('q'),
    path    = require('path'),
    Container = require('../container'),
    config = require(path.resolve(__dirname, '../../config'));

function ReverseProxy() {
    var mainConfig = config.REVERSE_PROXY;
    var reverseProxy = new Container();

    reverseProxy.type = 'docker';
    reverseProxy.status = 'running';
    reverseProxy.server = mainConfig.server;
    reverseProxy.configuration = {
        Id: mainConfig.containerID
    };

    this.proxy = reverseProxy;
}

ReverseProxy.prototype.restart = function () {
    return this.proxy.restart();
};

module.exports = ReverseProxy;
