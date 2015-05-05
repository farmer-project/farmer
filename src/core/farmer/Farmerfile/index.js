'use strict';

var _       = require('underscore'),
    Q       = require('q');

function FarmerFile(json) {
    this.content = json;
}

FarmerFile.prototype.get = function (tag) {
    var recurse = function (obj, key) {
        for (var p in obj) {
            if (p === key) {
                return obj[p];
            }
            if (typeof obj[p] === 'object') recurse(obj[p], key);
        }
    };

    return recurse(this.content, tag);
};

FarmerFile.prototype.getTags = function () {
    var tags = [];
    for(var tag in this.content) {
        tags.push(tag);
    }
    return tags;
};

module.exports = FarmerFile;
