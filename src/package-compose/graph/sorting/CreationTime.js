'use strict';

var outDegreeOrdering = require('./OutDegree');

module.exports = function (graphDataSource) {
    var graph = graphDataSource,

        nodesSortedByOutDegree = [],
        nodesSortedByCreationTime  = [],
        element = {};

    while (graph.getNodes().length > 0) {
        nodesSortedByOutDegree = outDegreeOrdering(graph);

        for (var i = 0, l = graph.getNodes().length; i < l; i++) {
            element = nodesSortedByOutDegree[i];
            if (element['out_deg'] == 0) {
                nodesSortedByCreationTime.push(element['label']);
                graph.removeNode(element['label']);

                // Rewind when removes an item
                i--; l--;
            }
        }
    }

    // TODO: error handling + loop Error handling
    return nodesSortedByCreationTime;
};
