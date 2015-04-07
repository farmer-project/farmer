'use strict';

var config = require('../config');

function DomainManager () {

}

DomainManager.prototype.generate = function (state) {
    var stage = (state === 'staging') ? 'staging' : 'production';

    return stage + (new Date).getTime() + '_' + config.domain.replace('./g', '_');
};

module.exports = new DomainManager();