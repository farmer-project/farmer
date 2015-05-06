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
    var compose = bag.get('compose'),
        publisher = bag.get('publisher');

    console.log('FarmlandPlugin >>>>>>>>>>>>>>>>>> compose', compose);
    return farmland.furrow(compose, 'staging', publisher).then(function (containersInfo) {
        console.log('FarmlandPlugin >>>>>>>>>>>>>>>>>> farmland.furrow', containersInfo);
        bag.set('containers', containersInfo);
    }, function (error) {
        console.log('FarmlandPlugin >>>>>>>>>>>>>>>>>>> error', error);
    });
};

module.exports = new FarmlandPlugin();