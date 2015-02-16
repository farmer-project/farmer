var _ = require('lodash');

process.env.RAVAJ_STAGE = process.env.RAVAJ_STAGE || 'development';

function Config(config) {
    // Default configurations
    this.set(_.extend({}, config));
}

Config.prototype.set = function (config) {
    if (_.isObject(config[process.env.RAVAJ_STAGE])) {
        _.extend(this, config[process.env.RAVAJ_STAGE]);
    } else {
        _.extend(this, config);
    }
};

module.exports = new Config();

// Load settings into configuration object
try {
    module.exports.set(require('../farmer.conf') || {});
} catch(e) {
    console.log('Could not locate farmer.conf.js');
}