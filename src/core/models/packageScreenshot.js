'use strict';

module.exports = function(sequelize, DataTypes) {

    var PackageScreenshot = sequelize.define('PackageScreenshot', {
        tag: {
            type: DataTypes.STRING(128),
            primaryKey: true
        },
        hostname: DataTypes.STRING(128),
        volumes: DataTypes.TEXT
    }, {
        tableName: 'package_screenshots',

        updatedAt: 'last_update',
        createdAt: 'date_of_creation'
    });

    return PackageScreenshot;
};
