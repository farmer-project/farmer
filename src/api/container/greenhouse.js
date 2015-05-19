'use strict';

var express     = require('express'),
    _           = require('underscore'),
    Q           = require('q'),
    path        = require('path'),
    LogCenter   = require('../../core/debug/log'),
    Publisher   = require('../../core/station'),
    auth        = require('../../core/security/auth'),
    Bag         = require('../../core/farmer/Bag'),
    FarmerFile  = require('../../core/farmer/Farmerfile'),
    farmer      = require(path.resolve(__dirname, '../../core/farmer')),
    config      = require(path.resolve(__dirname, '../../config'));

module.exports = function Greenhouse() {
    var app = express();

    //app.use(auth.middleware);

    app.post('/create', function (req, res) {
        var publisher = new Publisher(config.RABBITMQ_CONFIG);
        publisher
            .connect()
            .then(function () {
                res.status(200)
                    .json({
                        room: publisher.roomID
                    });

                var bag = new Bag();
                bag.set('farmerfile', new FarmerFile(req.body.farmerfile))
                    .set('args', req.body.args)
                    .set('publisher', publisher);

                farmer.fireEvent('create', bag);

            }, function () {
                res.status(500)
                    .json({
                        result: '',
                        error: 'station server not respond'
                    });
            });
    });

    app.post('/deploy', function (req, res) {
        var publisher = new Publisher(config.RABBITMQ_CONFIG);
        publisher
            .connect()
            .then(function () {
                res.status(200)
                    .json({
                        room: publisher.roomID
                    });

                var bag = new Bag();
                bag.set('farmerfile', new FarmerFile(req.body.farmerfile))
                    .set('args', req.body.args)
                    .set('publisher', publisher);

                farmer.fireEvent('deploy', bag);

            }, function () {
                res.status(500)
                    .json({
                        result: '',
                        error: 'station server not reposed'
                    });
            });
    });

    app.get('/inspect', function (req, res) {
        var publisher = new Publisher(config.RABBITMQ_CONFIG);
        publisher
            .connect()
            .then(function () {
                res.status(200)
                    .json({
                        room: publisher.roomID
                    });

                var bag = new Bag();
                bag.set('args', req.body.args)
                    .set('publisher', publisher);

                farmer.fireEvent('inspect', bag);

            }, function () {
                res.status(500)
                    .json({
                        result: '',
                        error: 'station server not reposed'
                    });
            });
    });

    app.post('/delete', function (req, res) {
        var publisher = new Publisher(config.RABBITMQ_CONFIG);
        publisher
            .connect()
            .then(function () {
                res.status(200)
                    .json({
                        room: publisher.roomID
                    });

                var bag = new Bag();
                bag.set('args', req.body.args)
                    .set('publisher', publisher);

                farmer.fireEvent('delete', bag);

            }, function () {
                res.status(500)
                    .json({
                        result: '',
                        error: 'station server not reposed'
                    });
            });
    });

    return app;
};
