module.exports = function Container() {
    var express = require('express'),
        models = require('../../models/index'),
        staging = require('./staging'),
        production = require('./production'),
        ContainerManager = require('../../container-manager/index'),
        app = express();

    app.use('/staging', staging());
    app.use('/production', production());

    // Regular routes
    app.get('/:containerId', function (req, res) {

        ContainerManager
            .getContainerInfo(req.params.containerId)
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

    // send 'v' as a query  params "1/0"
    app.delete('/:containerId', function (req, res) {

        ContainerManager
            .deleteContainer(
            {
                "id": req.params.containerId,
                "removeVolume": req.query.v
            })
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