'use strict';

var _ = require('underscore');

/**
 * nodes [
 *       {
 *          "label": "A",
 *          "weight": 12,
 *          "out_deg": 2,
 *          "in_deg": 10,
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

GraphDataSource.prototype.getNodes = function () {
    return _.pluck(this.nodes, 'label');
};

GraphDataSource.prototype.getNodesArray = function () {
    return this.nodes;
};

GraphDataSource.prototype.getNode = function (label, forceCreate) {
    var node = _.findWhere(this.nodes, { label: label });

    if (!node && forceCreate) {
        node = this.addNode(label);
    }

    return node;
};

GraphDataSource.prototype.getEdges = function () {
    return this.edges;
};

GraphDataSource.prototype.getNodeEdges = function (label) {
    return this.getNode(label).edges;
};

GraphDataSource.prototype.addNode = function (label) {
    var node;

    if (node = this.getNode(label)) {
        return node;
    }

    node = {
        label: label,
        weight: 0,
        out_deg: 0,
        in_deg: 0,
        edges: []
    };

    this.nodes.push(node);

    return node;
};

GraphDataSource.prototype.addEdge = function (sourceLabel, destinationLabel) {
    var edge = {
        src: sourceLabel,
        dest: destinationLabel
    };

    this.edges.push(edge);

    this._addNodeEdge(sourceLabel, edge);
    this._addNodeEdge(destinationLabel, edge);
};

GraphDataSource.prototype.removeNode = function (label) {
    var nodeEdges = this.getNodeEdges(label);

    for (var i = 0; i < nodeEdges.length; i++) {
        this.removeEdge(nodeEdges[i].src, nodeEdges[i].dest);
    }

    this.nodes = _.reject(this.nodes, function (node) {
        return node.label === label;
    });
};

GraphDataSource.prototype.removeEdge = function (sourceLabel, destinationLabel) {
    var edge = {
        src: sourceLabel,
        dest: destinationLabel
    };

    this._removeNodeEdge(sourceLabel, edge);
    this._removeNodeEdge(destinationLabel, edge);

    this.edges = _.reject(this.edges, edge);
};

GraphDataSource.prototype._addNodeEdge = function (label, edge) {
    var node = this.getNode(label, true);

    if (label === edge.src) {
        node.out_deg++;
    } else if (label === edge.dest) {
        node.in_deg++;
    }

    node.edges.push(edge);
    node.weight++;
};

GraphDataSource.prototype._removeNodeEdge = function (label, edge) {
    var node = this.getNode(label);

    if (label === edge.src) {
        node.out_deg--;
    } else if (label === edge.dest) {
        node.in_deg--;
    }

    node.edges = _.reject(node.edges, edge);
    node.weight--;
};

module.exports = GraphDataSource;
