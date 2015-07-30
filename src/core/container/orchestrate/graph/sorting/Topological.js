'use strict';

var _ = require('underscore'),
    sortByOutDegree = require('./OutDegree');

/**
 * Sort graph object based on topology
 * @param {Object} graph - Graph object
 * @returns {*}
 */
module.exports = function (graph) {
    var sortedNodes  = [],
        node,
        found;

    while (graph.getNodes().length) {
        found = false;
        _.each(sortByOutDegree(graph), function (node) {
            if (0 == node.outDeg) {
                found = true;
                sortedNodes.push(node.label);
                graph.removeNode(node.label);
            }
        });

        if (!found) {
            throw new Error('Circular node relations found! ');
        }
    }

    return _(sortedNodes);
};
