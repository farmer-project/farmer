// Load settings into configuration object
try {
    module.exports = require('../farmer.conf');
} catch(e) {
    console.log('Could not locate farmer.conf.js');
}