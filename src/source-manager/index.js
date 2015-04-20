'use strict';

var Q = require('q'),
    _ = require('underscore'),
    git = require('./git')
    ;

function SourceManager () {

}

/**
 * get array of object that they contain source information
 * @param sourceCodes array[]
 * @param publisher
 * @returns {Bluebird.Promise|*}
 */
SourceManager.prototype.downloadSourceCode = function (sourceCodes, publisher) {
    var self = this;

    publisher.pub("code cloning", true);

    return _(sourceCodes).reduce(function (prevPromise, conf) {
        return prevPromise.then(function () {
            publisher.pub(JSON.stringify(conf) + "code cloning...");

            return self.get(conf).then(function () {
                publisher.pub("code cloned");
            });

        });
    }, Q.when(true)).then(function () {
        publisher.pub("code cloning finished");
    });

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
            return git.clone(config).execute();
    }
};

module.exports = new SourceManager;