'use strict';

var _       = require('underscore'),
    Q       = require('q'),
    Compose = require('./compose'),
    domainManager = require('../sysadmin/domain-manager'),
    config  = require(require('path').resolve(__dirname, '../../config'));

function FarmerFile() {
    this.compose = new Compose();

    this.containers = {};
    this.git = {};
    this.shell = {};
    this.packageConfig = [];
    this.sourceCodes = [];
}

FarmerFile.prototype.init = function (jsonContent) {
    this.compose.init(jsonContent.containers);

    this.containers = procfile.containers;
    this.git = procfile.git;
    this.shell = procfile.shell;

    try {
        this._validation(procfile);
        this.packageConfig = this._packageConfigResolver();
        this.sourceCodes = this._sourceCodeResolver();
    } catch (e) {
        throw new Error(e);
    }

    return this;
};

FarmerFile.prototype.getPackageConfig = function () {
    return _(this.packageConfig);
};

FarmerFile.prototype.getSourceCodes = function () {
    return _(this.sourceCodes);
};

FarmerFile.prototype.getShellCommands = function () {
    return this.shell;
};


FarmerFile.prototype._validation = function (procfile) {
    if( typeof this.containers !== 'object' &&
        Object.keys(this.containers).length > 0 )

        throw new Error('compose file is not parsable');
};

/**
 * Parse data and fetch package config (based on docker compose)
 *
 * @returns {{}}
 * @private
 */
FarmerFile.prototype._packageConfigResolver = function () {
    var self = this;

    return this._codeBinding(self._isolate(this.containers), this.git);
};

/**
 * Parse information and said which code with what type, which source and branch to where
 *
 * @returns {Array}
 * @private
 */
FarmerFile.prototype._sourceCodeResolver = function () {
    var self = this,
        sourceCodes = [];

    _(this.git).each(function (sourceConfig, alias) {
        sourceCodes.push({
            type: 'git',
            repo: sourceConfig.repo,
            branch: sourceConfig.branch || 'master',
            code_destination: self.packageConfig[alias]['volumes'][0].split(':')[0]
        });
    });

    return sourceCodes;
};

/**
 * Isolate container group
 *
 * @param containers
 * @returns {*}
 * @private
 */
FarmerFile.prototype._isolate = function (containers) {
    var domain = domainManager.generate('staging');

    _.each(containers, function(config, alias) {
        containers[alias]['name'] = (typeof config['name'] !== 'undefined') ?
            config['name'] : alias + '_' + domain;
        containers[alias]['hostname'] = domain;
    });

    return containers;
};

/**
 * Bind any container code destination to their "app" folder
 *
 * @param containers
 * @param git
 * @returns {*}
 * @private
 */
FarmerFile.prototype._codeBinding = function (containers, git) {
    _.each(git, function(gitConf, alias) {
        var dest = (git['dest'] == 'undefined')? '/app' : git.dest;
        containers[alias]['volumes'] = [config.greenhouse + '/' + containers[alias]['hostname'] + ':' + dest];
    });

    return containers;
};

module.exports = FarmerFile;
