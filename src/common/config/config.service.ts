
import 'dotenv/config';

export class ConfigService {
    get port(): number {
        return parseInt(process.env.PORT || '3000', 10);
    }

    get dbHost(): string {
        return process.env.DB_HOST || 'localhost';
    }

    get dbPort(): number {
        return parseInt(process.env.DB_PORT || '5432', 10);
    }

    get dbUser(): string {
        return process.env.DB_USER || 'postgres';
    }

    get dbPassword(): string {
        return process.env.DB_PASSWORD || '';
    }

    get dbName(): string {
        return process.env.DB_NAME || 'web_market';
    }

    get jwtSecret(): string {
        const secret = process.env.JWT_SECRET;
        if (!secret || secret === 'secret_key') {
            throw new Error('JWT_SECRET must be set and not be default value in production!');
        }
        return secret;
    }

    get logLevel(): string {
        return process.env.LOG_LEVEL || 'info';
    }

    get isProduction(): boolean {
        return process.env.NODE_ENV === 'production';
    }

    get isDevelopment(): boolean {
        return !this.isProduction;
    }
}

export const configService = new ConfigService();