'use strict';

var yamlParser = require('js-yaml'),
    fs = require('fs'),
    Q = require('q'),
    config = require('../config');

module.exports = function PackageCompose(pkg) {
    var deferred = Q.defer();
    try {
        var compose = {},
            json = {};

        compose = yamlParser.safeLoad(
                fs.readFileSync(config.packages + pkg + '.yml')
            );
        console.log(compose);
        console.log('step 2');
        var reviver = function (key, val) {
            if (key)
                this[key.charAt(0).toUpperCase() + key.slice(1)] = val;
            else
                return val;
        };

        json = JSON.parse(compose, reviver);

        console.log(json);

    } catch (e) {
        deferred.reject(e);
    }

    return deferred.promise;
};