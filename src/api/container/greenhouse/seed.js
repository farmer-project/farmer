'use strict';

var Q = require('q'),
    _ = require('underscore'),
    fs = require('fs'),
    procfile = require('../../../procfile'),
    git = require('../../../git'),
    config = require('../../../config'),
    farmland = require('./farmland')
    ;

function Seed() {
    this.code_destination = "";
}

/*
*
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

Seed.prototype.implant = function (jsonProcfile) {


    return procfile.dockerComposeConfigResolver(jsonProcfile.containers, jsonProcfile.git)
        .then(function (dockerComposeConfig) {

            return _(jsonProcfile.git).reduce(function (prevPromise, gitConf, alias) {
                return prevPromise.then(function () {
                    return _(dockerComposeConfig[alias]['binds']).reduce(function (prevPromise2, bind) {
                        return prevPromise2.then(function () {

                            return git.clone({
                                repo: gitConf.repo,
                                code_destination: bind.split(':')[0],
                                branch: gitConf.branch || 'master'
                            }).execute();

                        });
                    }, Q.when(true));
                });
            }, Q.when(true)).then(function () {
                return [dockerComposeConfig, "staging"];
            });
        })
        .spread(farmland.furrow)
        .then(function () {
            console.log('finished :D');
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
