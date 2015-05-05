'use strict';

var path         = require('path'),
    pluginServer = require('./plugin-server'),
    emitter      = require(path.resolve(__dirname, './emmiter')),
    Bag          = require('./Bag');

function Farmer() {

}

/**
 * start Farmer to work
 */
Farmer.prototype.run = function () {
    pluginServer.registerAllPlugins();
};

/**
 * Fire an event and run plugins
 *
 * @param mainEvent event name in string
 * @param bagObj Bag object
 */
Farmer.prototype.fireEvent = function (mainEvent, bagObj) {
    emitter.dispatch(mainEvent, bagObj);
};


module.exports = new Farmer();
