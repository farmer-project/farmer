'use strict';

var Q           = require('q'),
    _           = require('underscore'),
    farmer      = require('../../farmer'),
    FarmerFile  = require('../../farmer/Farmerfile');

function Seed() {

}

Seed.prototype.implant = function (JSONfarmerfile, publisher) {
    var farmerFile = new FarmerFile(JSONfarmerfile);


};

module.exports = Seed;
