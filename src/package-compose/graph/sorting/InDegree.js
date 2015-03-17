'use strict';

module.exports = function (graphDataSource) {
    var nodesByInfo = graphDataSource.getNodesByInfo();

    nodesByInfo.sort(function compare(a, b) {
        return a.in_deg - b.in_deg;
    });

    return nodesByInfo;
};
