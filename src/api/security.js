module.exports = function Security() {
    var express = require('express'),
        AES = require('../security/aes'),
        RSA = require('../security/rsa'),
        app = express();

    // Regular routes
    app.post('/getKey', function (req, res) {
        var username = req.body.username;

        AES.getKey(username).then(function (key) {
            return RSA.encrypt(key, username, 'base64').then(function (encryptData) {
                res
                    .status(200)
                    .json({
                        "result": encryptData,
                        "error": ""
                    });
            });
        }, function () {
            res
                .status(500)
                .json({
                    "result": "",
                    "error": error
                });
        });
    });

    return app;
};