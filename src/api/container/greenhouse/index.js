'use strict';

var express = require('express'),
    _ = require('underscore'),
    Q = require('q'),
    Seed = require('./seed'),
    LogCenter = require('../../../log-center'),
    config = require('../../../config');

module.exports = function Greenhouse() {
    var app = express(),
        seed = new Seed();

    app.post('/create', function (req, res) {

        seed.implant(req.body)
            .then(function (result) {
                res
                    .status(200)
                    .json({
                        "result": result,
                        "message": "your plant is ready to have very beautiful bloom on your farm"
                    });
            }, function (error) {
                res
                    .status(500)
                    .json({
                        "result": {},
                        "message": error
                    });
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