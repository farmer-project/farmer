module.exports = function Api() {
    var express = require('express'),
        container = require('./container'),
        security = require('./security'),
        images = require('./images'),
        app = express();

    // Setup container routes
    app.use('/security', security());
    app.use('/container', container());
    app.use('/images', images());

    return app;
};