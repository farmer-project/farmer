'use strict';

var Q       = require('q'),
    ursa    = require('ursa'),
    models  = require('../models/index');

function RSA() {

}

/**
 * Encrypt data
 *
 * Get user public key and encrypt data based on RSA algorithm
 *
 * @param data
 * @param username
 * @param type
 * @returns {Bluebird.Promise|*}
 */
RSA.prototype.encrypt = function (data, username, type) {
    return models
        .User
        .find({
            where: { username: username }
        }).then(function (user) {
            if(!user)
                return Q.reject('user not found');

            try {
                var publicKey = ursa.createPublicKey(new Buffer(user.publicKey));
                if (typeof type === 'undefined') {
                    console.log('encrypt data without type >>>>>>>');
                    return publicKey.encrypt(data);
                }

                console.log('encrypt data with type >>>>>>>');
                var enc = publicKey.encrypt(data, 'utf8', type);

                var fs = require('fs');
                var privateKey = ursa.createPrivateKey(fs.readFileSync('/home/vagrant/private.key.pem'));
                var dec = privateKey.decrypt(new Buffer(enc, 'base64'), 'utf8', 'base64');
                console.log('reverse key >>>>', dec);

                return enc;

            } catch (e) {
                console.log(e);
                return Q.reject('invalid public key');
            }
        })
    ;
};

module.exports = new RSA();
