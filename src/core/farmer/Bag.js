'use strict';


function Bag() {
    this.data = {};
}

/**
 * Set a property value
 *
 * @param tag
 * @param data
 * @returns {Bag}
 */
Bag.prototype.set = function (tag, data) {
    this.data[tag] = data;

    return this;
};

/**
 * Get property value
 *
 * @param tag
 * @returns {*}
 */
Bag.prototype.get = function (tag) {
    return this.data[tag];
};

/**
 * Get all properties value
 *
 * @returns {{}|*}
 */
Bag.prototype.getAll = function () {
    return this.data;
};

module.exports = Bag;
