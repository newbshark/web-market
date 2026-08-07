import { getPool } from "../common/database.js";

export class UserService {
    private pool = getPool();

    async updateUserName(userId: number, newName: string) {
        const result = await this.pool.query(
            'UPDATE users SET name = $1 WHERE id = $2 RETURNING id, name, email',
            [newName, userId]
        );
        if (result.rows.length === 0) {
            throw new Error('User not found');
        }
        return result.rows[0];
    }
}