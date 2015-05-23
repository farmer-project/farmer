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
     * Set domain for a package container
     * port, alias,
     */
    app.post('/', function (req, res) {
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
                    deferred.reject('Package not found');

                } else {
                    var containersID = JSON.parse(packageRow.containers),
                        container = new Container();

                    if (!containersID[alias]) {
                        deferred.reject(args.alias + ' container does not exists');

                    } else {
                        container.getInstance(containersID[alias]).then(function (containerObj) {
                            domainManager.setDomain(containerObj, args)
                                .then(deferred.resolve, deferred.reject);
                        });
                    }
                }

                return deferred.promise;

            }).then(function (result) {
                console.log('LAST SUCCESS');
                return res.status(200)
                    .json({
                        result: result,
                        error: ''
                    });

            }, function (error) {
                console.log('LAST ERROR');
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
