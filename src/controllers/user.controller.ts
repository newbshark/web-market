import { Request, Response } from 'express';
import { userService } from '../services/user.service.js';
import logger from '../common/logger/logger.js';

export class UserController {
    async updateUserName(req: Request, res: Response) {
        try {
            const userId = req.userId;
            const { name } = req.body;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Unauthorized'
                });
            }

            if (!name || typeof name !== 'string' || name.trim().length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Name is required and must be a non-empty string'
                });
            }

            const updatedUser = await userService.updateUserName(userId, name.trim());

            res.json({
                success: true,
                user: updatedUser
            });
        } catch (error) {
            logger.error('Error in updateUserName controller:', error);
            const message = error instanceof Error ? error.message : 'Unknown error';
            res.status(400).json({
                success: false,
                message
            });
        }
    }

    async getMe(req: Request, res: Response) {
        try {
            const userId = req.userId;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Unauthorized'
                });
            }

            const user = await userService.getUserById(userId);

            res.json({
                success: true,
                user
            });
        } catch (error) {
            logger.error('Error in getMe controller:', error);
            const message = error instanceof Error ? error.message : 'Unknown error';
            res.status(400).json({
                success: false,
                message
            });
        }
    }

    async getAllUsers(req: Request, res: Response) {
        try {
            const userId = req.userId;
            const limit = Number(req.query.limit) || 20;
            const page = Number(req.query.page) || 1;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Unauthorized'
                });
            }


            const currentUser = await userService.getUserById(userId);
            if (currentUser.role !== 'admin') {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied. Admin role required.'
                });
            }

            const result = await userService.getAllUsers(limit, page);

            res.json({
                success: true,
                data: result.users,
                pagination: {
                    page,
                    limit,
                    total: result.total,
                    totalPages: Math.ceil(result.total / limit)
                }
            });
        } catch (error) {
            logger.error('Error in getAllUsers controller:', error);
            const message = error instanceof Error ? error.message : 'Unknown error';
            res.status(400).json({
                success: false,
                message
            });
        }
    }

    async searchUsers(req: Request, res: Response) {
        try {
            const userId = req.userId;
            const { searchTerm } = req.query;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Unauthorized'
                });
            }

            if (!searchTerm || typeof searchTerm !== 'string' || searchTerm.trim().length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Search term is required'
                });
            }

            const users = await userService.searchUsers(searchTerm.trim());

            res.json({
                success: true,
                data: users
            });
        } catch (error) {
            logger.error('Error in searchUsers controller:', error);
            const message = error instanceof Error ? error.message : 'Unknown error';
            res.status(400).json({
                success: false,
                message
            });
        }
    }
}

export const userController = new UserController();
