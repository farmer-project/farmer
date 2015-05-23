'use strict';

module.exports = function Container() {
    var express             = require('express'),
        path                = require('path'),
        greenhouse          = require('./greenhouse'),
        production          = require('./production'),
        models              = require('../../core/models'),
        app = express();

    /*
    we grow our plant(code) in greenhouse and after that transfer them to our farm
     greenhouse = staging
     */

    app.use('/greenhouse', greenhouse());
    app.use('/production', production());

    app.get('/list', function (req, res) {
        models.
            Package.
            findAll({
                attributes: ['hostname']
            }).then(function (packages) {
                res.status(200)
                    .json({
                        result: JSON.stringify(packages),
                        error: ''
                    });
            }, function (err) {
                return res.status(500)
                    .json({
                        result: '',
                        error: 'Cant not fetch packages'
                    });
            });
    });

    return app;
};
