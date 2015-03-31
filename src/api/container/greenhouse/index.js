'use strict';

var express = require('express'),
    _ = require('underscore'),
    Q = require('q'),
    Seed = require('./seed'),
    models = require('../../../models'),
    packageCompose = require('../../../package-compose'),
    LogCenter = require('../../../log-center'),
    config = require('../../../config');

module.exports = function Greenhouse() {
    var app = express(),
        seed = new Seed();

    app.post('/create', function (req, res) {

        seed.implant({
            package: req.body.package,
            name: req.body.name,
            hostname: req.body.name,
            app: config.greenhouse + '/' + req.body.name,
            repo: req.body.repo,
            branch: req.body.branch,
            type: "staging"
        })
            .then(function (result) {
                res
                    .status(200)
                    .json({
                        "result": result,
                        "message": "khodaya zibaii"
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