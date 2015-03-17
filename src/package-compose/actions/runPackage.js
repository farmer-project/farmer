'use strict';

var Parser = require('../parser'),
    Graph = require('../graph'),
    creatingTimeGraphOrdering = require('../graph/sorting/CreationTime'),
    containerManager = require('../../container-manager'),
    Q = require('q');

function RunPackage () {

}

RunPackage.prototype.execute = function (pkg, vars) {
    var deferred = Q.defer(),
        self = this;

    Parser.parse(pkg, vars)
        .then(function (containers) {

            try {
                var graph = self._containerGraph(containers),
                    creationTimeOrdering = creatingTimeGraphOrdering(graph);

                for (var i = 0; i < creationTimeOrdering.length; i++) {
                    if (containers.hasOwnProperty(creationTimeOrdering[i]))
                        self._runContainer(containers[creationTimeOrdering[i]]);
                }

                deferred.resolve(creationTimeOrdering);

            } catch (e) {
                deferred.reject(e);
            }

        }, function (error) {
            deferred.reject(error);
        });

    return deferred.promise;
};

RunPackage.prototype._containerGraph = function (containers) {
    var graph = new Graph();

    // set nodes
    for (var key in containers) {
        if (containers.hasOwnProperty(key)) {
            if (!containers[key]['image'])
                throw new Error('invalid package variables');

            graph.addNode(key);
        }
    }

    // add edges
    var graphNodesArr = graph.getNodes();
    if(graphNodesArr.length > 0) {

        for (var i = 0; i < graphNodesArr.length; i++) {

            if (containers.hasOwnProperty(graphNodesArr[i])) {

                var links = containers[graphNodesArr[i]]['links'];
                if (typeof links != 'undefined') {
                    for (var b = 0; b < links.length; b++)
                        graph.addEdge(graphNodesArr[i], links[b]);
                }
            }
        }

    } else {
        throw new Error('container names are not defined');
    }

    return graph;
};

RunPackage.prototype._runContainer = function (config) {
    var request = this._dockerApiRequestCreator(config);
    containerManager.runContainer(request);

};

RunPackage.prototype._dockerApiRequestCreator = function (config) {
    var HostConfig = [
        "bind",
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
};

module.exports = new RunPackage();
