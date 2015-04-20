'use strict';

var clone = require('./clone');

function Git() {

}

Git.prototype.clone = function (object) {
    return new clone(object);
};

module.exports = new Git();