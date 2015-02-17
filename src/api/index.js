module.exports = function Api() {
    var express = require('express'),
        container = require('./container'),
        images = require('./images'),
        app = express();

    // Setup container routes
    app.use('/container', container());
    app.use('/images', images());

    return app;
};