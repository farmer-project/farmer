'use strict';

var _           = require('underscore'),
    Q           = require('q'),
    models      = require('../models'),
    packageCompose = require('../package-compose'),
    LogCenter   = require('../log-center'),
    config      = require(require('path').resolve(__dirname, '../config'))
    ;

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

/**
 *
 * @param farmSite
 * @param stage
 * @param publisher
 * @returns {Bluebird.Promise|*}
 */
Farmland.prototype.furrow = function (farmSite, stage, publisher) {
    var containersId = [];
    publisher.pub("create containers", true);
    return packageCompose
        .run(farmSite)
        .then(function (result) {

            return result.reduce(function (prevPromise, inspect) {
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
            .then(function () {
                models
                    .Package
                    .create({
                        "containers": JSON.stringify(containersId),
                        "type": stage
                    }).error(function (error) {
                        console.log("error:", error);
                    });

                publisher.pub(JSON.stringify(result));
                return result;
            })
        ;

    });
};

module.exports = new Farmland();