
import winston from 'winston';

enum LoggerLevelEnum {
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  DEBUG = 'debug'
}

interface LoggerConfig {
  level: LoggerLevelEnum;
  service: string;
}

const config: LoggerConfig = {
  level: process.env.LOG_LEVEL as LoggerLevelEnum || LoggerLevelEnum.INFO,
  service: 'blog-api'
};

const logger = winston.createLogger({
  level: config.level,
  defaultMeta: { service: config.service },
  format: winston.format.json(),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});
export default logger;
