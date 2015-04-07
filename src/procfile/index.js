'use strict';

var _ = require('underscore'),
    Q = require('q'),
    domainManager = require('../domain-manager'),
    config = require('../config');

function Procfile() {

}

Procfile.prototype.dockerComposeConfigResolver = function (containers, gitConf) {
    var config = {};

    if( typeof containers === 'object' && Object.keys(containers).length > 0) {
        config = this._isolate(containers);
        config = this._codeBinding(config, gitConf);
    } else {
        return Q.reject('compose file is not parsable');
    }

    return Q.resolve(config);
};

/**
 * isolate container group
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
 * bind any container code destination to their "app" folder
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

module.exports = new Procfile();
