'use strict';

var _           = require('underscore'),
    Q           = require('q'),
    jsonHelper  = require('../helper/json');

/**
 * Emitter object
 * @constructor
 */
function Emitter() {
    this.channel = {};
}

/**
 * Register plugin method
 * @param {string} event - Event hierarchy like 'create.shell'
 * @param {Number} priority - Integer number
 * @param {Function} action - The method that will be run
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
 * Get all priority, sort them and exec all method in same priority level
 * when all done go to the next priority functions
 * @param {string} event - Event
 * @param {Bag} context - Bag object
 */
Emitter.prototype.dispatch = function (event, context) {
    var priorityGraph = this.channel[event],
        self = this;

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

    }, Q.when(true)).finally(function () {
        self.endBroadCasting(context);
    });

};

/**
 * Broadcast end of process
 * @param {Object} context - Bag object
 */
Emitter.prototype.endBroadCasting = function (context) {
    var publisher = context.get('publisher');

    if (publisher) {
        while (publisher.subLevel > 0) {
            publisher.subWorksFinish();
        }
        publisher.disconnect();
    }
};

/**
 * Return priority
 * @param {Object} priorityGraph - Object contain priority number and an array of method
 * @returns {Array.<T>}
 * @private
 */
Emitter.prototype._getSortPriority = function (priorityGraph) {
    var keys = [];
    for (var key in priorityGraph) {
        keys.push(parseInt(key));
    }

    return keys.sort(function (a, b) {
        return a - b;
    });
};

module.exports = new Emitter();
