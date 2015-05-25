'use strict';

var Q = require('q'),
    path    = require('path'),
    Container = require('../container'),
    config = require(path.resolve(__dirname, '../../config'));

/**
 * Create a container mock for reverse proxy
 * @constructor
 */
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

/**
 * Restart ReverseProxy
 */
ReverseProxy.prototype.restart = function () {
    return this.proxy.restart();
};

module.exports = ReverseProxy;
