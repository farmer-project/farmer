'use strict';

module.exports = function(sequelize, DataTypes) {

    var Package = sequelize.define('Package', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        containers: DataTypes.TEXT,
        hostname: DataTypes.STRING(128)
    }, {
        tableName: 'packages',

        updatedAt: 'last_update',
        createdAt: 'date_of_creation'
    });

    return Package;
};
