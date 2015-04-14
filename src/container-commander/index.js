'use strict';

var _ = require('underscore'),
    Q = require('q'),
    config = require('../config'),
    SshClient = require('node-ssh'),
    LogCenter = require('../log-center')
    ;


function ContainerCommander () {

}

ContainerCommander.prototype.shell = function (ip, commands) {
    var ssh = new SshClient({
        host: ip,
        username: 'root',
        privateKey: config.container_private_key
    });

    //  to disconnect from container
    commands.push('exit');

    return ssh.connect().then(function () {
        return _(commands).reduce(function (prevPromise, cmd) {
            return prevPromise.then(function () {
                return ssh.exec(cmd).then(function (result) {
                    console.log('result.stdout', result.stdout);
                    console.log('result.stderr', result.stderr);
                });
            });

        }, Q.when(true));

    });
};

module.exports = new ContainerCommander;