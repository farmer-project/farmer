'use strict';

var Q       = require('q'),
    path    = require('path'),
    emitter = require(path.resolve(__dirname, '../farmer/emmiter')),
    farmland= require('../enviroment/greenhouse/farmland');

function FarmlandPlugin() {
}

FarmlandPlugin.prototype.registerPlugin = function () {
    emitter.register('create', 2, this.furrow);
};

FarmlandPlugin.prototype.furrow = function (bag) {
    var deferred = Q.defer(),
        compose = bag.get('compose'),
        publisher = bag.get('publisher');
    console.log('>>>>>>>>>>>>>>compose >>>', require('util').inspect(compose, false, null));
    return farmland.furrow(compose, publisher).tap(function (createdContainersObj) {
        bag.set('containers', createdContainersObj);
    });
};

module.exports = new FarmlandPlugin();