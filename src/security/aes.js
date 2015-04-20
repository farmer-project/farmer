'use strict';

var Q = require('q'),
    crypto = require('crypto'),
    NodeCryptojs = require('node-cryptojs-aes'),
    models = require('../models')
    ;

function AES() {
}

AES.prototype.getKey = function (username) {
    var self = this;

    return models
        .User
        .find({
            where: { username: username }
        }).then(function (user) {

            if(!user)
                return Q.reject('user not found');

            if (user.aes)
                return user.aes;

            return self._genKey(username);
        });
};

AES.prototype.encrypt = function (data, username) {
    return models
        .User
        .find({
            where: {username: username}
        }).then(function (user) {
            if(!user)
                return Q.reject('user not found');

            try {
                var CryptoJS = NodeCryptojs.CryptoJS,
                    encrypted = CryptoJS.AES
                        .encrypt(data, user.aes, { format: NodeCryptojs.JsonFormatter });

                return Q.when(encrypted.toString());
            } catch (e) {
                return Q.reject('invalid AES key');
            }
        })
    ;
};

AES.prototype.decrypt = function (encryptData, username) {
    return models
        .User
        .find({
            where: {username: username}
        }).then(function (user) {
            if(!user)
                return Q.reject('user not found');
            try {

            } catch (e) {
                return Q.reject('invalid AES key');
            }
        })
    ;
};


AES.prototype._genKey = function (username) {
    var aesKey = crypto.randomBytes(128).toString('base64');
    return models
        .User
        .update({
            "aes": aesKey
        },{
            where: { username: username }
        }).then(function () {
            return aesKey;
        });
};

module.exports = new AES();