'use strict';

var Q       = require('q'),
    amqp    = require('amqp'),
    log     = require('../debug/log');

/**
 * Create an publisher object for unique station server
 * @param {string} connectionOpt - rabbitMQ station server connection options
 * @constructor
 */
function Publisher (connectionOpt) {
    this.connectionOpt = connectionOpt;
    this.roomID = (new Date).getTime().toString() + Math.floor((Math.random() * 100) + 1);
    this.connection = null;
    this.subLevel = 1;
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
    var self = this,
        deferred = Q.defer(),
        connection = amqp.createConnection(this.connectionOpt);

    connection.on('ready', function () {
        connection.queue(self.roomID , function (queue) {
            self.connection = connection;
            deferred.resolve(self.roomID);
        });
    });

    connection.on('close', function () {
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
    data['type'] = (type == undefined) ? this.TYPE.MESSAGE : type;
    this._emitEvent(data);

    return this;
};

/**
 * Any connection can be live for 5 sec after finished their work
 */
Publisher.prototype.disconnect = function () {
    var self = this;
    setTimeout(function () {
        self.connection.disconnect();
    }, 5000);
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
    this.subLevel++;
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
    this.subLevel--;
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
    if (this.connection) {
        this.connection.publish(this.roomID, data,
            {contentType: 'application/json'});
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
    return {
        room: this.roomID,
        data: input
    };
};

module.exports = Publisher;
