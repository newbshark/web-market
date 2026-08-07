
import { Offer, GetAllOffersParams } from './interfaces/index.js';
import { getPool } from '../common/database.js';
import logger from '../common/logger/logger.js';



export class OfferService {

    private pool = getPool();

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
                         JOIN offer_categories c ON o.category_id = c.category_id
                         JOIN offer_statuses s ON o.status_id = s.status_id
                         JOIN users u ON o.user_id = u.id
                WHERE s.status_name = 'active'
            `;

            const trimmedSearchQuery = searchQuery?.trim();
            if (trimmedSearchQuery) {
                sqlQuery += ` AND (o.title ILIKE $${paramIndex} OR o.description ILIKE $${paramIndex})`;
                values.push(`%${trimmedSearchQuery}%`);
                paramIndex++;
            }

            sqlQuery += `ORDER BY o.created_date DESC`;

            sqlQuery += ` LIMIT $${paramIndex}`;
            values.push(limit);
            paramIndex++;

            sqlQuery += ` OFFSET $${paramIndex}`;
            values.push(offset);


            const result = await this.pool.query(sqlQuery, values);

            return result.rows;
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            logger.error('DB error in getAllOffers:', error);
            throw error;
        }
    }
    async getUserOffers(userId: number): Promise<Offer[]> {
        try {
            const result = await this.pool.query(
                `SELECT o.*, c.category_name, s.status_name, u.name as user_name
                 FROM offers o
                 JOIN offer_categories c ON o.category_id = c.category_id
                 JOIN offer_statuses s ON o.status_id = s.status_id
                 JOIN users u ON o.user_id = u.id
                 WHERE o.user_id = $1`,
                [userId]
            );
            return result.rows;
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            logger.error('DB error in getUserOffers:', error);
            throw error;
        }
    }
    async createOffer(offerData: {
        title: string;
        description: string;
        price: number;
        category_id: number;
        user_id: number;
    }): Promise<Offer> {
        try {
            const { title, description, price, category_id, user_id } = offerData;

            
            const categoryCheck = await this.pool.query(
                'SELECT category_id FROM offer_categories WHERE category_id = $1',
                [category_id]
            );

            if (categoryCheck.rows.length === 0) {
                throw new Error('Category not found');
            }

            
            const statusCheck = await this.pool.query(
                'SELECT status_id FROM offer_statuses WHERE status_id = 1 AND status_name = $1',
                ['active']
            );

            if (statusCheck.rows.length === 0) {
                throw new Error('Status "active" not found');
            }

            
            const result = await this.pool.query(
                `INSERT INTO offers (title, description, price, category_id, user_id, status_id)
                 VALUES ($1, $2, $3, $4, $5, 1)
                 RETURNING id, title, description, price, category_id, user_id, status_id, created_date`,
                [title, description || '', price, category_id, user_id]
            );

            
            const offerResult = await this.pool.query(
                `SELECT o.*, c.category_name, s.status_name, u.name as user_name
                 FROM offers o
                 JOIN offer_categories c ON o.category_id = c.category_id
                 JOIN offer_statuses s ON o.status_id = s.status_id
                 JOIN users u ON o.user_id = u.id
                 WHERE o.id = $1`,
                [result.rows[0].id]
            );

            logger.info('Offer created successfully', {
                offerId: result.rows[0].id,
                userId: user_id,
                title: title
            });

            return offerResult.rows[0];
        } catch (error) {
            logger.error('DB error in createOffer:', error);
            throw error;
        }
    }
}

export const offerService = new OfferService();
