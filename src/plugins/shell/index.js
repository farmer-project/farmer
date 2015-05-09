'use strict';

var _       = require('underscore'),
    Q       = require('q'),
    emitter = require('../../core/farmer/emmiter');

function Shell () {
}

Shell.prototype.registerPlugin = function () {
    emitter.register('create', 5, this.farmfile);
};

Shell.prototype.farmfile = function (bag) {
    console.log('>>>>> shell plugin');
    var farmerfile = bag.get('farmerfile'),
        containers = bag.get('containers'),
        publisher  = bag.get('publisher'),
        commands = farmerfile.get('shell');

    //for (var alias in containers) {
    //    var containerObj = containers[alias];
    //    _(commands[alias]).reduce(function (prevPromise, command) {
    //        return prevPromise.then(function () {
    //            return containerObj.execShell(command)
    //                .tap(publisher.toClient)
    //                .catch(publisher.toClient);
    //        });
    //    }, Q.when(true));
    //}


    _(containers).reduce(function (prevPromise, containerObj, alias) {
        console.log('>>> alias', alias);
        console.log('>>> containerObj', containerObj);
        return prevPromise.then(function () {
            console.log('>>> in first then');
            _(commands[alias]).reduce(function (prevPromise2, command) {
                console.log('>>> in secound redeuce');
                console.log('>>> in secound command', command);
                return prevPromise2.then(function () {
                    console.log('>>> in secound reduce then');
                    console.log('>>> in secound reduce then command >>', command);
                    return containerObj.execShell(command).tap(publisher.toClient).catch(publisher.toClient);
                });
            }, Q.when(true));

            return Q.when(true);
        });

    }, Q.when(true));

    Q.when(true);
};

module.exports = new Shell();
