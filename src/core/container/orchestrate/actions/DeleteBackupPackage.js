'use strict';

var Q                   = require('q'),
    _                   = require('underscore'),
    path                = require('path'),
    Container           = require('../../index'),
    backupFileServer    = require('../../../sysadmin/backup-file-system'),
    models              = require(path.resolve(__dirname, '../../../models'));

function DeleteBackupPackage () {

}

/**
 * Delete generated backup a package
 * @param {string} tag - Screenshot tag
 * @returns {Bluebird.Promise|*}
 */
DeleteBackupPackage.prototype.execute = function (tag) {
    var self = this;

    return (function () {
            return self
                ._getScreenshots(tag)
                .then(function (packageScreenshot) {
                    var volumes = JSON.parse(packageScreenshot.volumes);
                    _.reduce(volumes, function (prevPromise, containerDirBinds) {
                        return prevPromise.then(function () {

                            return self._deleteFiles(containerDirBinds);

                        });

                    }, Q.when(true));
                })
            ;
        })().then(function (result) {
            return self._removeFromDb(tag);
        })
    ;
};

/**
 * Return package column row
 * @param {string} tag - Package hostname
 * @returns {Bluebird.Promise|*}
 * @private
 */
DeleteBackupPackage.prototype._getScreenshots = function (tag) {
    return models
        .PackageScreenshot
        .find({
            where: {tag: tag}
        }).then(function (packageScreenshot) {

            if (!packageScreenshot) {
                return Q.reject('Tag ' + tag + ' does not exists!');
            }

            return Q.resolve(packageScreenshot);
        })
    ;
};

/**
 * Delete
 * @param containerDirBinds
 * @returns {*}
 * @private
 */
DeleteBackupPackage.prototype._deleteFiles = function (containerDirBinds) {
    return _.reduce(containerDirBinds, function (prevPromise, volume) {

        return prevPromise.then(function () {

            return backupFileServer.delete(volume.backupId);

        });

    }, Q.when(true));
};

/**
 * Remove info from database
 * @param {string} tag - Package screenshot tag
 * @returns {Bluebird.Promise|*}
 * @private
 */
DeleteBackupPackage.prototype._removeFromDb = function (tag) {
    return models
        .PackageScreenshot
        .find({
            where: {tag: tag}
        }).then(function (packageScreenshot) {
            return packageScreenshot.destroy();
        })
    ;
};

module.exports = DeleteBackupPackage;
