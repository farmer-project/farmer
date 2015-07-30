'use strict';

var _               = require('underscore'),
    Q               = require('q'),
    path            = require('path'),
    fs              = require('fs'),
    Mustache        = require('mustache'),
    ReverseProxy    = require('../../farmer/ReverseProxy'),
    models          = require('../../models'),
    log             = require(path.resolve(__dirname, '../../debug/log')),
    mainConfig      = require(path.resolve(__dirname, '../../../config'));

function DomainManager () {
}

/**
 * Generate a domain
 * @param {Object} containerObj - container object
 * @returns {string} - domain
 */
DomainManager.prototype.generate = function (containerObj) {
    return containerObj
            .getConfigurationEntry('Name')[1]
            .replace('/', '')
            .replace(/_/g, '-') +
            '.' + mainConfig.DOMAIN;
};

/**
 * check domain is already exists or not
 * @param {string} domain - domain url
 * @param {Number} port - port number
 */
DomainManager.prototype.exists = function (domain, port) {
    return fs.existsSync(
            mainConfig.REVERSE_PROXY.rootConfig + '/' + domain + '.' + port + '.conf'
        )
    ;
};

/**
 * Assign a domain to a container
 * @param {Object} containerObj - container object
 * @param {Object} opts - options
 * @returns {*|promise}
 */
DomainManager.prototype.assign = function (containerObj, opts) {
    var port      = opts.port || '80',
        domain    = opts.domain || this.generate(containerObj),
        deferred  = Q.defer(),
        reverseProxy = new ReverseProxy();

    if (!this.exists(domain, port)) {

        containerObj.setDomain(domain, port).then(function (proxyPass) {
            var confFile =
                    fs.readFileSync(
                        path.resolve(__dirname, './nginx/reverse_proxy.conf'), {
                            encoding: 'utf8'
                        }
                    ),
                vars = {
                        domain: domain,
                        proxyPass: proxyPass
                    };

            fs.writeFileSync(
                mainConfig.REVERSE_PROXY.rootConfig + '/' + domain + '.' + port + '.conf',
                Mustache.render(confFile, vars)
            );

            reverseProxy.restart().then(function () {
                deferred.resolve(domain);
            }, deferred.reject);

        }, deferred.reject);

    } else {
        deferred.reject('Domain has already been used.');
    }

    return deferred.promise;
};

/**
 * Unassign domain container
 * @param {Object} containerObj - container object
 * @param {Object|Array} domains - domains
 * @returns {*|promise}
 */
DomainManager.prototype.unassign = function (containerObj, domains) {
    var self            = this,
        result          = [],
        reverseProxy    = new ReverseProxy();

    domains = _.isArray(domains) ? domains : [domains];

    return (function () {
        var promiseArray = [];

        domains.forEach(function (proxy) {
            var deferred    = Q.defer(),
                domain      = proxy.domain,
                port        = proxy.port || '80';

            promiseArray.push(deferred);

            if (self.exists(domain, port)) {
                containerObj.unsetDomain(domain, port).then(function () {
                    fs.unlinkSync(
                        mainConfig.REVERSE_PROXY.rootConfig + '/' + domain + '.' + port + '.conf'
                    );

                    result.push(domain + ' removed.');
                    deferred.resolve(true);

                }, deferred.reject);

            } else {
                result.push('Domain ' + domain + ' does not exist!');
                deferred.reject();
            }

        });

        return Q.all(promiseArray);
    })()
    .then(restartProxy, restartProxy);

    function restartProxy() {
        return reverseProxy.restart().then(function () {
            log.trace('Restart reverse proxy');
            return result;
        });
    }
};

module.exports = new DomainManager();
