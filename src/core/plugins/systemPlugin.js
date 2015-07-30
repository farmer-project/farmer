'use strict';

var _           = require('underscore'),
    Q           = require('q'),
    path        = require('path'),
    emitter     = require(path.resolve(__dirname, '../farmer/emmiter'));

function SystemPlugin() {
}

/**
 * Register plugin methods on emitter events thrower
 */
SystemPlugin.prototype.registerPlugin = function () {
    emitter.register('setDomain', 2, this.setDomain);
};

/**
 * Call client that everything is finished
 * @param {Object} bag - Bag object
 * @returns {*}
 */
SystemPlugin.prototype.setDomain = function (bag) {
    var publisher   = bag.get('publisher'),
        args        = bag.get('args'),
        containers  = bag.get('containers');

    containers.forEach(function (container) {
        if (args.alias === container.getConfigurationEntry('alias')) {
            return Q.when(container);
        }
    });

};

module.exports = new SystemPlugin();
