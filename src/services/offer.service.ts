import { Pool } from 'pg';
import { configService } from '../common/config/config.service.js';
import { Offer, GetAllOffersParams } from './interfaces/index.js'
import logger from '../common/logger/logger.js';


const pool = new Pool({
    host: configService.dbHost,
    port: configService.dbPort,
    user: configService.dbUser,
    password: configService.dbPassword,
    database: configService.dbName,
});

export class OfferService {
    async getAllOffers(queryParams: GetAllOffersParams): Promise<Offer[]> {

        const { limit, page } = queryParams;
        const searchQuery = queryParams.searchQuery;

        try {
            
            const offset = (page - 1) * limit;
            const values: (string | number)[] = [];
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
                values.push(`%${trimmedSearchQuery}%`);
                paramIndex++;
            }

            sqlQuery = `${sqlQuery} ORDER BY o.created_date DESC`;

            sqlQuery = `${sqlQuery} LIMIT $${paramIndex}`;
            values.push(limit);
            paramIndex++;

            sqlQuery = `${sqlQuery} OFFSET $${paramIndex}`;
            values.push(offset);


            const result = await pool.query(sqlQuery, values);

            return result.rows;
        } catch (error) {
            const message = error instanceof Error? error.message : 'Unknown error';
            logger.error('DB error in getAllOffers:', message);
            throw error;
        }
    }
    async getUserOffers(userId: number): Promise<Offer[]> {
        try {
            const result = await pool.query(
                'SELECT * FROM offers WHERE user_id = $1',
                [userId]
            );
            return result.rows;
        } catch (error) {
            const message = error instanceof Error? error.message : 'Unknown error';
            logger.error('DB error in getUserOffers:', message);
            throw error;
        }
    }

}
export const offerService = new OfferService();
