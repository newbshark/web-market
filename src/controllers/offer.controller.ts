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

        const result = await offerService.getAllOffers(queryParams);

        res.json({
            success: true,
            data: result.offers,
            pagination: {
                limit,
                page,
                total: result.total,
                totalPages: Math.ceil(result.total / limit)
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
            console.log('No userId found');
            return res.status(401).json({
                success: false,
                message: 'Unauthorized'
            });
        }

        const { title, description, price, category_id } = req.body;



        if (!title || !price || !category_id) {
            console.log('Missing required fields');
            return res.status(400).json({
                success: false,
                message: 'title, price and category_id are required'
            });
        }

        const offer = await offerService.createOffer({
            title,
            description: description || '',
            price,
            category_id,
            user_id: userId
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


export const completeOffer = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        const offerId = Number(req.params.offer_id);

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized'
            });
        }

        if (!offerId || isNaN(offerId)) {
            return res.status(400).json({
                success: false,
                message: 'Valid offer ID is required'
            });
        }

        const completedOffer = await offerService.completeOffer(offerId, userId);

        res.json({
            success: true,
            message: 'Offer completed successfully',
            data: completedOffer
        });
    } catch (error) {
        logger.error('Error in completeOffer controller:', error);
        const message = error instanceof Error ? error.message : 'Unknown error';
        res.status(400).json({
            success: false,
            message
        });
    }
};


export const getFinishedOffers = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        const targetUserId = Number(req.params.userId);

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized'
            });
        }


        if (userId !== targetUserId) {
            return res.status(403).json({
                success: false,
                message: 'You can only view your own finished offers'
            });
        }

        const offers = await offerService.getFinishedOffers(userId);

        res.json({
            success: true,
            data: offers
        });
    } catch (error) {
        logger.error('Error in getFinishedOffers controller:', error);
        const message = error instanceof Error ? error.message : 'Unknown error';
        res.status(400).json({
            success: false,
            message
        });
    }
};