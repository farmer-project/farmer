'use strict';

var _ = require('underscore'),
    sortByOutDegree = require('./OutDegree');

module.exports = function (graph) {
    var sortedNodes  = [],
        node,
        found;

    while (graph.getNodes().length) {
        found = false;
        _.each(sortByOutDegree(graph), function (node) {
            if (node.out_deg == 0) {
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
