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
 * Furrow farmland to implant seed in it :)
 * @param {Object} containersSite
 * @param {Publisher} publisher - station publisher
 * @returns {Bluebird.Promise|*}
 */
Farmland.prototype.furrow = function (containersSite, publisher) {
    var containersId = [];
    publisher.sendString('creating containers ...');
    publisher.subWorksStart();

    return packageCompose
        .run(containersSite)
        .then(function (containers) {
            var containersID = {},
                hostname = '';

            for (var key in containers) {
                containersID[key] = containers[key].getConfigurationEntry('Id');
                hostname = containers[key].getConfigurationEntry('Hostname');
            }

            return models
                .Package.create({
                    containers: JSON.stringify(containersID),
                    hostname: hostname
                }).then(function (resutl) {

                    publisher.sendString(containersID);
                    return containers;

                }).catch(log.error);

        }).catch(function (err) {

            log.error(err);
            publisher.sendString(String(err));

        }).finally(function () {
            publisher.subWorksFinish();
        });
};

module.exports = new Farmland();
