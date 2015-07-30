'use strict';

/**
 * Sort graph object based on node out degree
 * @param {Object} graph - Graph object
 * @returns {*|Array.<T>}
 */
module.exports = function (graph) {
    return graph.getNodesArray().sort(function (a, b) {
        return a.outDeg - b.outDeg;
    });
};
