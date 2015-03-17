'use strict';

var _ = require('lodash');

/**
 * nodes [
 *       {
 *          "label": "A",
 *          "weight": 12,
 *          "edges": [],
 *          ...
 *      },
 *      ...
 * ]
 *
 */

function GraphDataSource () {
    this.nodes = [];
    this.edges = [];
}

GraphDataSource.prototype.indexOf = function (searchLabel) {
    return this.nodes
        .map(function(e) { return e.label; })
        .indexOf(searchLabel);
};

GraphDataSource.prototype.getNodes = function () {
    var nodesArr = [];
    for (var i = 0; i < this.nodes.length; i++) {
        if (this.nodes[i].hasOwnProperty('label')) {
            nodesArr.push(this.nodes[i]['label']);
        }
    }

    return nodesArr;
};

GraphDataSource.prototype.getNodesByInfo = function () {
    return this.nodes;
};

GraphDataSource.prototype.getNodeInfo = function (label, property) {
    if (typeof property !== 'undefined')
        return this.nodes[this.indexOf(label)][property];

    return this.nodes[this.indexOf(label)];
};

GraphDataSource.prototype.getEdges = function () {
    return this.edges;
};

GraphDataSource.prototype.getNodeEdges = function (label) {
    return this.nodes[this.indexOf(label)]["edges"];
};

GraphDataSource.prototype.addEdge = function (src, dest) {
    var edge = {
        "src": src,
        "dest": dest
    };

    this.edges.push(edge);

    this._addNodeWeight(src);
    this._addNodeWeight(dest);

    this._addNodeEdge(src, edge);
    this._addNodeEdge(dest, edge);

    this._calNodesDeg(edge);
};

GraphDataSource.prototype.addNode = function (label) {
    this.nodes.push({
        label: label,
        weight: 0,
        out_deg: 0,
        in_deg: 0,
        edges: []
    });
};

GraphDataSource.prototype.removeNode = function (label) {
    var nodeEdge = this.getNodeEdges(label);

    for (var i = 0; i < nodeEdge.length; i++) {
        this._removeEdge(nodeEdge[i]);
    }

    this.nodes.splice(this.indexOf(label), 1);
};

GraphDataSource.prototype._addNodeWeight = function (label) {
    this.nodes[this.indexOf(label)]["weight"] += 1;
};

GraphDataSource.prototype._addNodeEdge = function (label, edge) {
    this.nodes[this.indexOf(label)]["edges"].push(edge);
};

GraphDataSource.prototype._calNodesDeg = function (edge) {
    this.nodes[this.indexOf(edge.src)]["out_deg"] += 1;
    this.nodes[this.indexOf(edge.dest)]["in_deg"] += 1;
};

GraphDataSource.prototype._removeEdge = function (edge) {
    var indexSrc = this.indexOf(edge.src),
        indexDest = this.indexOf(edge.dest);

    this.nodes[this.indexOf(edge.src)]["weight"] -= 1;
    this.nodes[this.indexOf(edge.src)]["out_deg"] -= 1;
    _.remove(this.nodes[indexSrc]['edges'], edge);

    this.nodes[this.indexOf(edge.dest)]["in_deg"] -= 1;
    this.nodes[this.indexOf(edge.dest)]["weight"] -= 1;
    _.remove(this.nodes[indexDest]['edges'], edge);

    _.remove(this.nodes['edges'], edge);
};

module.exports = GraphDataSource;
