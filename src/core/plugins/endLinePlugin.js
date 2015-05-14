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
    emitter.register('create', 12, this.eventEnd);
    emitter.register('deploy', 12, this.eventEnd);
    emitter.register('inspect', 12, this.eventEnd);
    emitter.register('delete', 12, this.eventEnd);
};

/**
 *
 * @param bag
 * @returns {*}
 */
EndLinePlugin.prototype.eventEnd = function (bag) {
    var publisher   = bag.get('publisher');

    while(publisher.subLevel > 0) {
        publisher.subWorksFinish();
    }

    return Q.when(true);
};

module.exports = new EndLinePlugin();
