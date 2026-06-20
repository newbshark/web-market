import { Pool } from "pg";
import { configService } from '../common/config/config.service.js';

const pool = new Pool({
    host: configService.dbHost,
    port: configService.dbPort,
    user: configService.dbUser,
    password: configService.dbPassword,
    database: configService.dbName,
});

export class UserService {
    async updateUserName(userId: number, newName: string) {
        const result = await pool.query(
            'UPDATE users SET name = $1 WHERE id = $2 RETURNING id, name, email',
            [newName, userId]
        );
        if (result.rows.length === 0) {
            throw new Error('User not found');
        }
        return result.rows[0];
    }
}