'use strict';

var Q                   = require('q'),
    _                   = require('underscore'),
    path                = require('path'),
    crypto              = require('crypto'),
    Container           = require('../../index'),
    backupFileServer    = require('../../../sysadmin/backup-file-system'),
    models              = require(path.resolve(__dirname, '../../../models'));

function BackupPackage () {

}

/**
 * Backup a package
 * @param {string} hostname - Package hostname
 * @param {string} [tag] - Tag
 * @returns {Bluebird.Promise|*}
 */
BackupPackage.prototype.execute = function (hostname, tag) {
    var self = this,
        screenshotTag = tag || this.genScreenshotTag();

    return this.uniqueTag(tag).then(function () {
        return self.getPackage(hostname)
            .then(function (packageRow) {

                var containersID = JSON.parse(packageRow.containers);

                return self._getPackageContainersBackup(containersID)
                    .then(function (volumes) {
                        return self._save(screenshotTag, volumes, hostname);
                    })
                ;
            })
        ;
    });

};

/**
 * Reject on duplicate tag name
 * @param {string} tag - Tag name
 * @returns {Bluebird.Promise|*}
 */
BackupPackage.prototype.uniqueTag = function (tag) {
    return models
        .PackageScreenshot
        .find({
            where: {
                tag: tag
            }
        }).then(function (screenshot) {
            if (!screenshot) {
                return Q.resolve(true);
            }

            return Q.reject('Duplicate tag name!');
        })
    ;
};

/**
 * Return package column row
 * @param {string} hostname - Package hostname
 * @returns {Bluebird.Promise|*}
 */
BackupPackage.prototype.getPackage = function (hostname) {
    return models
        .Package
        .find({
            where: {hostname: hostname}
        }).then(function (packageRow) {

            if (!packageRow) {
                return Q.reject('package ' + hostname + ' does not exists!');
            }

            return Q.resolve(packageRow);
        })
    ;
};

/**
 * Generate a unique screenshot tag based on timestamp and 5 random char
 * @returns {*}
 */
BackupPackage.prototype.genScreenshotTag = function () {
    var text = '',
        possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

    for (var i = 0 ; i < 5 ; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    return crypto
        .createHash('sha1')
        .update(text + ':' + _.now())
        .digest('hex');
};

/**
 * Get all package containers and start to backup
 * @param {Object} containersID - containers id
 * @returns {*}
 * @private
 */
BackupPackage.prototype._getPackageContainersBackup = function (containersID) {
    var self    = this,
        result  = {};

    return _.reduce(containersID, function (prevPromise, id, alias) {
        var container = new Container();

        return prevPromise.then(function () {
            return container
                .getInstance(id)
                .then(self._backupContainer)
                .then(function (res) {
                    result[alias] = res;
                    return result;
                })
            ;
        });

    }, Q.when(true));
};

/**
 * Backup container
 * @param {Object} container - Container object
 * @private
 */
BackupPackage.prototype._backupContainer = function (container) {
    var binds = container.getConfigurationEntry('Binds'),
        result = [];

    return _.reduce(binds, function (prevPromise, bind) {
        var hostPath        = bind.split(':')[0],
            containerPath   = bind.split(':')[1];

        return backupFileServer
            .backup(hostPath)
            .then(function (id) {
                result.push({
                    hostPath: hostPath,
                    containerPath: containerPath,
                    backupId: id
                });

                return result;
            })
        ;

    }, Q.when([]));

};

/**
 * Save screenshot information in database
 * @param {string} tag - Screenshot tag
 * @param {Object} volumes - Volumes
 * @param {string} hostname - Hostname
 * @returns {*}
 * @private
 */
BackupPackage.prototype._save = function (tag, volumes, hostname) {
    return models
        .PackageScreenshot
        .create({
            tag: tag,
            hostname: hostname,
            volumes: JSON.stringify(volumes)
        }).then(function (res) {
            return tag;
        })
    ;
};

module.exports = BackupPackage;
