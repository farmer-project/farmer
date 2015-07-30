'use strict';

module.exports = function(sequelize, DataTypes) {

    var Domain = sequelize.define('Domain', {
        id: {
            type: DataTypes.INTEGER(11),
            autoIncrement: true,
            primaryKey: true
        },
        port: DataTypes.INTEGER(11),
        domain: DataTypes.STRING(256)
    }, {
        tableName: 'domains',

        updatedAt: 'last_update',
        createdAt: 'date_of_creation'
    });

    return Domain;
};
