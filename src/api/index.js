module.exports = function Api() {
    var express = require('express'),
        container = require('./container'),
        app = express();

    // Setup container routes
    app.use('/container', container());

    return app;
};