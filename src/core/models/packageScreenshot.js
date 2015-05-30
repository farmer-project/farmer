'use strict';

module.exports = function(sequelize, DataTypes) {

    var PackageScreenshot = sequelize.define('PackageScreenshot', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        screenshot: DataTypes.STRING(128),
        hostname: DataTypes.STRING(128),
        volumes: DataTypes.TEXT
    }, {
        tableName: 'package_screenshots',

        updatedAt: 'last_update',
        createdAt: 'date_of_creation'
    });

    return PackageScreenshot;
};
