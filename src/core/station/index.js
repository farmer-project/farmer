'use strict';

var Q   = require('q'),
    io  = require('socket.io-client'),
    log = require('../debug/log');

/**
 * Create an publisher object for unique station server
 * @param {string} stationServer - station server url
 * @constructor
 */
function Publisher (stationServer) {
    this.serverUrl = stationServer;
    this.roomID = (new Date).getTime().toString() + Math.floor((Math.random() * 100) + 1);
    this.socket = null;
}

/**
 * @define {string}
 * @type {{MESSAGE: string, FILE: string, NOTIFY: string}}
 */
Publisher.prototype.TYPE = {
    MESSAGE: 'message',
    FILE: 'file',
    NOTIFY: 'notify'
};

/**
 * Try to connect to station server
 * @returns {*}
 */
Publisher.prototype.connect = function () {
    var self = this;
    this.socket = io.connect(this.serverUrl);

    if (this.socket.connected) {
        return Q.when(true);
    }

    var deferred = Q.defer();
    log.trace('try to connect ' + self.roomID);
    this.socket.on('connect', function () {
        log.info('connect to room ' + self.roomID);
        deferred.resolve(self.roomID);
    });

    this.socket.on('error', function () {
        log.error('connect to room ' + self.roomID + ' failed');
        deferred.reject();
    });

    return deferred.promise;
};

/**
 * Send data to client
 * @param {string|Object} data
 * @param {string} [type = message] - message types are defined at Publisher.prototype.TYPE
 * @returns {Publisher}
 */
Publisher.prototype.toClient = function (data, type) {
    data = this._dataResolver(data);
    data['type'] = (type !== 'undefined') ? type : this.TYPE.MESSAGE;
    this._emitEvent(data);

    return this;
};

/**
 * Send file content to client
 * @param {string|Object} content - file content
 * @param {string} type - file type example: .yml .json
 */
//Publisher.prototype.forceToSave = function (content, type) {
//    this._emitEvent({
//        type: this.TYPE.FILE,
//        file: {
//            content: content,
//            type: type
//        }
//    });
//};

/**
 * Notify client that next reports are sub events of last operation
 */
Publisher.prototype.subWorksStart = function () {
    this._emitEvent({
        type: this.TYPE.NOTIFY,
        tag: 'START_FLAG_UP',
        room: this.roomID
    });
};

/**
 * Notify client that sub events are finished
 */
Publisher.prototype.subWorksFinish = function () {
    this._emitEvent({
        type: this.TYPE.NOTIFY,
        tag: 'START_FLAG_DOWN',
        room: this.roomID
    });
};

/**
 * Emit data to station server
 * @param {string|Object} data
 * @private
 */
Publisher.prototype._emitEvent = function (data) {
    if (this.socket) {
        this.socket.emit('event', data);
        log.trace('room >>' + this.roomID + ' data >>' + JSON.stringify(data));
    }
};

/**
 * Define input type and resolve send data for station server
 * @param {string|Object} input
 * @returns {{}}
 * @private
 */
Publisher.prototype._dataResolver = function (input) {
    var data = {};

    if (typeof input === 'string') {
        data['msg'] = input;

    } else if (typeof input === 'object') {
        data = input;
    }

    data['room'] = this.roomID;
    return data;
};

module.exports = Publisher;
