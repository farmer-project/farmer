'use strict';

function Shell () {
}

Shell.prototype.register = function (pluginRegisterator) {
    pluginRegisterator.listenOn('farmfile', this.farmfile);
};

Shell.prototype.farmfile = function (context) {
    if (context.label == 'shell') {
        console.log('context.label is shell');
    } else {
        console.log('context.label is  NNNNNNOTTTTT shell');
    }
};

module.exports = new Shell();
