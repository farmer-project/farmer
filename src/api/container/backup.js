'use strict';

var express         = require('express'),
    path            = require('path'),
    Q               = require('q'),
    packageCompose  = require('../../core/container/orchestrate'),
    config          = require(path.resolve(__dirname, '../../config'));

module.exports = function Domain() {
    var app = express();

    /**
     * Create a package backup
     */
    app.post('/create', function (req, res) {
        var args     = req.body.args;

        packageCompose.backup(args.hostname, args.tag)
            .then(function (tag) {

                return res.status(200)
                    .json({
                        result: {tag: tag},
                        error: ''
                    });

            }, function (error) {

                return res.status(500)
                    .json({
                        result: '',
                        error: error
                    });

            })
        ;
    });

    /**
     * Restore package backup
     */
    app.post('/restore', function (req, res) {
        var args = req.body.args;

        packageCompose.restore(args.tag)
            .then(function (result) {

                return res.status(200)
                    .json({
                        result: 'Done',
                        error: ''
                    });

            }, function (error) {

                return res.status(500)
                    .json({
                        result: '',
                        error: error
                    });
            })
        ;
    });

    return app;
};
