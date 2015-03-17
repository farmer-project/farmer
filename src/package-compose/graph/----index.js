'use strict';

var Sorting = require('./sorting'),
    GraphDataSource = require('./index');
/**
 *  error on circle
 *  error on node define in edges but it's not defined in main nodes
 */

function Graph() {
    this.graphdataSource = new GraphDataSource();
}

Graph.prototype.addNode = function(lable) {
    this.graphdataSource.addNode(lable);

    return this;
};

Graph.prototype.addEdge = function(src, destination) {
    this.graphdataSource.addEdge(src, destination);

    return this;
};

Graph.prototype.sorting = function() {
    if (!this.graphdataSource.getNodes()) {
        return new Sorting(this.graphdataSource);
    }
    return null;
};

module.exports = Graph;
