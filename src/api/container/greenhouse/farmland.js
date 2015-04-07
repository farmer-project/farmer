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
 * @param farmSite
 * @returns {*}
 */
Farmland.prototype.furrow = function (farmSite, stage) {
    var containersId = [];

    return packageCompose
        .run(farmSite)
        .then(function (result) {

        result.reduce(function (prevPromise, inspect) {
            return prevPromise.then(function () {
                containersId.push(inspect.Id);

                return models
                    .Container
                    .update({
                        "type": stage
                    },{
                        where: { id: inspect.Id }
                    });
            });
        }, Q.when(true))
            .then(function (result) {
                return models
                    .Package
                    .create({
                        "containers": JSON.stringify(containersId),
                        "type": stage
                    }).error(function (error) {
                        console.log("error:", error);
                    });
            })
        ;

    });
};

module.exports = new Farmland();