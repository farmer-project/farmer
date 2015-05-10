'use strict';

var _           = require('underscore'),
    Q           = require('q'),
    path        = require('path'),
    Container   = require('../container'),
    emitter     = require(path.resolve(__dirname, '../farmer/emmiter')),
    models      = require(path.resolve(__dirname, '../models'));

function DeployPlugin() {
}

DeployPlugin.prototype.registerPlugin = function () {
    emitter.register('deploy', 1, this.getContainerInfo);
};

DeployPlugin.prototype.getContainerInfo = function (bag) {
    var args        = bag.get('args'),
        containers  = {};

    bag.set('containers', containers);

    return models
        .Package.find({
            where: { hostname: args.hostname }
        }).then(function (packageRow) {
            var containerID = JSON.parse(packageRow.containers),
                getInstancesPromise = [];

            for(var alias in containerID) {
                var container = new Container();

                getInstancesPromise.push(
                    container.getInstance(containerID[alias])
                        .then(function (containerObj) { containers[alias] = containerObj; })
                );
            }

            return Q.all(getInstancesPromise);
        });
};

module.exports = new DeployPlugin();
