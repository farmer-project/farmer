'use strict';

var config   = require('../../config'),
    app      = require('http').createServer(handler),
    io       = require('socket.io')(app),
    log      = require('../debug/log');

app.listen(config.STATION_PORT);
console.log('Station listening on port'.green, config.STATION_PORT);

function handler (req, res) {

}

io.on('connection', function (socket) {
    log.trace('A connection established');

    socket.on('disconnect', function() {
        log.trace('Disconnect');
    });

    // every chanel must be created first by server after that every client can be connect to them
    socket.on('event', function(data) {
        console.log('recived data >>>', data);
        var room = data.room;
        delete data['room'];
        io.of(room).emit('event', data);
        console.log('send data >>>>>>>>>', data);
    });
});