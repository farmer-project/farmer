'use strict';

/**
 * Sort graph object based on input degree
 * @param {Object} graph - Graph object
 * @returns {*|Array.<T>}
 */
module.exports = function (graph) {
    return graph.getNodesArray().sort(function (a, b) {
        return a.inDeg - b.inDeg;
    });
};
