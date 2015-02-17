module.exports = function Container() {
    var express = require('express'),
        ContainerManager = require('../container-manager'),
        app = express();

    // Regular routes
    app.get('/', function (req, res) {

        ContainerManager
            .getListImages()
            .then(function (info) {
                res.json({
                    success: true,
                    info: info
                });
            }, function (error) {
                res.json({
                    success: false,
                    error: error
                });
            });
    });

    return app;
};