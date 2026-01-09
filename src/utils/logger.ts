import winston from 'winston';
import winstonDaily from 'winston-daily-rotate-file';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { LOG_DIR } from '../config';
import MongoDBTransport from './MongoDBTransport';

// Logs directory
const logDir: string = join(__dirname, '../', LOG_DIR || 'logs');
if (!existsSync(logDir)) {
  mkdirSync(logDir, { recursive: true });
}

// Define log format
const logFormat = winston.format.printf(({ timestamp, level, message, ...metadata }) => {
  let msg = `${timestamp} [${level}]: ${message}`;
  if (Object.keys(metadata).length > 0) {
    msg += ` ${JSON.stringify(metadata)}`;
  }
  return msg;
});

/*
 * Log Level
 * error: 0, warn: 1, info: 2, http: 3, verbose: 4, debug: 5, silly: 6
 */
const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    logFormat,
  ),
  transports: [
    // Console transport
    new winston.transports.Console({
      level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
      format: winston.format.combine(winston.format.colorize(), winston.format.splat()),
    }),
    // Debug log setting
    new winstonDaily({
      level: 'debug',
      datePattern: 'YYYY-MM-DD',
      dirname: logDir + '/debug',
      filename: `%DATE%.log`,
      maxFiles: 30, // 30 Days saved
      json: false,
      zippedArchive: true,
    }),
    // Error log setting
    new winstonDaily({
      level: 'error',
      datePattern: 'YYYY-MM-DD',
      dirname: logDir + '/error',
      filename: `%DATE%.log`,
      maxFiles: 30, // 30 Days saved
      handleExceptions: true,
      json: false,
      zippedArchive: true,
    }),
    // MongoDB transport - stores error and warn logs in database
    new MongoDBTransport({
      level: 'warn', // Only log warnings and errors to database
      handleExceptions: true,
    }),
  ],
});

const stream = {
  write: (message: string) => {
    logger.info(message.substring(0, message.lastIndexOf('\n')));
  },
};

export { logger, stream };
