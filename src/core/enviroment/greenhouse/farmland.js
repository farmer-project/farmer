'use strict';

var _       = require('underscore'),
    Q       = require('q'),
    path    = require('path'),
    models  = require('../../models'),
    packageCompose = require('../../container/orchestrate'),
    log     = require(path.resolve(__dirname, '../../debug/log')),
    config  = require(path.resolve(__dirname, '../../../config'));

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
 * Furrow farmland to implant seed in it
 *
 * @param farmSite
 * @param stage
 * @param publisher
 * @returns {Bluebird.Promise|*}
 */
Farmland.prototype.furrow = function (farmSite, stage, publisher) {
    var containersId = [];
    publisher.toClient("create containers");

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
                        log.error(error);
                    });

                publisher.forceToSave(result, 'yaml', path.join(config.client_storage, 'contaienrs'));
                return result;
            })
        ;

    });
};

module.exports = new Farmland();
