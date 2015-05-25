'use strict';

var Q           = require('q'),
    path        = require('path'),
    fs          = require('fs'),
    Mustache    = require('mustache'),
    Containre   = require('../../container'),
    models      = require('../../models'),
    mainConfig  = require(path.resolve(__dirname, '../../../config'));

function DomainManager () {
}

DomainManager.prototype.generate = function (containerObj) {
    return containerObj
            .getConfigurationEntry('Name')[1]
            .replace('/', '')
            .replace(/_/g, '-') +
            '.' + mainConfig.DOMAIN;
};

DomainManager.prototype.assign = function (containerObj, opts) {
    console.log('domain', opts.domain);

    var port      = opts.port || '80',
        domain    = opts.domain || this.generate(containerObj),
        deferred  = Q.defer(),
        container = new Containre();

    console.log('domain', domain);

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
            mainConfig.REVERSE_PROXY.rootConfig + '/' + domain + '.' + port+ '.conf',
            Mustache.render(confFile, vars)
        );

        container.getInstance(mainConfig.REVERSE_PROXY.containerID).then(function (ReverseProxyContainer) {
            ReverseProxyContainer.restart();
            deferred.resolve(domain);

        }, deferred.reject);

    }, deferred.reject);

    return deferred.promise;
};

DomainManager.prototype.unassign = function (containerObj, opts) {
    var port      = opts.port || '80',
        domain    = opts.domain,
        deferred  = Q.defer(),
        container = new Containre();

    containerObj.unsetDomain(domain, port).then(function () {
        fs.unlinkSync(mainConfig.REVERSE_PROXY.rootConfig + '/' + domain + '.' + port+ '.conf');

        container.getInstance(mainConfig.REVERSE_PROXY.containerID).then(function (ReverseProxyContainer) {
            return ReverseProxyContainer.restart()
                .then(deferred.resolve, deferred.reject);

        }, deferred.reject);
    }, deferred.reject);

    return deferred.promise;
};

module.exports = new DomainManager();
