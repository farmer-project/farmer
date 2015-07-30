/**
 * Created by majid on 5/28/15.
 */
'use strict';

var Q = require('q');

function Gzip() {
}

Gzip.prototype.compress = function (source, destination, fileName) {
    var filename = '',
        fullAddress = '';

    return Q.resolve({
        source: source,
        destination: destination,
        fileName: filename,
        fullAddress: fullAddress
    });
};

Gzip.prototype.extract = function (source, destination) {
    return {
        source: source,
        destination: destination
    }
};

module.exports = new Gzip();
