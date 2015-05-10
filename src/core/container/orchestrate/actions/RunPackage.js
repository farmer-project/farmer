'use strict';

var _               = require('underscore'),
    Q               = require('q'),
    path            = require('path'),
    upperCaseFirst  = require('upper-case-first'),
    Graph           = require('../graph'),
    log             = require(path.resolve(__dirname, '../../../debug/log')),
    Container       = require('../../index');

/**
 * @constructor
 */
function RunPackage () {
    this.containers = {};
}

/**
 * Create compose container
 * @param {Object} config
 * @returns {Bluebird.Promise|*}
 */
RunPackage.prototype.execute = function (config) {
    var self = this;

    return this
        ._sortByCreationPriority(config)
        .spread(function (nodes, config) {
            return self._createContainers(nodes, config);
        })
    ;
};

/**
 * Sort container based on topological priority
 * @param {Object} config
 * @returns {Bluebird.Promise|*}
 * @private
 */
RunPackage.prototype._sortByCreationPriority = function (config) {
    var graphSortTopological = require('../graph/sorting/Topological');

    return this._buildContainersGraph(config)
        .then(graphSortTopological)
        .then(function (sortedNodes) {
            return [sortedNodes, config];
        }, log.error);
};

/**
 * Create array of containers
 * @param {Array} nodes
 * @param {Object} config
 * @returns {*}
 * @private
 */
RunPackage.prototype._createContainers = function (nodes, config) {
    var self = this,
        results = {};

    return nodes.reduce(function (prevPromise, alias) {
        return prevPromise.then(function () {
            return self._runContainer(alias, config[alias]).then(function (container) {
                results[alias] = container;
                return results;
            });
        });
    }, Q.when(true));
};

/**
 * Create a graph based on compose file content
 * @param {Object} config
 * @returns {*}
 * @private
 */
RunPackage.prototype._buildContainersGraph = function (config) {
    var graph = new Graph();

    // Add edges
    _.each(config, function (container, key) {
        graph.addNode(key);
        if ('links' in container) {
            _.each(container.links, function (link) {
                graph.addEdge(key, link);
            });
        }
    });

    return Q.when(graph);
};

/**
 * Run containers
 * @param {string} alias
 * @param {Object} config
 * @returns {*}
 * @private
 */
RunPackage.prototype._runContainer = function (alias, config) {
    var self = this,
        container = new Container(),
        request = this._dockerApiRequestCreator(config);

    return container.run(request).tap(function (containerObj) {
        self.containers[alias] = containerObj.getConfigurationEntry('Name').replace('/', '');
    });
};

/**
 * Manipulate compose config to docker API config
 * @param {Object} config - docker config
 * @returns {{HostConfig: {}}}
 * @private
 */
RunPackage.prototype._dockerApiRequestCreator = function (config) {
    var self = this,
        request = {
            'HostConfig': {}
        },
        HostConfig = [
            'binds',
            'links',
            'lxcConf',
            'portBindings',
            'publishAllPorts',
            'privileged',
            'readonlyRootfs',
            'dns',
            'dnsSearch',
            'extraHosts',
            'volumesFrom',
            'capAdd',
            'capdrop',
            'restartPolicy',
            'networkMode',
            'devices'
        ];

    _.each(config, function (value, key) {
        if (key == 'links') {
            _.each(value, function (link) {
                var parts = link.split(':'),
                    alias = parts[0],
                    containerAlias = typeof parts[1] !== 'undefined' ? parts[1] : alias;

                request['HostConfig']['Links'] =
                    self.containers[alias] + ':' + containerAlias;
            });

        } else if (HostConfig.indexOf(key) > -1) {
            request['HostConfig'][upperCaseFirst(key)] = value;

        } else if (key == 'hostConfig') {
            _.each(value, function (hcValue, hcKey) {
                request['HostConfig'][upperCaseFirst(hcKey)] = hcValue;
            });
        } else {
            request[upperCaseFirst(key)] = value;
        }

    });

    return request;
};

module.exports = RunPackage;
