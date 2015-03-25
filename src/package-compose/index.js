'use strict';

var RunPackage = require('./actions/RunPackage');

function PackageCompose() {

}

PackageCompose.prototype.run = function (config) {
    var runner = new RunPackage();
    return runner.execute(config.packages, config.vars);
};

module.exports = new PackageCompose();