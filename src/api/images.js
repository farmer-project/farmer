module.exports = function Images() {
    var express = require('express'),
        ContainerManager = require(require('path').resolve(__dirname, '../core/container/manager')),
        app = express();

    // Regular routes
    app.get('/', function (req, res) {

        ContainerManager
            .getListImages()
            .then(function (response) {
                res
                    .status(response.code)
                    .json({
                        "result": response.message,
                        "error": ""
                    });
            }, function (error) {
                res
                    .status(error.code)
                    .json({
                        "result": "",
                        "error": error.message
                    });
            });
    });

    return app;
};