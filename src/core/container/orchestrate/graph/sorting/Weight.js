'use strict';

/**
 * Sort graph object based on weight
 * @param {Object} graph - Graph object
 * @returns {*|Array.<T>}
 */
module.exports = function (graph) {
    return graph.getNodesArray().sort(function compare(a, b) {
        return a.weight - b.weight;
    });
};
