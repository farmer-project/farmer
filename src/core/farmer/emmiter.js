'use strict';

var _           = require('underscore'),
    Q           = require('q'),
    jsonHelper  = require('../helper/json');

function Emitter() {
    this.channel = {};
}

/**
 * Register plugin method
 *
 * @param event event hierarchy like 'create.shell'
 * @param priority Integer number
 * @param action method
 */
Emitter.prototype.register = function (event, priority, action) {
    this.channel = jsonHelper.create([event, priority], this.channel);
    Array.prototype.isArray = true;

    if (this.channel[event][priority].isArray) {
        this.channel[event][priority].push(action);
    } else {
        this.channel[event][priority] = [action];
    }
};

/**
 * Dispatch an event
 *
 * @param event
 * @param context
 */
Emitter.prototype.dispatch = function (event, context) {
    var priorityGraph = this.channel[event];

    _.each(this._getSortPriority(priorityGraph), function (priority) {
        _(priorityGraph[priority]).reduce(function (prevPromise, action) {
            return prevPromise.then(function () {

                return action(context);

            });
        }, Q.when(true));
    });
};

/**
 * Return priority
 *
 * @param priorityGraph
 * @returns {Array.<T>}
 * @private
 */
Emitter.prototype._getSortPriority = function (priorityGraph) {
    var keys = [];
    for(var key in priorityGraph) {
        keys.push(key);
    }

    return keys.sort();
};

module.exports = new Emitter();
