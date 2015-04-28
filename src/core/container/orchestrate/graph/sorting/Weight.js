'use strict';

module.exports = function (graph) {
    return graph.getNodesArray().sort(function compare(a, b) {
        return a.weight - b.weight;
    });
};