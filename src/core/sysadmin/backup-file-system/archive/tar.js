/**
 * Created by majid on 5/28/15.
 */
'use strict';

var Q   = require('q'),
    tar = require('tar-fs'),
    fs  = require('fs'),
    _   = require('underscore');

function Tar() {
}

/**
 * Compress source directory to destination
 * @param {string} source - Source directory
 * @param {string} destination - Destination directory
 * @param {string} fileName - File name
 * @returns {{source: *, destination: *, fileName: string}}
 */
Tar.prototype.compress = function (source, destination, fileName) {
    var deferred    = Q.defer(),
        filename    = fileName + '.tar',
        fullAddress = destination + '/' + filename;

    // create parent folder if it's not exists
    if (!fs.existsSync(destination)) {
        fs.mkdirSync(destination);
    }

    try {
        tar.pack(source).pipe(fs.createWriteStream(fullAddress));

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

/**
 * Extract source tar file and extract to destination
 * @param {string} source - Tar file address
 * @param {string} destination - Extract to
 * @returns {{source: *, destination: *}}
 */
Tar.prototype.extract = function (source, destination) {
    var deferred = Q.defer();

    try {
        fs.createReadStream(source).pipe(tar.extract(destination));

        deferred.resolve({
            source: source,
            destination: destination
        });

    } catch (e) {
        deferred.reject(e);
    }

    return deferred.promise;
};

module.exports = new Tar();
