'use strict';

var _ = require('underscore'),
    Q = require('q'),
    upperCaseFirst = require('upper-case-first'),
    Parser = require('../parser'),
    Graph = require('../graph'),
    containerManager = require('../../container-manager')
    ;

function RunPackage () {
    this.containers = {};
}

RunPackage.prototype.parsAndRun = function (composeFile, vars) {
    var self = this;

    return Parser.parse(composeFile, vars)
        .then(function (config) {
            return self._sortByCreationPriority(config);
        })
        .spread(function (nodes, config) {
            return self._createContainers(nodes, config);
        })
    ;
};


RunPackage.prototype.execute = function (config) {
    var self = this;

    return this
        ._sortByCreationPriority(config)
        .spread(function (nodes, config) {
            return self._createContainers(nodes, config);
        })
    ;
};

RunPackage.prototype._sortByCreationPriority = function (config) {
    var graphSortTopological = require('../graph/sorting/Topological');

    return this._buildContainersGraph(config)
        .then(graphSortTopological)
        .then(function (sortedNodes) {
            return [sortedNodes, config];
        }, function (reason) {
            console.log('_sortByCreationPriority FAILED.', reason);
        })
    ;
};

RunPackage.prototype._createContainers = function (nodes, config) {
    var self = this,
        results = [];

    return nodes.reduce(function (prevPromise, node, index) {
        return prevPromise.then(function () {
            return self._runContainer(node, config[node]).then(function (result) {
                result.message.alias = node;
                results.push(result.message);
                if (nodes.size() - 1 === index) {
                    return results;
                }
            });
        });
    }, Q.when(true));
};

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

RunPackage.prototype._runContainer = function (alias, config) {
    var self = this;

    if (config.hasOwnProperty('image')) {
        var request = this._dockerApiRequestCreator(config);
        console.log('request', request);
        console.log('>>>>>>>>>>>>>>');
        return containerManager
            .runContainer(request)
            .then(function (result) {
                return containerManager
                    .getContainerInfo(result.id)
                    .then(function (result) {
                        self.containers[alias] = result.message.Name.replace('/', '');
                        return result;
                    });
            });

    } else {
        return Q.reject('Image is not specified in package info.');
    }
};

RunPackage.prototype._dockerApiRequestCreator = function (config) {
    var self = this,
        request = {
            'HostConfig': {}
        },
        HostConfig = [
            "binds",
            "links",
            "lxcConf",
            "portBindings",
            "publishAllPorts",
            "privileged",
            "readonlyRootfs",
            "dns",
            "dnsSearch",
            "extraHosts",
            "volumesFrom",
            "capAdd",
            "capdrop",
            "restartPolicy",
            "networkMode",
            "devices"
        ];

    _.each(config, function (value, key) {
        if (key == 'links') {
            _.each(value, function (link) {
                var parts = link.split(':'),
                    pkgAlias = parts[0],
                    containerAlias = typeof parts[1] !== 'undefined'
                        ? parts[1] : pkgAlias;

                request['HostConfig']['Links'] =
                    self.containers[pkgAlias] + ':' + containerAlias;
            });

        } else if (key == 'ports') {
            var portBindings = {};
            _.each(value, function (port) {
                if (port.indexOf('/') > 0) {
                    portBindings[port] = [];
                } else {
                    portBindings[port + '/tcp'] = [];
                }

                request['ExposedPorts'] = portBindings;
            });

        } else if (key == 'volumes') {
            var volBindings = [];
            _.each(value, function (vol) {
                volBindings.push(vol);
            });

            request['HostConfig']['Binds'] = volBindings;

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
