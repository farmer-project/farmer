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
    emitter.register('create', 3, this.toClient);

    emitter.register('deploy', 1, this.getContainers);

    emitter.register('inspect', 1, this.getContainers);
    emitter.register('inspect', 2, this.toClient);

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
        publisher   = bag.get('publisher'),
        containers  = {};

    return models
        .Package.find({
            where: {hostname: args.hostname}
        }).then(function (packageRow) {
            if (null == packageRow) {
                publisher.toClient(args.hostname + ' package does not exist');
                return Q.when(true);
            }

            bag.set('containers', containers);
            var containerID = JSON.parse(packageRow.containers),
                promiseArray = [];
            for (var alias in containerID) {
                (function(alias) { // Create a closure to save alias until code block finish
                    var container = new Container();
                    promiseArray.push(
                        container.getInstance(containerID[alias])
                            .then(function (containerObj) {
                                containers[alias] = containerObj;
                            })
                    );
                })(alias);
            }

            return Q.all(promiseArray);
        }, function () {
            publisher.toClient('package ' + args.hostname + ' does not exist');
            publisher.subWorksFinish();
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
    var containers  = bag.get('containers'),
        args        = bag.get('args'),
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

/**
 * Send container configuration to client
 * @param {Object} bag - Bag object
 * @returns {*}
 */
PackagePlugin.prototype.toClient = function (bag) {
    var containers  = bag.get('containers'),
        publisher   = bag.get('publisher');

    if (containers) {
        for (var alias in containers) {
            containers[alias] = containers[alias].getConfigurationEntry('*');
        }
        publisher.toClient(containers);
    }
    return Q.when(true);
};

module.exports = new PackagePlugin();
