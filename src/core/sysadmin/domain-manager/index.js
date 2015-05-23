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

DomainManager.prototype.setDomain = function (containerObj, opts) {
    var port      = opts.port || '80',
        domain    = opts.domain || this.generate(containerObj),
        deferred  = Q.defer(),
        container = new Containre();

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
            mainConfig.REVERSE_PROXY.rootConfig + '/' + domain + '.conf',
            Mustache.render(confFile, vars)
        );

        container.getInstance(mainConfig.REVERSE_PROXY.containerID).then(function (containerObj) {
            containerObj.restart();
            deferred.resolve(domain);

        }, deferred.reject);

    }, deferred.reject);

    return deferred.promise;
};

module.exports = new DomainManager();
