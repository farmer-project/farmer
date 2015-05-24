'use strict';

var express         = require('express'),
    path            = require('path'),
    Q               = require('q'),
    Container       = require('../../core/container'),
    models          = require('../../core/models'),
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
            alias    = args.alias,
            deferred = Q.defer();

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
        var args     = req.body.args,
            hostname = args.hostname || '',
            alias    = args.alias,
            deferred = Q.defer;

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
                            domainManager.unassign(containerObj, args)
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


    return app;
};
