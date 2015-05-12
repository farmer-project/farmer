'use strict';

var _           = require('underscore'),
    Q           = require('q'),
    path        = require('path'),
    Container   = require('../container'),
    emitter     = require(path.resolve(__dirname, '../farmer/emmiter')),
    models      = require(path.resolve(__dirname, '../models'));

function PackagePlugin() {
}

/**
 * Register plugin methods on emitter events thrower
 */
PackagePlugin.prototype.registerPlugin = function () {
    emitter.register('deploy', 1, this.getContainers);

    emitter.register('delete', 1, this.getContainers);
    emitter.register('delete', 2, this.delete);
};

/**
 * Get package containers info
 * Get package containers object and set them as containers object in Bag obj
 * (*)need: args.hostname
 * @param {Bag} bag - Bag object
 * @returns {Bluebird.Promise|*}
 */
PackagePlugin.prototype.getContainers = function (bag) {
    var args        = bag.get('args'),
        containers  = {};

    bag.set('containers', containers);

    return models
        .Package.find({
            where: {hostname: args.hostname}
        }).then(function (packageRow) {
            var containerID = JSON.parse(packageRow.containers),
                getInstancesPromise = [];

            for (var alias in containerID) {
                var container = new Container();
                getInstancesPromise.push(
                    container.getInstance(containerID[alias])
                        .then(function (containerObj) {
                            containers[alias] = containerObj;
                        })
                );
            }

            return Q.all(getInstancesPromise);
        });
};

/**
 * Delete package
 * Delete package containers and remove that row from DB
 * (*)need: args.hostname
 * (*)need: args.deleteVolume
 * @param {Bag} bag - Bag object
 * @returns {*}
 */
PackagePlugin.prototype.delete = function (bag) {
    var containers = bag.get('containers'),
        args = bag.get('args'),
        promiseArray = [];

    for (var alias in containers) {
        promiseArray.push(containers[alias].destroy(args.deleteVolume));
    }

    return models.Package.find({
        where: {hostname: args.hostname}
    }).then(function (packageRow) {
        packageRow.destroy();
        return Q.all(promiseArray);
    });
};

module.exports = new PackagePlugin();
