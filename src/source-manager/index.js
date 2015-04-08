'use strict';

var Q = require('q'),
    _ = require('underscore'),
    git = require('../git')
    ;

function SourceManager () {

}

/**
 *
 * @param sourceCodes array[]
 * @returns {*}
 */
SourceManager.prototype.downloadSourceCode = function (sourceCodes) {
    var self = this;

    return _(sourceCodes).reduce(function (prevPromise, conf) {
        return prevPromise.then(function () {
            return self.get(conf);
        });
    }, Q.when(true));

};

SourceManager.prototype.get = function (config) {

    switch (config.type) {
        case "zip":
        case "Zip":
        case "ZIP":
            break;

        case "git":
        case "Git":
        case "GIT":
        default:
            return git.clone({
                repo: config.repo,
                code_destination: config.code_destination,
                branch: config.branch
            }).execute();
    }
};

module.exports = new SourceManager;