'use strict';

function JsonObj() {
}

/**
 * Access to property
 *
 * @param json
 * @param hierarchy array of properties sequence
 * @param value value must be assigned
 * @param force true if you want destroy previous value
 * @returns {*}
 */
//JsonObj.prototype.propertyAccessor = function (json, hierarchy, value, force) {
//    Array.prototype.isArray = true;
//};

/**
 * Create sub object if it's not exist
 *
 * @param {Array} hierarchy - Properties sequence array
 * @param {Object} json
 * @returns {Object}
 */
JsonObj.prototype.create = function (hierarchy, json) {
    if (hierarchy.length > 0) {
        var property =  hierarchy[0];

        if (!json[property]) {
            json[property] = {};
        }

        hierarchy.shift();
        this.create(hierarchy, json[property]);
    }

    return json;
};

module.exports = new JsonObj();
