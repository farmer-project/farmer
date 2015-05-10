'use strict';

var RunPackage = require('./actions/RunPackage');

function PackageCompose() {

}

PackageCompose.prototype.run = function (config) {
    var runner = new RunPackage();
    return runner.execute(config);
};

module.exports = new PackageCompose();
