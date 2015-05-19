'use strict';

var _       = require('underscore'),
    Q       = require('q'),
    emitter = require('../../core/farmer/emmiter');

function Shell () {
}

/**
 * Register plugin methods on emitter events thrower
 */
Shell.prototype.registerPlugin = function () {
    emitter.register('create', 100, this.farmfile);
    emitter.register('deploy', 100, this.farmfile);
};

/**
 * Run shell
 * Run shell commands on container
 * @param {Bag} bag
 */
Shell.prototype.farmfile = function (bag) {
    var farmerfile = bag.get('farmerfile'),
        deferred   = Q.defer();

    if (farmerfile.get('shell')) {
        var containers = bag.get('containers'),
            publisher  = bag.get('publisher'),
            commands   = farmerfile.get('shell');

        // pause executing command till containers ready to use
        setTimeout(function() {
             _(containers).reduce(function (prevContainerPromise, containerObj, alias) {
                return prevContainerPromise.then(function () {
                    console.log('Running shells on [' + alias + ']:');
                    return containerObj.execShell(commands[alias], publisher)
                        .tap(console.log)
                        .catch(console.log);
                });
            }, Q.when(true))
                .then(deferred.resolve, deferred.reject)
            ;

        }, 1000);

    } else {
        deferred.resolve(true);
    }

    return deferred.promise;
};

module.exports = new Shell();
