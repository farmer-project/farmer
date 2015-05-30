'use strict';

var _               = require('underscore'),
    Q               = require('q'),
    path            = require('path'),
    archiveFactory  = require('./archive'),
    config          = require(path.resolve(__dirname, '../../../config')),
    models          = require(path.resolve(__dirname, '../../models')),
    log             = require(path.resolve(__dirname, '../../debug/log'));

function BackupSystem() {
}

/**
 * Generate an unique id based on timestamp
 * @returns {string}
 * @private
 */
BackupSystem.prototype.newID = function () {
    var text = "",
        possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

    for( var i=0; i < 5; i++ ) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    return text + _.now();
};

/**
 * @param {string} address - File address uri
 * @param {Object} metadata - Metadata
 */
BackupSystem.prototype.backup = function (address, metadata) {
    var destUri = config.BACKUP_SERVER.root,
        id      = this.newID();

    return (function () {
        var deferred = Q.defer();

        try {
            // TODO:Add snapshot feature  and multi compress type to backup server system
            archiveFactory('tar')
                .compress(address, destUri, id)
                .then(deferred.resolve, deferred.reject);

        } catch (e) {
            require('./transfer').clone(address, destUri)
                .then(deferred.resolve, deferred.reject);
        }

        return deferred.promise;

    })().then(function (result) {

        return models
            .BackupFile
            .create({
                id: id,
                uri: result.fullAddress,
                metadata: metadata
            }).then(function (res) {
                return id;
            });

    }, function (err) {
        log.error(err);
        return Q.reject(err);
    });
};

module.exports = new BackupSystem();
