'use strict';

var Q               = require('q'),
    RunPackage      = require('./actions/RunPackage'),
    StopPackage     = require('./actions/StopPackage'),
    RestartPackage  = require('./actions/RestartPackage'),
    BackupPackage   = require('./actions/BackupPackage'),
    RestorePackage  = require('./actions/RestorePackage');

function PackageCompose() {

}

PackageCompose.prototype.run = function (config) {
    var runner = new RunPackage();
    return runner.execute(config);
};

PackageCompose.prototype.stop = function (hostname, sec) {
    var stop = new StopPackage();
    return stop.execute(hostname, sec);
};

PackageCompose.prototype.restart = function (hostname, sec) {
    var restart = new RestartPackage();
    return restart.execute(hostname, sec);
};

PackageCompose.prototype.backup = function (hostname, tag) {
    if (!hostname || !tag) {
        return Q.reject('Invalid arguments');
    }

    var backup = new BackupPackage();
    return backup.execute(hostname, tag);
};

PackageCompose.prototype.restore = function (tag) {
    if (!tag) {
        return Q.reject('Invalid argument');
    }

    var restore = new RestorePackage();
    return restore.execute(tag);
};

module.exports = new PackageCompose();
