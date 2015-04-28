'use strict';

var Q = require('q'),
    _ = require('underscore'),
    fs = require('fs'),
    FarmerFile = require('../../farmer-file'),
    containerCommander = require('../../container/commander'),
    config = require(require('path').resolve(__dirname, '../../../config')),
    farmland = require('./farmland');

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

Seed.prototype.implant = function (farmerFileJson, publisher) {
    var farmerFile = new FarmerFile();

    try {
        farmerFile.init(farmerFileJson);

        return farmland.furrow(farmerFile.getPackageConfig(), 'staging', publisher)
            .then(function (result) {
                publisher
                    .toClient('run shell commands on containers')
                    .subWorksStart();
                return farmerFile
                    .getShellCommands().reduce(function (prePromise, commands, alias) {
                        return prePromise.then(function () {
                            var ip = result[_.findIndex(result, {alias: alias})].NetworkSettings.IPAddress;

                            return containerCommander.shell(ip, commands, publisher);
                        });
                    }, Q.when(true)).finally(publisher.subWorksFinish);
        });

    } catch (e) {
        publisher.toClient(e);
        return Q.reject(e);
    }
};

module.exports = Seed;
