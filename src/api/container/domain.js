'use strict';

var express         = require('express'),
    path            = require('path'),
    Q               = require('q'),
    Container       = require('../../core/container'),
    models          = require('../../core/models'),
    _               = require('underscore'),
    domainManager   = require('../../core/sysadmin/domain-manager'),
    config          = require(path.resolve(__dirname, '../../config'));

module.exports = function Domain() {
    var app = express();

    /**
     * Assign domain for a package container
     */
    app.post('/', function (req, res) {
        var args     = req.body.args,
            hostname = args.hostname || '',
            alias    = args.alias;

        models.
            Package.
            find({
                where: {hostname: hostname}
            }).then(function (packageRow) {
                var deferred = Q.defer();

                if (!packageRow) {
                    deferred.reject('Package does not exists');

                } else {
                    var containersID = JSON.parse(packageRow.containers),
                        container = new Container();

                    if (!containersID[alias]) {
                        deferred.reject(args.alias + ' container does not exists');

                    } else {
                        container.getInstance(containersID[alias]).then(function (containerObj) {
                            domainManager.assign(containerObj, args)
                                .then(deferred.resolve, deferred.reject);
                        });
                    }
                }

                return deferred.promise;

            }).then(function (result) {
                return res.status(200)
                    .json({
                        result: result,
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
     * Unassign a domain form a package container
     */
    app.delete('/', function (req, res) {
        var args      = req.body.args,
            hostname  = args.hostname || '',
            alias     = args.alias,
            deferred  = Q.defer(),
            domains  = {
                domain: args.domain,
                port: args.port
            };

        models.
            Package.
            find({
                where: {hostname: hostname}
            }).then(function (packageRow) {
                if (!packageRow) {
                    deferred.reject('Package does not exists');

                } else {
                    var containersID = JSON.parse(packageRow.containers),
                        container = new Container();

                    if (!containersID[alias]) {
                        deferred.reject(args.alias + ' container does not exists');

                    } else {
                        container.getInstance(containersID[alias]).then(function (containerObj) {
                            domainManager.unassign(containerObj, domains)
                                .then(deferred.resolve, deferred.reject);
                        });
                    }
                }

                return deferred.promise;

            }).then(function (result) {
                return res.status(200)
                    .json({
                        result: result[0],
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

    app.get('/', function (req, res) {
        var args = req.body.args;

        models.Package.find({
            where: {
                hostname: args.hostname
            }
        }).then(function (packageRow) {
            if (!packageRow) {
                return Q.reject('Packge does not exists!');
            }

            var containers = JSON.parse(packageRow.containers),
                results = {};

            return (function() {
                return _.reduce(containers, function (prevPromise, containerID, alias) {
                    return prevPromise.then(function () {

                        return models
                            .Domain
                            .findAll({
                                attributes: ['domain', 'port'],
                                where: {
                                    container_id: containerID
                                }
                            }).then(function (domainsInfo) {

                                var dataValues = [];

                                domainsInfo.forEach(function (value) {
                                    dataValues.push({
                                        domain: value.domain,
                                        port: value.port
                                    });
                                });

                                results[alias] = dataValues;
                                return results;
                            });

                    });

            }, Q.when(true));
            })()
                .then(function () {
                    return Q.resolve(results);
                });

        }).then(function (result) {
            return res
                .status(200)
                .json({
                    result: result,
                    error: ''
                });

        }, function (error) {
            return res
                .status(500)
                .json({
                    result: '',
                    error: error
                });
        });
    });

    return app;
};
