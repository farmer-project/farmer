'use strict';

function StopPackage() {

}

/**
 * Shutdown a package
 * @param {string} hostname - Package hostname
 * @param {number} sec - Second number to shutdown any container
 * @returns {Bluebird.Promise|*}
 */
StopPackage.prototype.execute = function (hostname, sec) {
    return this.getPackage(hostname)
        .then(function (packageRow) {

            var containersID = JSON.parse(packageRow.containers);

            return _.reduce(containersID, function (prevPromise, id) {
                var container = new Container();

                return container
                    .getInstance(id)
                    .then(function (containerObj) {
                        return containerObj.shutdown(sec);
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
StopPackage.prototype.getPackage = function (hostname) {
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

module.exports = StopPackage;
