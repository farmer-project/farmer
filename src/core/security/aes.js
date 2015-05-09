'use strict';

var Q = require('q'),
    crypto = require('crypto'),
    NodeCryptojs = require('node-cryptojs-aes'),
    models = require('../models/index')
    ;

function AES() {

}

/**
 * Generate new key for user
 * @param username
 * @returns {Bluebird.Promise|*}
 */
AES.prototype.newKey = function (username) {
    var self = this;

    return models
        .User
        .find({
            where: { username: username }
        }).then(function (user) {

            if(!user)
                return Q.reject('user not found');

            return self._genKey(username);
        });
};

/**
 * get user AES key
 * @param username
 * @returns {Bluebird.Promise|*}
 */
AES.prototype.getKey = function (username) {
    var self = this;

    return models
        .User
        .find({
            where: { username: username }
        }).then(function (user) {

            if(!user['aes'])
                return Q.reject('user not found');

            return user.aes;
        });
};

/**
 * Encrypt data  based on AES algorithm
 *
 * @param data
 * @param key
 * @returns {Bluebird.Promise|*}
 */
AES.prototype.encrypt = function (data, key) {
    try {
        var CryptoJS = NodeCryptojs.CryptoJS,
            encrypted = CryptoJS.AES
                .encrypt(data, key, { format: NodeCryptojs.JsonFormatter });

        return Q.when(encrypted.toString());
    } catch (e) {
        return Q.reject('invalid AES key');
    }
};

/**
 * Decrypt data based on AES algorithm
 * @param encryptedJsonStr
 * @param key
 * @returns {*|string}
 */
AES.prototype.decrypt = function (encryptedJsonStr, key) {
    var CryptoJS = NodeCryptojs.CryptoJS,
        decrypted = CryptoJS.AES
            .decrypt(encryptedJsonStr, key, {format: NodeCryptojs.JsonFormatter});
    return CryptoJS.enc.Utf8.stringify(decrypted);
};

/**
 * Generate a key
 * @param username
 * @returns {Bluebird.Promise|*}
 * @private
 */
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