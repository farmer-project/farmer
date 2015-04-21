'use strict';

var Q       = require('q'),
    https   = require('https'),
    fs      = require('fs');

function Downloader() {
}

Downloader.prototype.get = function (options) {
    var deferred = Q.defer();
    //var options = {
    //    hostname  : 'wordpress.org',
    //    port      : 443,
    //    path      : '/latest.zip',
    //    method    : 'GET'
    //};

    var file = fs.createWriteStream("wp_latest.zip");

    var req = https.request(options, function(res) {
        console.log('downloading');
        res.on('data', function(data) {
            console.log('..');
            file.write(data);
        });
    });
    req.end();

    req.on('error', function(e) {
        console.error(e);
    });

    return deferred.promise;
};