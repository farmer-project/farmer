'use strict';

var _ = require('underscore'),
    Q = require('q'),
    config = require('../config'),
    SshClient = require('node-ssh'),
    LogCenter = require('../log-center')
    ;


function ContainerCommander () {

}

ContainerCommander.prototype.shell = function (ip, commands, publisher) {
    var deferred = Q.defer(),
        ssh = new SshClient({
        host: ip,
        username: 'root',
        privateKey: config.container_private_key
    });

    //  in order to disconnect from container at the end
    commands.push('exit');

    ssh.connect().then(function () {
        return _(commands).reduce(function (prevPromise, cmd) {
            return prevPromise.then(function () {
                var cmdDeferred = Q.defer();

                publisher.pub(
                    'container: ' + ip +
                    ' command: ' + cmd
                );
                ssh.exec(cmd).then(function (result) {
                    if (result.stderr) {
                        cmdDeferred.reject(result.stderr);
                    }
                    publisher.pub('output: ' + result.stdout);
                    cmdDeferred.resolve(result.stdout);
                }, function (reason) {
                    cmdDeferred.reject(reason);
                });

                return cmdDeferred.promise;
            });

        }, Q.when(true)).then(deferred.resolve, deferred.reject);
    });

    return deferred.promise;
};

module.exports = new ContainerCommander;