import { Pool } from 'pg';

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5234'),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'web_market',
});

export class AdvertisementService {
    async getAllOffers() {
        try {
        const result = await pool.query(`
            SELECT o.*, c.category_name, 
            s.status_name, u.name as user_name
            FROM offers o
            JOIN ad_categories c ON o.category_id = c.category_id
            JOIN ad_statuses s ON o.status_id = s.status_id
            JOIN users u ON o.user_id = u.id
            WHERE s.status_name = 'активен'
            ORDER BY o.created_date DESC
        `);
        return result.rows;
        } catch (error) {
        console.error('DB error in getAllOffers:', error);
        throw new Error('Failed to fetch offers');
        }
    
    }
    async getUserOffers(userId: number) {
        const result = await pool.query(
            'SELECT * FROM offers WHERE user_id = $1',
            [userId]
        );
        return result.rows;
    }

}
export const offerService = new AdvertisementService();
