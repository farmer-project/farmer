'use strict';

var _ = require('underscore'),
    Q = require('q'),
    domainManager = require('../domain-manager'),
    config = require('../config');

function Procfile() {
    this.containers = {};
    this.git = {};
    this.shell = {};
    this.packageConfig = [];
    this.sourceCodes = [];
}

Procfile.prototype.init = function (procfile) {
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

Procfile.prototype.getPackageConfig = function () {
    return this.packageConfig;
};

Procfile.prototype.getSourceCodes = function () {
    return this.sourceCodes;
};

Procfile.prototype.getShellCommands = function () {
    return this.shell;
};


Procfile.prototype._validation = function (procfile) {
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
Procfile.prototype._packageConfigResolver = function () {
    var self = this;

    return this._codeBinding(self._isolate(this.containers), this.git);
};

/**
 * Parse information and said which code with what type, which source and branch to where
 *
 * @returns {Array}
 * @private
 */
Procfile.prototype._sourceCodeResolver = function () {
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
Procfile.prototype._isolate = function (containers) {
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
Procfile.prototype._codeBinding = function (containers, git) {
    _.each(git, function(gitConf, alias) {
        containers[alias]['volumes'] = [config.greenhouse + '/' + containers[alias]['hostname'] + ':/app'];
    });

    return containers;
};

module.exports = Procfile;
