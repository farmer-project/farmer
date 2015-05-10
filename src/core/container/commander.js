'use strict';

var _       = require('underscore'),
    Q       = require('q'),
    SshClient = require('node-ssh'),
    path    = require('path'),
    config  = require(path.resolve(__dirname, '../../config')),
    log     = require(path.resolve(__dirname, '../debug/log'));

/**
 * @constructor
 */
function Commander () {

}

/**
 * Run array of command on specific container
 * @param {string} ip - Ip
 * @param {Array} commands - Commands array
 * @param {Publisher} publisher - Publisher object
 * @returns {*|promise}
 */
Commander.prototype.shell = function (ip, commands, publisher) {
    var deferred = Q.defer(),
        ssh = new SshClient({
        host: ip,
        username: 'root',
        privateKey: config.CONTAINER_PRIVATE_KEY
    });

    //  in order to disconnect from container at the end
    commands.push('exit');

    ssh.connect().then(function () {
        return _(commands).reduce(function (prevPromise, cmd) {
            return prevPromise.then(function () {
                var cmdDeferred = Q.defer();

                publisher.toClient(
                    'container: ' + ip +
                    ' command: ' + cmd
                );
                ssh.exec(cmd).then(function (result) {
                    if (result.stderr) {
                        publisher.toClient('error: ' + result.stderr);
                        cmdDeferred.reject(result.stderr);
                    }
                    publisher.toClient('output: ' + result.stdout);
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

module.exports = new Commander;
