'use strict';

var Q = require('q'),
    io = require('socket.io-client'),
    log = require('../debug/log');


function Publisher (stationServer) {
    this.serverUrl = stationServer;
    this.roomID = (new Date).getTime().toString() + Math.floor((Math.random() * 100) + 1);
    this.socket = null;
}

Publisher.prototype.TYPE = {
    MESSAGE: 'message',
    FILE: 'file',
    NOTIFY: 'notify'
};

Publisher.prototype.roomID = function () {
    return this.roomID;
};

Publisher.prototype.connect = function () {
    var self = this;
    this.socket = io.connect(this.serverUrl);

    if (this.socket.connected) {
        return Q.when(true);
    }

    var deferred = Q.defer();
    log.trace('try to connect ' +self.roomID);
    this.socket.on('connect', function () {
        log.info('connect to room ' +self.roomID);
        deferred.resolve(self.roomID);
    });

    this.socket.on('error', function () {
        log.error('connect to room ' +self.roomID + ' failed');
        deferred.reject();
    });

    return deferred.promise;
};


Publisher.prototype.toClient = function (data, type) {
    data = this._dataResolver(data);
    data['type'] = (type !== 'undefined')? type : this.TYPE.MESSAGE;
    this._emitEvent(data);

    return this;
};

Publisher.prototype.forceToSave = function (content, type, dest) {
    this._emitEvent({
        type: this.TYPE.FILE,
        file: {
            content: content,
            type: type,
            dest: dest
        }
    });
};

Publisher.prototype.subWorksStart = function () {
    this._emitEvent({
        type: this.TYPE.NOTIFY,
        tag: 'START_FLAG_UP',
        room: this.roomID
    });
};

Publisher.prototype.subWorksFinish = function () {
    this._emitEvent({
        type: this.TYPE.NOTIFY,
        tag: 'START_FLAG_DOWN',
        room: this.roomID
    });
};

Publisher.prototype._emitEvent = function (data) {
    if (this.socket) {
        this.socket.emit('event', data);
        log.trace('room >>'+ this.roomID + ' data >>' + JSON.stringify(data));
    }
};

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
