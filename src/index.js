var express     = require('express'),
    timeout     = require('connect-timeout'),
    bodyParser  = require('body-parser'),
    models      = require('./core/models'),
    config      = require(require('path').resolve(__dirname, './config')),
    api         = require('./api'),
    app         = express(),
    path        = require('path'),
    PluginRegister = require(path.resolve(__dirname, './core/plugin'));

// Console colors
require('colors');

PluginRegister.registerAllPlugins();

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



var Container = require('./core/container');

var containerSample = new Container();