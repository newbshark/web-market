import { Pool } from "pg";

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5234'),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'web_market',
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