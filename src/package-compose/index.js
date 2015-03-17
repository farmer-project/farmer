'use strict';

var runPackage = require('./actions/runPackage');

function PackageCompose() {

}

PackageCompose.prototype.run = function (config) {
    return runPackage
        .execute(config.packages, config.vars);
};

module.exports = new PackageCompose();