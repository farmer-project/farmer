module.exports = function Security() {
    var express = require('express'),
        AES = require('../core/security/aes'),
        RSA = require('../core/security/rsa'),
        app = express();


    app.post('/key', function (req, res) {
        var username = req.body.username;
        
        AES.newKey(username).then(function (key) {
            RSA.encrypt(key, username, 'base64').then(function (encryptData) {
                res.status(200)
                    .json({
                        result: encryptData,
                        error: ""
                    });
            });
        }, function (error) {
            res.status(500)
                .json({
                    result: "",
                    error: error
                });
        });
    });

    return app;
};