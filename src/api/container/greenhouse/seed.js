'use strict';

var Q = require('q'),
    fs = require('fs'),
    config = require('../../../config'),
    farmland = require('./farmland'),
    git = require('../../../git');

function Seed() {
    this.code_destination = "";
}

Seed.prototype.implant = function (request) {
    var deferred = Q.defer();

    request['code_destination'] = this.code_destination = config.greenhouse + request.name;

    try {
        git.clone(request)
            .execute()
            .then(function (result) {
                farmland.furrow();
                deferred.resolve(result);
            }, function (error) {
                deferred.reject(error);
            });
    } catch (e) {
        deferred.reject({
            "statusCode": 500,
            "message": e
        });
    }

    return deferred.promise;
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
