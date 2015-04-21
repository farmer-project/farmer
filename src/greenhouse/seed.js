'use strict';

var Q = require('q'),
    _ = require('underscore'),
    fs = require('fs'),
    Procfile = require('../procfile'),
    sourceManager = require('../source-manager'),
    containerCommander = require('../container-commander'),
    config = require(require('path').resolve(__dirname, '../config')),
    farmland = require('./farmland')
    ;

function Seed() {
    this.code_destination = "";
}

/*
 * {
 *      containers: deployment/compose.yml ----> file content in json
 *      git: {
 *          web: {
 *              repo: shell://git.ravaj.ir/ravaj.git
 *              branch: branch-name(optional)
 *           }
 *      }
 *      shell: {
 *          web: [
 *              ansible-book ...,
 *              command ,
 *              ...
 *          ],
 *          db: [
 *              ansible-book ...,
 *              command,
 *              ...
 *          ]
 *      }
 * }
 */

Seed.prototype.implant = function (jsonProcfile, publisher) {
    var procfile = new Procfile();

    try {
        procfile.init(jsonProcfile);

        return sourceManager.downloadSourceCode(procfile.getSourceCodes(), publisher)
            .then(function () {

                return farmland.furrow(procfile.getPackageConfig(), 'staging', publisher);
            }).then(function (result) {

                var shellCmdOnContainers = _(procfile.getShellCommands());
                publisher.pub('run shell commands on containers', true);
                return shellCmdOnContainers.reduce(function (prePromise, commands, alias) {
                    return prePromise.then(function () {
                        var ip = result[_.findIndex(result, {alias: alias})].NetworkSettings.IPAddress;

                        return containerCommander.shell(ip, commands, publisher);
                    });
                }, Q.when(true));
            })
        ;

    } catch (e) {
        return Q.reject(e);
    }
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
