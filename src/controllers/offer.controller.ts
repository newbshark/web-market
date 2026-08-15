
import { Request, Response } from "express";
import { offerService } from "../services/offer.service.js";
import { GetAllOffersParams } from "../services/interfaces/index.js";
import logger from '../common/logger/logger.js';

export const getAllOffers = async (req: Request, res: Response) => {
    try {
        let limit = parseInt(req.query.limit as string);
        let page = parseInt(req.query.page as string);

        if (isNaN(limit) || limit < 1) {
            limit = 20;
        }

        if (isNaN(page) || page < 1) {
            page = 1;
        }

        const queryParams: GetAllOffersParams = {
            limit,
            page,
            searchQuery: req.query.searchQuery as string
        };

        logger.debug('Getting all offers', { limit, page, searchQuery: queryParams.searchQuery });

        const offers = await offerService.getAllOffers(queryParams);
        
        res.json({
            success: true,
            data: offers,
            pagination: {
                limit,
                page
            }
        });
    } catch (error) {
        logger.error('getAllOffers error:', error);
        const message = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({
            success: false,
            message
        });
    }
};

export const createOffer = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized'
            });
        }

        const { title, description, price, category_id } = req.body;

        
        if (!title || !price || !category_id) {
            return res.status(400).json({
                success: false,
                message: 'title, price and category_id are required'
            });
        }

        if (typeof price !== 'number' || price <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Price must be a positive number'
            });
        }

        if (title.length < 3) {
            return res.status(400).json({
                success: false,
                message: 'Title must be at least 3 characters long'
            });
        }

        const offer = await offerService.createOffer({
            title,
            description: description || '',
            price,
            category_id,
            user_id: userId
        });

        logger.info('Offer created', { 
            offerId: offer.id, 
            userId, 
            title: offer.title 
        });

        res.status(201).json({
            success: true,
            data: offer
        });
    } catch (error) {
        logger.error('createOffer error:', error);
        const message = error instanceof Error ? error.message : 'Failed to create offer';
        res.status(400).json({
            success: false,
            message
        });
    }
};

export const getUserOffers = async (req: Request, res: Response) => {
    try {
        const userId = parseInt(req.params.userId as string, 10);
        
        if (isNaN(userId) || userId < 1) {
            return res.status(400).json({
                success: false,
                message: 'Invalid userId'
            });
        }

        const offers = await offerService.getUserOffers(userId);
        
        res.json({
            success: true,
            data: offers
        });
    } catch (error) {
        logger.error('getUserOffers error:', error);
        const message = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({
            success: false,
            message
        });
    }
};