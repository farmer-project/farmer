'use strict';

var _       = require('underscore'),
    path    = require('path'),
    config  = require(path.resolve(__dirname, '../../../config'));


function Compose() {
}

/**
 * Initialize compose data structure with container and dirs
 *
 * @param containers
 * @param dirs
 */
Compose.prototype.resolve = function (containers, dirs, hostname) {
    hostname = (hostname) ? hostname : 'farmer' + (new Date).getTime() + '_' + config.domain.replace(/\./g, '_');

    for (var alias in containers) {
        this._publishPorts(containers[alias]);
        this._isolateContainer(containers[alias], alias, hostname);
        this._dirBinding(containers[alias], dirs[alias]);
    }

    return containers;
};

/**
 * @param container
 * @private
 */
Compose.prototype._publishPorts = function (container) {
    if (container['ports']) {
        container['publishAllPorts'] = 'true';
    }
};

Compose.prototype._isolateContainer = function (container, alias, hostname) {
    if (!container['name']) container['name'] = alias + '_' + hostname;
    container['hostname'] = hostname;
};

Compose.prototype._dirBinding = function (container, dirs) {
    if (!dirs) {
        return;
    }

    var bind = [];
    _.each(dirs, function (dir, index) {
        bind.push(config.storage + '/' + container['hostname'] + '_' + String.fromCharCode(index+97) + ':' + dir);
    });
    container['binds'] = bind;
};

module.exports = new Compose();
