'use strict';

module.exports = function(sequelize, DataTypes) {

    var BackupFile = sequelize.define('BackupFile', {
        id: {
            type: DataTypes.STRING(128),
            primaryKey: true
        },
        uri: DataTypes.STRING(256),
        metadata: DataTypes.TEXT
    }, {
        tableName: 'backup_files',

        updatedAt: 'last_update',
        createdAt: 'date_of_creation'
    });

    return BackupFile;
};
