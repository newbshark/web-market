import knex, { Knex } from 'knex';
import logger from '../logger/logger.js';

let knexInstance: Knex | null = null;

type Environment = 'development' | 'production';

const getKnexConfig = (): Knex.Config => {
    const env = (process.env.NODE_ENV || 'development') as Environment;

    const configs: Record<Environment, Knex.Config> = {
        development: {
            client: 'pg',
            connection: {
                host: process.env.DB_HOST || 'localhost',
                port: Number(process.env.DB_PORT) || 5432,
                user: process.env.DB_USER || 'postgres',
                password: process.env.DB_PASSWORD || '',
                database: process.env.DB_NAME || 'web_market',
            },
            pool: {
                min: 2,
                max: 10,
            },
        },
        production: {
            client: 'pg',
            connection: {
                host: process.env.DB_HOST || 'localhost',
                port: Number(process.env.DB_PORT) || 5432,
                user: process.env.DB_USER || 'postgres',
                password: process.env.DB_PASSWORD || '',
                database: process.env.DB_NAME || 'web_market',
            },
            pool: {
                min: 2,
                max: 20,
            },
        },
    };

    const config = configs[env];

    if (!config) {
        throw new Error(`No knex configuration found for environment: ${env}`);
    }

    return config;
};

export function getKnex(): Knex {
    if (!knexInstance) {
        const knexConfig = getKnexConfig();

        logger.info(`🔌 Creating Knex connection`);

        knexInstance = knex(knexConfig);

        knexInstance.raw('SELECT 1')
            .then(() => {
                logger.info('✅ Database connection successful');
            })
            .catch((error) => {
                logger.error('❌ Database connection failed:', error);
                knexInstance = null;
            });
    }
    return knexInstance;
}

export async function closeKnex(): Promise<void> {
    if (knexInstance) {
        logger.info('🔌 Closing database connection');
        await knexInstance.destroy();
        knexInstance = null;
    }
}

process.on('SIGINT', async () => {
    await closeKnex();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    await closeKnex();
    process.exit(0);
});