/**
 * this method need an object with these properties
 * {
 *  "name":
 *  "repo":
 *  "code_destination",
 *  "branch"
 * }
 * and use system ssh private key to communicate with server
 */

'use strict';

var Q = require('q'),
    Nodegit = require('nodegit');

function Clone(object) {
    this.config = object || {};

    if (!this.config.name || !this.config.repo || !this.config.code_destination)
        throw new error("invalid arguments");

    this.config.branch = object.branch || 'master';
}

Clone.prototype.execute = function () {

    var deferred = Q.defer(),
        self = this,
        options = {
            remoteCallbacks: {
                credentials: function(url, userName) {
                    return Nodegit.Cred.sshKeyFromAgent("vagrant");
                },
                certificateCheck: function() {
                    return 1;
                }
            },
            checkoutBranch: self.config.branch
        };

    Nodegit.Clone
        .clone(this.config.repo, this.config.code_destination , options)
        .then(function (result) {

            deferred.resolve({
                "statusCode": 200,
                "message": self.config
            });
        }, function(error){
            deferred.reject({
                "statusCode": 500,
                "message": error
            });
        });

    return deferred.promise;
};

module.exports = Clone;
