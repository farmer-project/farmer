/**
 * this method need an object with these properties
 * {
 *  "repo":
 *  "code_destination",
 *  "branch"
 * }
 * and use system ssh private key to communicate with server
 */

'use strict';

var Q = require('q'),
    shelljs = require('shelljs'),
    config = require('../../config');

function Clone(object) {
    this.config = object || {};

    if (!this.config.repo || !this.config.code_destination)
        throw new Error("invalid arguments");

    this.config.branch = object.branch || 'master';
}

Clone.prototype.execute = function () {
    var deferred = Q.defer(),
        gitCommand = "ssh-agent bash -c 'ssh-add "+config.git_private_key+"; git clone -b "+this.config.branch+" --depth 1 "+
            this.config.repo+" "+this.config.code_destination+"'";

    if (shelljs.exec(gitCommand) === 0) {
        deferred.resolve('code cloned');
    } else {
        deferred.reject('failed');
    }

    return deferred.promise;
};

module.exports = Clone;

