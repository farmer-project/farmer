'use strict';

module.exports = function (graph) {
    return graph.getNodesArray().sort(function (a, b) {
        return a.in_deg - b.in_deg;
    });
};