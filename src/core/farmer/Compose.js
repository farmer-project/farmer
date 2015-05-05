'use strict';

var _ = require('underscore'),
    domainManager = require('../sysadmin/domain-manager'),
    config = require(require('path').resolve(__dirname, '../../config'));

function Compose() {
}

Compose.prototype.init = function (containers, dirs) {
    var domain = domainManager.generate('staging');

    for (var alias in containers) {
        this._publishPorts(containers[alias]);
        this._isolateContainer(containers[alias], alias, domain);
        this._dirBinding(containers[alias], dirs[alias]);
    }
};

Compose.prototype._publishPorts = function (container) {
    if (container['ports']) {
        container['publishAllPorts'] = true;
    }
};

Compose.prototype._isolateContainer = function (container, alias, domain) {
    if (!container['name']) container['name'] = alias + '_' + domain;
    container['hostname'] = domain;
};

Compose.prototype._dirBinding = function (container, dirs) {
    if (!dirs) {
        return;
    }

    var bind = [];
    _.each(dirs, function (dir, index) {
        bind.push(config.greenhouse + '/' + String.fromCharCode(index+97) + container['hostname'] + ':' + dir);
    });
    container['bind'] = bind;
};

module.exports = Compose;
