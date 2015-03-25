'use strict';

function Sorting(graphDataSource) {
    this.graphDataSource = graphDataSource;
}

Sorting.prototype.creatingTime = require('./Topological');

Sorting.prototype.weight = require('./Weight');

Sorting.prototype.outDegree = require('./OutDegree');

Sorting.prototype.inDegree = require('./InDegree');

module.exports = Sorting;
