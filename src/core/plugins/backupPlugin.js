'use strict';

var _               = require('underscore'),
    Q               = require('q'),
    path            = require('path'),
    models          = require('../models'),
    packageCompose  = require('../container/orchestrate'),
    emitter         = require(path.resolve(__dirname, '../farmer/emmiter'));

function BackupPlugin() {
}

/**
 * Register plugin methods on emitter events thrower
 */
BackupPlugin.prototype.registerPlugin = function () {
    emitter.register('delete', 3, this.deletePackage);
};

/**
 * Delete all backups depend on package
 * @param {Object} bag - Bag object
 * @returns {*}
 */
BackupPlugin.prototype.deletePackage = function (bag) {
    var publisher   = bag.get('publisher'),
        args        = bag.get('args');

    // get all hostname backups and pass them to orchestrate deleteBackup :)
    return models
        .PackageScreenshot
        .findAll({
            where: {hostname: args.hostname}
        }).then(function (schreenshots) {
            publisher.sendString('Delete backups');
            publisher.subWorksStart();
            return _.reduce(schreenshots, function (prevPromise, screenshot) {
                return prevPromise.then(function () {

                    return packageCompose
                        .deleteBackup(screenshot.tag)
                        .tap(function () {
                            publisher.sendString(screenshot.tag);
                        })
                    ;

                });
            }, Q.when(true));
            publisher.subWorksFinish();
        })
    ;
};

module.exports = new BackupPlugin();
