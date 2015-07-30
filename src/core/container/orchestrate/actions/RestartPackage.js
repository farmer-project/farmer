'use strict';

var Q           = require('q'),
    _           = require('underscore'),
    path        = require('path'),
    Container   = require('../../index'),
    models      = require(path.resolve(__dirname, '../../../models'));

function RestartPackage () {

}

/**
 * Restart package containers
 * @param {string} hostname - Package hostname
 * @returns {Bluebird.Promise|*}
 */
RestartPackage.prototype.execute = function (hostname, sec) {
    return this.getPackage(hostname)
        .then(function (packageRow) {

            var containersID = JSON.parse(packageRow.containers);

            return _.reduce(containersID, function (prevPromise, id) {
                var container = new Container();

                return container
                    .getInstance(id)
                    .then(function (containerObj) {
                        return containerObj.restart(sec);
                    })
                ;

            }, Q.when(true));

        })
    ;
};

/**
 * Return package column row
 * @param {string} hostname - Package hostname
 * @returns {Bluebird.Promise|*}
 */
RestartPackage.prototype.getPackage = function (hostname) {
    return models
        .Package
        .find({
            where: {hostname: hostname}
        }).then(function (packageRow) {

            if (!packageRow) {
                return Q.reject('package not found');
            }

            return Q.resolve(packageRow);
        })
        ;
};

module.exports = RestartPackage;
