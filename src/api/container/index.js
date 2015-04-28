module.exports = function Container() {
    var express = require('express'),
        models = require('.././index'),
        greenhouse = require('./greenhouse'),
        production = require('./production'),
        ContainerManager = require(require('path').resolve(__dirname, '../../core/container/manager')),
        app = express();

    /*
    we grow our plant(code) in greenhouse and after that transfer them to our farm
     greenhouse = staging
     */
    app.use('/greenhouse', greenhouse());
    app.use('/production', production());

    // Regular routes
    app.get('/:containerId', function (req, res) {

        ContainerManager
            .getContainerInfo(req.params.containerId)
            .then(function (response) {
                res
                    .status(response.code)
                    .json({
                        'result': response.message,
                        'error' : ''
                    });

            }, function (error) {
                res
                    .status(error.code)
                    .json({
                        'result': '',
                        'error' : error.message
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