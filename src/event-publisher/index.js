'use strict';

var Q = require('q'),
    io = require('socket.io-client');


function Publisher (stationServer) {
    this.serverUrl = stationServer;
    this.ID = (new Date).getTime().toString() + Math.floor((Math.random() * 100) + 1);
    this.socket = null;
    this.stage = 0;
}

Publisher.prototype.getID = function () {
    return this.ID;
};

Publisher.prototype.connect = function () {
    this.socket = io.connect(this.serverUrl);

    if (this.socket.connected) {
        return Q.when(true);
    }

    var deferred = Q.defer();
    console.log('go to connectiong');
    this.socket.on('connect', function () {
        console.log('connect');
        deferred.resolve()
    });

    this.socket.on('error', function () {
        console.log('error');
        deferred.reject();
    });

    return deferred.promise;
};


Publisher.prototype.nextStep = function (data) {
    data = this._dataResolver(data);
    data['stage'] = ++this.stage;
    this._emitEvent(data);
};

Publisher.prototype.inStep = function (data) {
    data = this._dataResolver(data);
    data['stage'] = this.stage;
    this._emitEvent(data);
};

Publisher.prototype._emitEvent = function (data) {
    if (this.socket) {
        this.socket.emit('event', data);
        console.log('>>> sent data', data);
    }
};

Publisher.prototype._dataResolver = function (input) {
    var data = {};

    if (typeof input === 'string') {
        data['message'] = input;

    } else if (typeof input === 'object') {
        data = input;
    }

    data['room'] = this.ID;
    return data;
};

module.exports = Publisher;
