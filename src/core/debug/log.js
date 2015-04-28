'use strict';

var log4js = require('log4js'),
    config = require(require('path').resolve(__dirname, '../../config'));

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

/**
 * Log system trace
 *
 * Log info to help developer to trace workflow in system
 *
 * @param log {String|Object}
 * @returns {LogCenter}
 */
LogCenter.prototype.trace = function (log)
{
    var logger = log4js.getLogger(this.ACCESS_LOG_FILE_TAG);
    logger.trace(log);

    return this;
};

/**
 * Log system debug
 *
 * Log info to help developer to debug system
 *
 * @param log
 * @returns {LogCenter}
 */
LogCenter.prototype.debug = function (log)
{
    var logger = log4js.getLogger(this.ACCESS_LOG_FILE_TAG);
    logger.debug(log);

    return this;
};

/**
 * Log system info
 *
 * @param log {String|Object}
 * @returns {LogCenter}
 */
LogCenter.prototype.info = function (log)
{
    var logger = log4js.getLogger(this.ACCESS_LOG_FILE_TAG);
    logger.info(log);

    return this;
};

/**
 * Log system warning
 *
 * @param log {String|Object}
 * @returns {LogCenter}
 */
LogCenter.prototype.warn = function (log)
{
    var logger = log4js.getLogger(this.ERROR_LOG_FILE_TAG);
    logger.warn(log);

    return this;
};

/**
 * Log system error
 *
 * @param log {String|Object}
 * @returns {LogCenter}
 */
LogCenter.prototype.error = function (log)
{
    var logger = log4js.getLogger(this.ERROR_LOG_FILE_TAG);
    logger.error(log);

    return this;
};

/**
 * Log system fatal error
 *
 * @param log {String|Object}
 * @returns {LogCenter}
 */
LogCenter.prototype.fatal = function (log)
{
    var logger = log4js.getLogger(this.ERROR_LOG_FILE_TAG);
    logger.fatal(log);

    return this;
};

module.exports = new LogCenter();
