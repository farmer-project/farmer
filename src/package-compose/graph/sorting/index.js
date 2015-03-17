'use strict';

function Sorting(graphDataSource) {
    this.graphDataSource = graphDataSource;
}

Sorting.prototype.creatingTime = require('./CreationTime');

Sorting.prototype.weight = require('./Weight');

Sorting.prototype.outDegree = require('./OutDegree');

Sorting.prototype.inDegree = require('./InDegree');

module.exports = Sorting;
