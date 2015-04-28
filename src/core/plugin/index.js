'use strict';

var _ = require('underscore'),
    path = require('path'),
    fs = require('fs');

function PluginRegistry() {
    this.listeners = {};
}

/**
 * Register all plugins
 *
 * Register all plugins those all defined in plugin.json file
 *
 * @returns {{alias: string}}
 */
PluginRegistry.prototype.registerAllPlugins = function () {
    var pluginRegistery = this,
        allPluginDescription = JSON.parse(fs.readFileSync(path.join(__dirname, 'plugins.json')));

    _(allPluginDescription).each(function (description) {
        var plugin = require(path.join(__dirname,  '../../', description.plugin));
        plugin.register(pluginRegistery);
    });
};

/**
 * Register plugin method listener on specific event
 *
 * @param event
 * @param method
 */
PluginRegistry.prototype.listenOn = function (event, method) {
    if (!this.listeners[event]) {
        this.listeners[event] = [];
    }

    this.listeners[event].push(method);
};

/**
 * Call specific event listener and pass data to them
 *
 * @param event
 * @param data
 */
PluginRegistry.prototype.emitEvent = function (event, data) {
    var listeners = this.listeners[event];
    listeners.forEach(function (method) {
        method(data);
    });
};

module.exports = new PluginRegistry();
