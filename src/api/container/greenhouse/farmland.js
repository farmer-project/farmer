'use strict';

var _ = require('underscore'),
    Q = require('q'),
    models = require('../../../models'),
    packageCompose = require('../../../package-compose'),
    LogCenter = require('../../../log-center'),
    config = require('../../../config');

function Farmland () {

}

/**
 * {
 *  "package":
 *  "name":
 *  "hostname":
 *  "seed":
 *  "type":
 * }
 * @param request
 * @returns {*}
 */
Farmland.prototype.furrow = function (request) {
    var containersId = [];

    return packageCompose.run({
        "packages": config.packages_path + '/' + request.package + ".yml",
        "vars": {
            "name": request.name,
            "hostname": request.hostname,
            "code": request.seed
        }
    }).then(function (result) {

        result.reduce(function (prevPromise, inspect) {
            return prevPromise.then(function () {
                containersId.push(inspect.Id);

                return models
                    .Container
                    .update({
                        "type": request.type
                    },{
                        where: { id: inspect.Id }
                    });
            });
        }, Q.when(true))
            .then(function (result) {
                return models
                    .Package
                    .create({
                        "seed": request.package,
                        "containers": JSON.stringify(containersId),
                        "type": request.type
                    }).error(function (error) {
                        console.log("error:", error);
                    });
            })
        ;

    });
};

module.exports = new Farmland();