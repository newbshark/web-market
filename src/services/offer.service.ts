import { Pool } from 'pg';
import { configService } from '../common/config/config.service.js';

const pool = new Pool({
    host: configService.dbHost,
    port: configService.dbPort,
    user: configService.dbUser,
    password: configService.dbPassword,
    database: configService.dbName,
});

export class OfferService {
    async getAllOffers({ limit, page, searchQuery }: { limit: number; page: number; searchQuery?: string, }) {
        try {
            if (isNaN(limit) || limit < 1) {
                limit = 20;
            }

            if (isNaN(page) || page < 1) {
                page = 1;
            }

            const offset = (page - 1) * limit;
            const params: (string | number)[] = [];
            let paramIndex = 1;

            let sqlQuery = `
                SELECT o.*, c.category_name,
                       s.status_name, u.name as user_name
                FROM offers o
                         JOIN ad_categories c ON o.category_id = c.category_id
                         JOIN ad_statuses s ON o.status_id = s.status_id
                         JOIN users u ON o.user_id = u.id
                WHERE s.status_name = 'active'
                  
            `;

            const trimmedSearchQuery = searchQuery?.trim();
            if (trimmedSearchQuery) {
                sqlQuery += ` AND (o.title ILIKE $${paramIndex} OR o.description ILIKE $${paramIndex})`;
                params.push(`%${trimmedSearchQuery}%`);
                paramIndex++;
            }

            sqlQuery = `${sqlQuery} LIMIT $${paramIndex}`;
            params.push(limit);
            paramIndex++;

            sqlQuery = `${sqlQuery} OFFSET $${paramIndex}`;
            params.push(offset);

            sqlQuery = `${sqlQuery} ORDER BY o.created_date DESC`;

            let result = await pool.query(sqlQuery, params);

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
export const offerService = new OfferService();
