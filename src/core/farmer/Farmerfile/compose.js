'use strict';

var _       = require('underscore'),
    path    = require('path'),
    config  = require(path.resolve(__dirname, '../../../config'));

function Compose() {
}

/**
 * Initialize compose data structure with container and dirs
 * @param {Object} containers - compose json
 * @param {Object} dirs
 * @param {string} [hostname = farmerTIME_DOMAIN  ]
 */
Compose.prototype.mapDataToContainerApi  = function (containers, dirs, hostname) {
    var containersConfig = {};
    if (!hostname) {
        hostname = 'farmer' + (new Date).getTime() + '_' + config.DOMAIN;
        hostname = hostname.replace(/\./g, '_');
    }

    for (var alias in containers) {
        var dockerConf = containers[alias];
        this._publishPorts(dockerConf);
        this._isolateContainer(dockerConf, alias, hostname);
        this._dirBinding(dockerConf, dirs[alias]);

        containersConfig[alias] = dockerConf;
    }

    return containersConfig;
};

/**
 * Set container open port
 * @param {Object} dockerConf - docker config
 * @private
 */
Compose.prototype._publishPorts = function (dockerConf) {
    var ports = dockerConf['ports'];

    if (!ports) {
        return;
    }

    delete dockerConf['ports'];
    dockerConf['publishAllPorts'] = true;

    var exposedPorts = {};
    _.each(ports, function (portAndProtocol) {
        if (-1 === portAndProtocol.indexOf('/')) {
            portAndProtocol += '/tcp';
        }

        exposedPorts[portAndProtocol] = {};
    });

    dockerConf['exposedPorts'] = exposedPorts;
};

/**
 * Isolate container
 * In-order ot isolate container assign it specific name and hostname
 * @param {Object} dockerConf - docker config object
 * @param {string} alias
 * @param {string} hostname
 * @private
 */
Compose.prototype._isolateContainer = function (dockerConf, alias, hostname) {
    if (!dockerConf['name']) {
        dockerConf['name'] = hostname + '_' + alias;
    }

    dockerConf['hostname'] = hostname;
};

/**
 * Bind directories to container
 * @param {Object} dockerConf
 * @param {Array} dirs - array of directories
 * @private
 */
Compose.prototype._dirBinding = function (dockerConf, dirs) {
    var hostVol = config.STORAGE,
        bind = [];

    if (!dirs) {
        return;
    }

    _.each(dirs, function (dir, index) {
        hostVol = hostVol + '/' + dockerConf['hostname'] + '_' + String.fromCharCode(index + 97);
        bind.push(hostVol + ':' + dir);
    });

    dockerConf['binds'] = bind;
};

module.exports = new Compose();
