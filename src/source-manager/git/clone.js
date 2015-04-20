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
    Nodegit = require('nodegit'),
    url = require('ssh-url'),
    config = require('../../config');

function Clone(object) {
    this.config = object || {};

    if (!this.config.repo || !this.config.code_destination)
        throw new Error("invalid arguments");

    this.config.branch = object.branch || 'master';
}

Clone.prototype.execute = function () {
    var deferred = Q.defer(),
        self = this,
        options = this._optionResolver(this.config)
    ;

    Nodegit.Clone
        .clone(this.config.repo, this.config.code_destination, options)
        .then(function (result) {
            deferred.resolve(self.config);
        }, function(error){
            deferred.reject(error.toString());
        });

    return deferred.promise;
};

Clone.prototype._optionResolver = function (git) {
    var option = {
            remoteCallbacks: {
                certificateCheck: function() {
                    return 1;
                }
            },
            checkoutBranch: git.branch
        }
    ;

    if (url.parse(git.repo).protocol === 'ssh:') {
        option['remoteCallbacks']['credentials'] = function (url, username) {
            return Nodegit.Cred.sshKeyNew(
                username,
                config.git_public_key,
                config.git_private_key,
                "")
                ;
        };
    }

    return option;
};

module.exports = Clone;
