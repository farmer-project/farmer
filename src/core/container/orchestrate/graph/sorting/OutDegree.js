'use strict';

module.exports = function (graph) {
    return graph.getNodesArray().sort(function (a, b) {
        return a.out_deg - b.out_deg;
    });
};
