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
 * Get all priority, sort them and exec all method in same priority level
 * when all done go to the next priority functions
 *
 * @param event
 * @param context
 */
Emitter.prototype.dispatch = function (event, context) {
    var priorityGraph = this.channel[event];

    _(this._getSortPriority(priorityGraph)).reduce(function (prevPromise, priority) {
        return prevPromise.then(function() {
            var promiseArr = [];
            priorityGraph[priority].forEach(function (action) {
                var deferred = Q.defer();
                action(context).then(deferred.resolve, deferred.reject);
                promiseArr.push(deferred.promise);
            });
            return Q.all(promiseArr);
        });
    }, Q.when(true));

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
