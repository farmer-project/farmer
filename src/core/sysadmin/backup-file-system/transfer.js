/**
 * Created by majid on 5/28/15.
 */
'use strict';

var Q   = require('q'),
    tar = require('tar-fs'),
    _   = require('underscore');

function Transfer() {
}

/**
 * Copy folder content and past them in destination folder
 * @param {string} source - Source folder to colne it's files/folders
 * @param {string} destination - Destination folder to clone it's files/folders in it
 * @returns {*|promise}
 */
Transfer.prototype.clone = function (source, destination) {
    var deferred    = Q.defer(),
        filename    = _.last(source.split('/')),
        fullAddress = destination + '/' + filename;

    try {
        tar.pack(source).pipe(tar.extract(fullAddress));

        deferred.resolve({
            source: source,
            destination: destination,
            fileName: filename,
            fullAddress: fullAddress
        });

    } catch (e) {
        deferred.reject(e);
    }

    return deferred.promise;
};

module.exports = new Transfer();
