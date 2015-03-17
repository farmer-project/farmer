'use strict';

module.exports = function (graphDataSource) {
    var nodesByInfo = graphDataSource.getNodesByInfo();

    nodesByInfo.sort(function compare(a, b) {
        return a.out_deg - b.out_deg;
    });

    return nodesByInfo;
};
