module.exports = function Production() {
    var express = require('express'),
        models = require('../models'),
        ContainerManager = require('../container-manager'),
        LogCenter = require('../log-center'),
        app = express(),
        TYPE = "production";

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

                    res.json({
                        "success": false,
                        "message": message
                    });
                } else if (!result) {
                    message = "No container found";
                    LogCenter.info(message);
                    LogCenter.debug(result);

                    res.json({
                        "success": true,
                        "message": message
                    });
                } else {
                    LogCenter.info("production container found");
                    LogCenter.debug(result);

                    res.json({
                        "success": true,
                        "message": result
                    });
                }
            })
        ;
    });

    return app;
};