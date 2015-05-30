/**
 * Created by majid on 5/28/15.
 */
'use strict';

var tar = require('./tar'),
    gzip = require('./gzip');

module.exports = function (type) {
    switch (type) {
        case 'tar':
            return tar;
        case 'gzip':
            return gzip;
        default:
            throw new Error('type is not defined');
    }
};
