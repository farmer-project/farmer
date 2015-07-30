'use strict';

var path         = require('path'),
    pluginServer = require('./plugin-server'),
    emitter      = require(path.resolve(__dirname, './emmiter')),
    Bag          = require('./Bag');

function Farmer() {
}

/**
 * Run farmer core
 */
Farmer.prototype.run = function () {
    pluginServer.registerAllPlugins();
};

/**
 * Fire an event and start plugins work flow
 * @param {string} mainEvent - Event name
 * @param {Bag} bagObj - Bag object
 */
Farmer.prototype.fireEvent = function (mainEvent, bagObj) {
    emitter.dispatch(mainEvent, bagObj);
};

module.exports = new Farmer();
