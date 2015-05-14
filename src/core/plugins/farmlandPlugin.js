'use strict';

var Q        = require('q'),
    path     = require('path'),
    emitter  = require(path.resolve(__dirname, '../farmer/emmiter')),
    farmland = require('../enviroment/greenhouse/farmland');

function FarmlandPlugin() {
}

/**
 * Register plugin methods on emitter events thrower
 */
FarmlandPlugin.prototype.registerPlugin = function () {
    emitter.register('create', 2, this.furrow);
};

/**
 * Create farmland based on compose config
 * Add 'container' tag to bag with created container list objects
 * @param {Bag} bag - Bag object
 * @returns {Q.Promise}
 */
FarmlandPlugin.prototype.furrow = function (bag) {
    var deferred = Q.defer(),
        compose = bag.get('compose'),
        publisher = bag.get('publisher');

    return farmland.furrow(compose, publisher).tap(function (createdContainersObj) {
        bag.set('containers', createdContainersObj);
    });
};

module.exports = new FarmlandPlugin();
