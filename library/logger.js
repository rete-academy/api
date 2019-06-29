'use strict';

const { createLogger, format, transports } = require('winston');
const config = require('config');
require('winston-daily-rotate-file');

const logger = createLogger({
  level: config.log.maxLevel,
  format: format.combine(
    format.colorize(),
    format.simple(),
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
  ),
  transports: [new transports.Console()]
});

module.exports = logger;
