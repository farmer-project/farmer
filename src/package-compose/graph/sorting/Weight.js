'use strict';

var Q = require('q');

module.exports = function (graphDataSource) {
    var nodesByInfo = graphDataSource.getNodesByInfo();

    nodesByInfo.sort(function compare(a, b) {
        return a.weight - b.weight;
    });

    return nodesByInfo;
};