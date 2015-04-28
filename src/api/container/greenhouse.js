'use strict';

var express     = require('express'),
    _           = require('underscore'),
    Q           = require('q'),
    Seed        = require('../../core/enviroment/greenhouse/seed'),
    LogCenter   = require('../../core/debug/log'),
    Publisher   = require('../../core/station'),
    auth        = require('../../core/security/auth'),
    config      = require(require('path').resolve(__dirname, '../../config'));

module.exports = function Greenhouse() {
    var app = express(),
        seed = new Seed();

    //app.use(auth.middleware);

    app.post('/create', function (req, res) {
        var publisher = new Publisher(config.station_server);
        publisher
            .connect()
            .then(function () {
                publisher.toClient('open room');
                res.status(200)
                    .json({
                        room: publisher.roomID()
                    });

                seed.implant(req.body, publisher)
                    .finally(publisher.subWorksFinish);
            });

        res.status(500)
            .json({
                result: '',
                error: 'station server not reposed'
            });
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