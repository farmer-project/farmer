'use strict';

var Q       = require('q'),
    ursa    = require('ursa'),
    models  = require('../models/index');

function RSA() {

}

/**
 * Encrypt data
 * Get user public key and encrypt data based on RSA algorithm
 * @param {string} data
 * @param {string} username
 * @param {string} type
 * @returns {Bluebird.Promise|*}
 */
RSA.prototype.encrypt = function (data, username, type) {
    return models
        .User
        .find({
            where: {username: username}
        }).then(function (user) {
            if (!user) {
                return Q.reject('user not found');
            }

            try {
                var publicKey = ursa.createPublicKey(new Buffer(user.publicKey));
                if (typeof type === 'undefined') {
                    return publicKey.encrypt(data);
                }

                var enc = publicKey.encrypt(data, 'utf8', type);

                var fs = require('fs');
                var privateKey = ursa.createPrivateKey(
                    fs.readFileSync('/home/vagrant/private.key.pem')
                );
                var dec = privateKey.decrypt(new Buffer(enc, 'base64'), 'utf8', 'base64');

                return enc;

            } catch (e) {
                return Q.reject('invalid public key');
            }
        })
    ;
};

module.exports = new RSA();
