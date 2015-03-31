'use strict';

var Q = require('q'),
    fs = require('fs'),
    config = require('../../../config'),
    farmland = require('./farmland'),
    git = require('../../../git');

function Seed() {
    this.code_destination = "";
}

/**
 * to implant a seed we need an object like below
 * {
 *  "package": // package name
 *  "name": // must be unique
 *  "hostname": // must be unique
 *  "app": // application code address
 *  "repo": // git repository address
 *  "branch": // code branch default value is master(optional)
 * }
 * @param config
 * @returns {*}
 */
Seed.prototype.implant = function (config) {
    this.code_destination = config.app;

    var farmlandConf = {
            package: config.package,
            name: config.name,
            hostname: config.hostname,
            seed: config.app,
            type: config.type
        },
        gitConf = {
            branch: config.branch,
            repo: config.repo,
            code_destination: config.app
        };

    return farmland.furrow(farmlandConf)
        .then(function (response) {
            try {
                return git.clone(gitConf).execute();
            } catch (e) {
                console.log('catch', e);
                return Q.reject(e);
            }
        })
    ;
};

Seed.prototype.remove = function () {

    var deferred = Q.defer(),
        deleteFolderRecursive = function(path) {
        if( fs.existsSync(path) ) {
            fs.readdirSync(path).forEach(function(file,index){
                var curPath = path + "/" + file;
                if(fs.lstatSync(curPath).isDirectory()) { // recurse
                    deleteFolderRecursive(curPath);
                } else { // delete file
                    fs.unlinkSync(curPath);
                }
            });
            fs.rmdirSync(path);

            deferred.resolve();
        }
    };

    deleteFolderRecursive(this.code_destination);
    return deferred.promise;
};

module.exports = Seed;
