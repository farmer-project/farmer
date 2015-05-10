'use strict';

var _    = require('underscore'),
    Q    = require('q');

/**
 * FarmerFile constructor
 * @param {Object} json - Farmerfile json content
 * @constructor
 */
function FarmerFile(json) {
    this.content = json;
}

/**
 * Return tag values
 * @param {string} tag - Tag name
 */
FarmerFile.prototype.get = function (tag) {
    var recurse = function (obj, key) {
        for (var p in obj) {
            if (p === key) {
                return obj[p];
            }
            if (typeof obj[p] === 'object') {
                recurse(obj[p], key);
            }
        }
    };

    return recurse(this.content, tag);
};

/**
 * Get all farmerfile tags
 * @returns {Array}
 */
FarmerFile.prototype.getTags = function () {
    var tags = [];
    for (var tag in this.content) {
        tags.push(tag);
    }
    return tags;
};

module.exports = FarmerFile;
