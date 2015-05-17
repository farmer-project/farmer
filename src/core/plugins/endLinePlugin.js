'use strict';

var _           = require('underscore'),
    Q           = require('q'),
    path        = require('path'),
    emitter     = require(path.resolve(__dirname, '../farmer/emmiter'));

function EndLinePlugin() {
}

/**
 * Register plugin methods on emitter events thrower
 */
EndLinePlugin.prototype.registerPlugin = function () {
    emitter.register('create', 999, this.eventEnd);
    emitter.register('deploy', 999, this.eventEnd);
    emitter.register('inspect', 999, this.eventEnd);
    emitter.register('delete', 999, this.eventEnd);
};

/**
 * Call client that everything is finished
 * @param {Object} bag - Bag object
 * @returns {*}
 */
EndLinePlugin.prototype.eventEnd = function (bag) {
    var publisher   = bag.get('publisher');
    while (publisher.subLevel > 0) {
        publisher.subWorksFinish();
    }
    publisher.disconnect();
    console.log();
    console.log('<<< eventEnd >>>');
    return Q.when(true);
};

module.exports = new EndLinePlugin();
