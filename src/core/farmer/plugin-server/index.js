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
 * Register all plugin methods by call their "registerPlugin" method
 * those all defined in plugin.json file
 * any plugin must be singleton and promisable
 *
 * @returns {{alias: string}}
 */
PluginRegistry.prototype.registerAllPlugins = function () {
    var allPluginDescription = JSON.parse(fs.readFileSync(path.join(__dirname, 'plugins.json')));

    _(allPluginDescription).each(function (description) {
        var plugin = require(path.join(__dirname,  '../../../', description.plugin));
        plugin.registerPlugin();
    });
};

module.exports = new PluginRegistry();
