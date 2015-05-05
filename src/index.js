var express     = require('express'),
    timeout     = require('connect-timeout'),
    bodyParser  = require('body-parser'),
    models      = require('./core/models'),
    path        = require('path'),
    api         = require('./api'),
    app         = express(),
    config      = require(path.resolve(__dirname, './config')),
    farmer      = require(path.resolve(__dirname, './core/farmer'));

// Console colors
require('colors');

farmer.run();

// Create our stand-alone express app
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(timeout('180s'));

// TODO: Set up authentication
// app.use(auth());

// Setup api routes
app.use('/api', api());

// check tables existence
models.sequelize.sync().then(function () {
    // Start application
    app.listen(config.port, function () {
        console.log('Listening on port '.green, this.address().port);
    });
});