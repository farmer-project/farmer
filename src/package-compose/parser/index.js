'use strict';

var mime = require('mime'),
    Q = require('q');

function Parser() {

}

Parser.prototype.parse = function (file, variables) {
    var parser = {},
        deferred = Q.defer(),
        ext = mime.extension(mime.lookup(file));

    if (ext == 'yaml' || ext == 'yml') {
        return require('./yaml')(file, variables);
    }

    if (ext == 'json') {
        return require('./json')(file, variables);
    }

    deferred.reject('undefined file type');
    return deferred.promise;
};

module.exports = new Parser();
