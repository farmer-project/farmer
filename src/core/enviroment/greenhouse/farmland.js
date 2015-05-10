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
 * Furrow farmland to implant seed in it
 *
 * @param farmSite
 * @param stage
 * @param publisher
 * @returns {Bluebird.Promise|*}
 */
Farmland.prototype.furrow = function (farmSite, publisher) {
    var containersId = [];
    publisher.toClient("create containers");

    return packageCompose
        .run(farmSite)
        .then(function (containers) {
            var containersData = {},
                clientData = {},
                hostname = '';
            for(var key in containers) {
                containersData[key] = containers[key].getConfigurationEntry('Id');
                hostname = containers[key].getConfigurationEntry('Hostname');
                clientData[key] = containers[key].getConfigurationEntry('*');
            }

            return models
                .Package
                .create({
                    "containers": JSON.stringify(containersData),
                    "hostname": hostname
                }).then(function (resutl) {
                    log.trace(resutl);
                    publisher.toClient(JSON.stringify(clientData));
                    return containers;

                }).catch(log.error);
        });
};

module.exports = new Farmland();
