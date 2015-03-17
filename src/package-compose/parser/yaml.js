'use strict';

var yamlParser = require('js-yaml'),
    mustache = require('mustache'),
    fs = require('fs'),
    Q = require('q');

module.exports = function yaml(file, variables) {
    var deferred = Q.defer(),
        compose = {};

    fs.readFile(file, 'utf8', function (err, data) {
        if (err) {
            deferred.reject(e);
            return;
        }

        try {
            compose = yamlParser.safeLoad(
                mustache.render(data, variables)
            );
            deferred.resolve(compose);
        } catch (e) {
            deferred.reject(e);
        }
    });

    return deferred.promise;
};