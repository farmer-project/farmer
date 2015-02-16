/**
 * Created by majid on 2/16/15.
 */
var log4js = require('log4js'),
    config = require('../config');

function LogCenter() {
    this.ERROR_LOG_FILE_TAG = "error";
    this.ACCESS_LOG_FILE_TAG = "access";

    log4js.configure({
        appenders: [
            { type: 'console' },
            {
                "type": "file",
                "absolute": true,
                "filename": config.log_dir + "/access.log",
                "maxLogSize": 20480,
                "backups": 3,
                "category": this.ACCESS_LOG_FILE_TAG
            },
            {
                "type": "file",
                "absolute": true,
                "filename": config.log_dir + "/error.log",
                "maxLogSize": 20480,
                "backups": 3,
                "category": this.ERROR_LOG_FILE_TAG
            }
        ]
    });
}

LogCenter.prototype.trace = function (log)
{
    var logger = log4js.getLogger(this.ACCESS_LOG_FILE_TAG);
    logger.trace(log);
};

LogCenter.prototype.debug = function (log)
{
    var logger = log4js.getLogger(this.ACCESS_LOG_FILE_TAG);
    logger.debug(log);
};

LogCenter.prototype.info = function (log)
{
    var logger = log4js.getLogger(this.ACCESS_LOG_FILE_TAG);
    logger.info(log);
};


LogCenter.prototype.warn = function (log)
{
    var logger = log4js.getLogger(this.ERROR_LOG_FILE_TAG);
    logger.warn(log);
};

LogCenter.prototype.warn = function (log)
{
    var logger = log4js.getLogger(this.ERROR_LOG_FILE_TAG);
    logger.warn(log);
};

LogCenter.prototype.error = function (log)
{
    var logger = log4js.getLogger(this.ERROR_LOG_FILE_TAG);
    logger.error(log);
};

LogCenter.prototype.fatal = function (log)
{
    var logger = log4js.getLogger(this.ERROR_LOG_FILE_TAG);
    logger.fatal(log);
};

module.exports = new LogCenter();
