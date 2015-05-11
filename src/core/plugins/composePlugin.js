'use strict';

var Q       = require('q'),
    path    = require('path'),
    emitter = require(path.resolve(__dirname, '../farmer/emmiter')),
    compose = require('../farmer/Farmerfile/compose');

function ComposePlugin() {
}

/**
 * Register plugin methods on emitter events thrower
 */
ComposePlugin.prototype.registerPlugin = function () {
    emitter.register('create', 1, this.composeToContainerApiMapper);
};

/**
 * Map compose json data to container creator
 * @param {Bag} bag
 * @returns {*}
 */
ComposePlugin.prototype.composeToContainerApiMapper = function (bag) {
    var farmerfileObj = bag.get('farmerfile'),
        containers = farmerfileObj.get('containers'),
        dirs = farmerfileObj.get('dirs'),
        hostname = bag.get('args')['hostname'];

    bag.set('compose', compose.mapDataToContainerApi(containers, dirs, hostname));

    return Q.when(true);
};

module.exports = new ComposePlugin();
