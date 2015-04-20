'use strict';

var Q = require('q'),
    ursa = require('ursa'),
    models = require('../models')
    ;

function RSA() {
}

RSA.prototype.encrypt = function (data, username, type) {
    return models
        .User
        .find({
            where: { username: username }
        }).then(function (user) {
            if(!user)
                return Q.reject('user not found');

            try {
                var publicKey = ursa.createPublicKey(user.publicKey);
                if (typeof type === 'undefined')
                    return publicKey.encrypt(data);

                return publicKey.encrypt(data, 'utf8', type);

            } catch (e) {
                console.log(e);
                return Q.reject('invalid public key');
            }
        })
    ;
};


module.exports = new RSA();
