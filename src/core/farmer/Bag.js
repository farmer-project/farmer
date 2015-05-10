'use strict';

/**
 * Bag object constructor
 * @constructor
 */
function Bag() {
    this.data = {};
}

/**
 * Set a property value
 * @param {string} tag - Tag name
 * @param {Object|string|*} data - Any data with any structure
 * @returns {Bag}
 */
Bag.prototype.set = function (tag, data) {
    this.data[tag] = data;

    return this;
};

/**
 * Get property value
 * @param {string} tag - Saved object tag name
 * @returns {*}
 */
Bag.prototype.get = function (tag) {
    return this.data[tag];
};

/**
 * Get all properties value
 * @returns {{}|*}
 */
Bag.prototype.getAll = function () {
    return this.data;
};

module.exports = Bag;
