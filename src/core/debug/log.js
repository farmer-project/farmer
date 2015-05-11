'use strict';

var log4js = require('log4js'),
    config = require(require('path').resolve(__dirname, '../../config'));
/**
 * @const
 * @define {string}
 * @type {string}
 */
var ERROR_LOG_FILE_TAG = 'error';

/**
 * @const
 * @define {string}
 * @type {string}
 */
var ACCESS_LOG_FILE_TAG = 'access';

function LogCenter() {
    log4js.configure({
        appenders: [
            { type: 'console' },
            {
                type: 'file',
                absolute: true,
                filename: config.LOG_DIR + '/access.log',
                maxLogSize: 20480,
                backups: 3,
                category: ACCESS_LOG_FILE_TAG
            },
            {
                type: 'file',
                absolute: true,
                filename: config.LOG_DIR + '/error.log',
                maxLogSize: 20480,
                backups: 3,
                category: ERROR_LOG_FILE_TAG
            }
        ]
    });
}

/**
 * Log system trace
 * Log info to help developer to trace workflow in system
 * @param {string|Object} log
 * @returns {LogCenter}
 */
LogCenter.prototype.trace = function (log)
{
    var logger = log4js.getLogger(ACCESS_LOG_FILE_TAG);
    logger.trace(log);
};

/**
 * Log system debug
 * Log info to help developer to debug system
 * @param {Object|string} log
 * @returns {LogCenter}
 */
LogCenter.prototype.debug = function (log)
{
    var logger = log4js.getLogger(ACCESS_LOG_FILE_TAG);
    logger.debug(log);
};

/**
 * Log system info
 * @param {Object|string} log
 * @returns {LogCenter}
 */
LogCenter.prototype.info = function (log)
{
    var logger = log4js.getLogger(ACCESS_LOG_FILE_TAG);
    logger.info(log);
};

/**
 * Log system warning
 * @param {Object|string} log
 * @returns {LogCenter}
 */
LogCenter.prototype.warn = function (log)
{
    var logger = log4js.getLogger(ERROR_LOG_FILE_TAG);
    logger.warn(log);
};

/**
 * Log system error
 * @param {string|Object} log
 */
LogCenter.prototype.error = function (log)
{
    var logger = log4js.getLogger(ERROR_LOG_FILE_TAG);
    logger.error(log);
};

/**
 * Log system fatal error
 * @param {string|Object} log
 */
LogCenter.prototype.fatal = function (log)
{
    var logger = log4js.getLogger(ERROR_LOG_FILE_TAG);
    logger.fatal(log);
};

module.exports = new LogCenter();
