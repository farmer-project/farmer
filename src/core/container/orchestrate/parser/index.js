'use strict';

var mime       = require('mime'),
    YamlParser = require('./yaml'),
    JsonParser = require('./json'),
    Q          = require('q');

function Parser() {
}

Parser.prototype.parse = function (file, variables) {
    var ext = mime.extension(mime.lookup(file));

    if (ext == 'yaml' || ext == 'yml') {
        return YamlParser(file, variables);
    }

    if (ext == 'json') {
        return JsonParser(file, variables);
    }

    return Q.reject('Unknown file type');
};

module.exports = new Parser();
