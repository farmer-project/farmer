'use strict';

var express         = require('express'),
    packageCompose  = require('../../core/container/orchestrate');

module.exports = function Backup() {
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
                        result: {tag: args.tag},
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

    /**
     * Delete package backup
     */
    app.delete('/delete', function (req, res) {
        var args = req.body.args;

        packageCompose.deleteBackup(args.tag)
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

    /**
     * All generated backup of package list
     */
    app.get('/list', function (req, res) {
        var models = require('../../core/models'),
            args = req.body.args;

        models
            .PackageScreenshot
            .findAll({
                attributes: ['tag'],
                where: {
                    hostname: args.hostname
                }
            }).then(function (screenshots) {

                var result = [];
                screenshots.forEach(function (screenshot) {
                    result.push(screenshot.tag);
                });

                return res.status(200)
                    .json({
                        result: result,
                        error: ''
                    })
                ;

            }, function (error) {
                return res.status(500)
                    .json({
                        result: [],
                        error: error
                    })
                ;
            })
        ;

    });

    return app;
};
