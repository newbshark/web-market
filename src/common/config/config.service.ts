
export class ConfigService {
    constructor() {
    }

    get dbHost(): string {
        return process.env.DB_HOST || 'localhost';
    }

    get dbPort(): number {
        return parseInt(process.env.DB_PORT || '5234', 10);
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
}

export const configService = new ConfigService();