
import { Pool } from 'pg';
import { configService } from './config/config.service.js';
import logger from './logger/logger.js';

let pool: Pool | null = null;

export function getPool(): Pool {
    if (!pool) {
        const dbConfig = {
            host: configService.dbHost,
            port: configService.dbPort,
            user: configService.dbUser,
            password: configService.dbPassword,
            database: configService.dbName,
            max: 20,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 5000,
        };

        logger.info('Creating new database pool...', {
            host: dbConfig.host,
            port: dbConfig.port,
            database: dbConfig.database,
            user: dbConfig.user,
        });

        pool = new Pool(dbConfig);

        pool.on('error', (err) => {
            logger.error('Unexpected error on idle client', err);
            if (process.env.NODE_ENV === 'production') {
                pool = null;
                logger.warn('Pool will be recreated on next request');
            } else {
                process.exit(1);
            }
        });

        pool.on('connect', () => {
            logger.debug('New client connected to pool');
        });

        pool.on('remove', () => {
            logger.debug('Client removed from pool');
        });
    }

    return pool;
}


export async function closePool(): Promise<void> {
    if (pool) {
        logger.info('Closing database pool...');
        try {
            await pool.end();
            pool = null;
            logger.info('Database pool closed successfully');
        } catch (error) {
            logger.error('Error closing database pool:', error);
            throw error;
        }
    }
}

export async function checkDatabaseConnection(): Promise<boolean> {
    try {
        const poolInstance = getPool();
        await poolInstance.query('SELECT 1');
        logger.info('✅ Database connection successful');
        return true;
    } catch (error) {
        logger.error('❌ Database connection failed:', error);
        logger.info(`Tried to connect to ${configService.dbHost}:${configService.dbPort}/${configService.dbName}`);
        return false;
    }
}

export function resetPool(): void {
    if (pool) {
        logger.warn('Resetting pool forcibly');
        pool.end().catch(err => logger.error('Error ending pool:', err));
        pool = null;
    }
}