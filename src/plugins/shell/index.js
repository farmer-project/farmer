'use strict';

var Q       = require('q'),
    emitter = require('../../core/farmer/emmiter');

function Shell () {
}

Shell.prototype.registerPlugin = function () {
    emitter.register('create', 5, this.farmfile);
};

Shell.prototype.farmfile = function (bag) {
    //console.log('>>>>>>>>>>>>>>', require('util').inspect(bag, false, null));
    //console.log('>>>>>>>>>>>>>>>>salam from shell farmfile');
    return Q.when(true);
};

module.exports = new Shell();
