"use strict";

var fs        = require("fs"),
    path      = require("path"),
    Sequelize = require("sequelize"),
    config    = require('../config'),
    db        = {},

    sequelize = new Sequelize(config.database_name, config.database_username, config.database_password, {
        port: config.database_port,
        host: config.database_host
      });

fs
  .readdirSync(__dirname)
  .filter(function(file) {
    return (file.indexOf(".") !== 0) && (file !== "index.js");
  })
  .forEach(function(file) {
    var model = sequelize["import"](path.join(__dirname, file));
    db[model.name] = model;
  });

Object.keys(db).forEach(function(modelName) {
  if ("associate" in db[modelName]) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
