'use strict';

var express = require('express'),
    _ = require('underscore'),
    Q = require('q'),
    Seed = require('./seed'),
    LogCenter = require('../../../log-center'),
    Publisher = require('../../../event-publisher'),
    config = require('../../../config');

module.exports = function Greenhouse() {
    var app = express(),
        seed = new Seed();

    app.post('/create', function (req, res) {

        var publisher = new Publisher(config.station_server);
        publisher
            .connect()
            .then(function () {
                publisher.inStep('Hi');
                res
                    .status(200)
                    .json({
                        id: publisher.getID(),
                        message: ''
                    });

                seed.implant(req.body, publisher)
                    .then(function (result) {
                        publisher.nextStep("your plant is ready to have very beautiful bloom on your farm");
                    }, function (error) {
                        publisher.inStep(error);
                    })
                ;
            })
        ;

    });

    app.get('/list', function (req, res) {
        models
            .Container
            .findAll({
                where: {
                    type: TYPE,
                    state: 'running'
                }
            })
            .complete(function (err, result) {
                var message = "";
                if (!!err) {
                    message = "An error occurred while select on containers ";
                    LogCenter.error(message + err);

                    res
                        .status(500)
                        .json({
                            "result": [],
                            "error": message
                        });

                } else {

                    if (!result) {
                        LogCenter.info("No container found");
                    } else {
                        LogCenter.info("Staging container found");
                    }

                    LogCenter.debug(result);

                    res
                        .status(200)
                        .json({
                            "result": result,
                            "error": ""
                        });
                }

            })
        ;
    });

    return app;
};