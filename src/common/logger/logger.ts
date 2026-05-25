
import winston from 'winston';

interface LoggerConfig {
  level: 'info' | 'warn' | 'error' | 'debug';
  service: string;
}

const config: LoggerConfig = {
  level: process.env.LOG_LEVEL as any || 'info',
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