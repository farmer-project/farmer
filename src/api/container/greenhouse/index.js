'use strict';

module.exports = function Greenhouse() {
    var express = require('express'),
        Seed = require('./seed'),
        models = require('../../../models'),
        ContainerManager = require('../../../container-manager'),
        LogCenter = require('../../../log-center'),

        app = express(),
        seed = new Seed(),
        TYPE = "staging";



    app.post('/create', function (req, res) {
        req.body.type = TYPE;
        req.body.image = req.body.package;

        console.log('ppppppppppppppqqqqqqqqqqqqqqqqq');
        var packageCompose = require('../../../package-compose')('base');
        console.log('eeeeeeeeeeeeeeeeeeeEEEEEEEEEEEEEEEEE');

        //seed.implant(req.body)
        //    .then(function (result) {
        //        res
        //            .status(200)
        //            .json({
        //                "message": "khodaya zibaii"
        //            });
        //    }, function (error) {
        //        res
        //            .status(error.statusCode)
        //            .json({
        //                "result": {},
        //                "message": error.message
        //            });
        //    });


        //if (typeof req.body.name === 'undefined') {
        //    res
        //        .status(500)
        //        .json({
        //            'result': '',
        //            'error': 'name is empty'
        //        });
        //}

        //req.body['base_address'] = "/code/staging/";

        //git.clone(req.body)
        //    .then(function(result) {
        //        // create db container
        //        ContainerManager
        //            .runContainer({
        //                "Name": "db_" + req.body.name,
        //                "Image": "mysql:5.7",
        //                "Hostname": req.body.name,
        //                "Env": [
        //                    "MYSQL_ROOT_PASSWORD=12345"
        //                ],
        //                "HostConfig": {
        //                    "PublishAllPorts": false
        //                }
        //            }).then(function(response) {
        //                // create container
        //                ContainerManager
        //                    .runContainer({
        //                        "Name": req.body.name,
        //                        "Image": req.body.package,
        //                        "Hostname": req.body.name,
        //                        "ExposedPorts": {
        //                            '22/tcp': {},
        //                            '80/tcp': {}
        //                        },
        //                        "HostConfig": {
        //                            "Links": ["db_" + req.body.name + ":db"],
        //                            "Binds": [req.body.base_address + req.body.name +":/app"]
        //                        }
        //                    }).then(function(response) {
        //                        res
        //                            .status(response.code)
        //                            .json({
        //                                'result': response.message,
        //                                'error' : ''
        //                            });
        //                    }, function (error) {
        //                        res
        //                            .status(error.code)
        //                            .json({
        //                                'result': '',
        //                                'error' : error.message
        //                            });
        //                    })
        //                ;
        //
        //            }, function (error) {
        //                res
        //                    .status(error.code)
        //                    .json({
        //                        'result': '',
        //                        'error' : error.message
        //                    });
        //            })
        //        ;
        //
        //}, function(error){
        //    res
        //        .status(error.statusCode)
        //        .json({
        //            'message': 'error',
        //            'error': "clone code error " + error.message
        //        });
        //});

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