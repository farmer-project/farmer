'use strict';

var Q        = require('q'),
    path     = require('path'),
    emitter  = require(path.resolve(__dirname, '../farmer/emmiter')),
    farmland = require('../enviroment/greenhouse/farmland'),
    models   = require('../models');

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
    var compose     = bag.get('compose'),
        publisher   = bag.get('publisher'),
        args        = bag.get('args');

    return models
        .Package
        .find({
            where: {hostname: args.hostname}
        }).then(function (packageRow) {

            if (null !== packageRow) {
                publisher.sendString('Package ' + args.hostname + ' exist');
                return Q.when(true);
            }

            return farmland
                .furrow(compose, publisher)
                .tap(function (createdContainersObj) {
                        bag.set('containers', createdContainersObj);
                        publisher.sendString('Containers created');

                    }).catch(function (error) {
                        publisher.sendRaw(error);
                    })
                ;
        })
    ;
};

module.exports = new FarmlandPlugin();
