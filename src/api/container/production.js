'use strict';

module.exports = function Production() {
    var express = require('express'),
        path = require('path'),
        models = require('.././index'),
        ContainerManager = require(path.resolve(__dirname, '../../core/container/manager')),
        log = require(path.resolve(__dirname, '../../core/debug/log')),
        app = express(),
        TYPE = 'production';

    app.post('/create', function (req, res) {
        req.body['type'] = TYPE;

        ContainerManager
            .runContainer(req.body)
            .then(function(info) {
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
