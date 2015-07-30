'use strict';

module.exports = function(sequelize, DataTypes) {

    var User = sequelize.define('User', {
        username: {
            type: DataTypes.STRING(128),
            primaryKey: true,
            allowNull: false
        },
        publicKey: {
            type: DataTypes.STRING(1024),
            allowNull: false
        },
        aes: DataTypes.STRING(256),
        ip: DataTypes.STRING(16)
    }, {
        tableName: 'users',

        updatedAt: 'last_update',
        createdAt: 'date_of_creation'
    });

    return User;
};
