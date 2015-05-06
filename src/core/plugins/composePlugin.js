'use strict';

var Q       = require('q'),
    path    = require('path'),
    emitter = require(path.resolve(__dirname, '../farmer/emmiter')),
    compose = require('../farmer/Farmerfile/compose');

function ComposePlugin() {
}

ComposePlugin.prototype.registerPlugin = function () {
    emitter.register('create', 1, this.containers)
};

ComposePlugin.prototype.containers = function (bag) {
    var farmerfileObj = bag.get('farmerfile'),

        containers = farmerfileObj.get('containers'),
        dirs = farmerfileObj.get('dirs'),
        host = bag.get('args')['host'];

    bag.set('compose', compose.resolve(containers, dirs, host));

    Q.when(true);
};

module.exports = new ComposePlugin();
