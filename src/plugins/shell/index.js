'use strict';

var Q       = require('q'),
    emitter = require('../../core/farmer/emmiter');

function Shell () {
}

Shell.prototype.registerPlugin = function () {
    emitter.register('create', 1, this.farmfile);
};

Shell.prototype.farmfile = function (context) {
    console.log('context', context);
    console.log('>>>>>>>>>>>>>>>>salam from shell farmfile');
    return Q.when(true);
};

module.exports = new Shell();
