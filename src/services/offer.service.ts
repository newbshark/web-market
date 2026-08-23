import { Offer, GetAllOffersParams } from './interfaces/index.js';
import { getKnex } from '../common/database/knex.js';
import logger from '../common/logger/logger.js';

export class OfferService {
    private knex = getKnex();

    async getAllOffers(queryParams: GetAllOffersParams): Promise<{ offers: Offer[]; total: number }> {
        const { limit = 20, page = 1, searchQuery } = queryParams;

        try {
            const offset = (page - 1) * limit;

            let query = this.knex('offers as o')
                .select(
                    'o.id',
                    'o.title',
                    'o.description',
                    'o.price',
                    'o.category_id',
                    'o.status_id',
                    'o.user_id',
                    'o.created_date',
                    'c.category_name',
                    's.status_name',
                    'u.name as user_name'
                )
                .join('offer_categories as c', 'o.category_id', 'c.category_id')
                .join('offer_statuses as s', 'o.status_id', 's.status_id')
                .join('users as u', 'o.user_id', 'u.id')
                .where('s.status_name', 'active');

            const trimmedSearchQuery = searchQuery?.trim();
            if (trimmedSearchQuery) {
                query = query.where(function () {
                    this.where('o.title', 'ilike', `%${trimmedSearchQuery}%`)
                        .orWhere('o.description', 'ilike', `%${trimmedSearchQuery}%`);
                });
            }

            const countQuery = this.knex('offers as o')
                .count('o.id as total')
                .join('offer_categories as c', 'o.category_id', 'c.category_id')
                .join('offer_statuses as s', 'o.status_id', 's.status_id')
                .join('users as u', 'o.user_id', 'u.id')
                .where('s.status_name', 'active');

            if (trimmedSearchQuery) {
                countQuery.where(function () {
                    this.where('o.title', 'ilike', `%${trimmedSearchQuery}%`)
                        .orWhere('o.description', 'ilike', `%${trimmedSearchQuery}%`);
                });
            }

            const [totalResult] = await countQuery;
            const total = Number(totalResult?.total) || 0;

            const offers = await query
                .orderBy('o.created_date', 'desc')
                .limit(limit)
                .offset(offset);

            return { offers, total };
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            logger.error('DB error in getAllOffers:', error);
            throw error;
        }
    }

    async getUserOffers(userId: number): Promise<Offer[]> {
        try {
            const offers = await this.knex('offers as o')
                .select(
                    'o.id',
                    'o.title',
                    'o.description',
                    'o.price',
                    'o.category_id',
                    'o.status_id',
                    'o.user_id',
                    'o.created_date',
                    'c.category_name',
                    's.status_name',
                    'u.name as user_name'
                )
                .join('offer_categories as c', 'o.category_id', 'c.category_id')
                .join('offer_statuses as s', 'o.status_id', 's.status_id')
                .join('users as u', 'o.user_id', 'u.id')
                .where('o.user_id', userId)
                .orderBy('o.created_date', 'desc');

            return offers;
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

            const category = await this.knex('offer_categories')
                .where('category_id', category_id)
                .first();

            if (!category) {
                throw new Error('Category not found');
            }

            const status = await this.knex('offer_statuses')
                .where('status_id', 1)
                .where('status_name', 'active')
                .first();

            if (!status) {
                throw new Error('Status "active" not found');
            }

            const [newOffer] = await this.knex('offers')
                .insert({
                    title,
                    description: description || '',
                    price,
                    category_id,
                    user_id,
                    status_id: 1,
                })
                .returning(['id', 'title', 'description', 'price', 'category_id', 'user_id', 'status_id', 'created_date']);

            const [offer] = await this.knex('offers as o')
                .select(
                    'o.id',
                    'o.title',
                    'o.description',
                    'o.price',
                    'o.category_id',
                    'o.status_id',
                    'o.user_id',
                    'o.created_date',
                    'c.category_name',
                    's.status_name',
                    'u.name as user_name'
                )
                .join('offer_categories as c', 'o.category_id', 'c.category_id')
                .join('offer_statuses as s', 'o.status_id', 's.status_id')
                .join('users as u', 'o.user_id', 'u.id')
                .where('o.id', newOffer.id);

            logger.info('Offer created successfully', {
                offerId: newOffer.id,
                userId: user_id,
                title: title
            });

            return offer;
        } catch (error) {
            logger.error('DB error in createOffer:', error);
            throw error;
        }
    }


    async completeOffer(offerId: number, userId: number): Promise<Offer> {
        try {
            const offer = await this.knex('offers')
                .where('id', offerId)
                .where('user_id', userId)
                .first();

            if (!offer) {
                throw new Error('Offer not found or you are not the owner');
            }

            if (offer.status_id !== 1) {
                throw new Error('Only active offers can be completed');
            }

            await this.knex('offers')
                .where('id', offerId)
                .update({ status_id: 4 });

            const [completedOffer] = await this.knex('offers as o')
                .select(
                    'o.id',
                    'o.title',
                    'o.description',
                    'o.price',
                    'o.category_id',
                    'o.status_id',
                    'o.user_id',
                    'o.created_date',
                    'c.category_name',
                    's.status_name',
                    'u.name as user_name'
                )
                .join('offer_categories as c', 'o.category_id', 'c.category_id')
                .join('offer_statuses as s', 'o.status_id', 's.status_id')
                .join('users as u', 'o.user_id', 'u.id')
                .where('o.id', offerId);

            logger.info(`Offer ${offerId} completed by user ${userId}`);
            return completedOffer;
        } catch (error) {
            logger.error('Error in completeOffer:', error);
            throw error;
        }
    }


    async getFinishedOffers(userId: number): Promise<Offer[]> {
        try {
            const offers = await this.knex('offers as o')
                .select(
                    'o.id',
                    'o.title',
                    'o.description',
                    'o.price',
                    'o.category_id',
                    'o.status_id',
                    'o.user_id',
                    'o.created_date',
                    'c.category_name',
                    's.status_name',
                    'u.name as user_name'
                )
                .join('offer_categories as c', 'o.category_id', 'c.category_id')
                .join('offer_statuses as s', 'o.status_id', 's.status_id')
                .join('users as u', 'o.user_id', 'u.id')
                .where('o.user_id', userId)
                .where('s.status_name', 'finished')
                .orderBy('o.created_date', 'desc');

            logger.info(`Retrieved ${offers.length} finished offers for user ${userId}`);
            return offers;
        } catch (error) {
            logger.error('Error in getFinishedOffers:', error);
            throw error;
        }
    }
}

export const offerService = new OfferService();