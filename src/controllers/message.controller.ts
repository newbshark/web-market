
import { Request, Response } from 'express';
import { messageService } from '../services/message.service.js';
import logger from '../common/logger/logger.js';

export class MessageController {
    async createThread(req: Request, res: Response) {
        try {
            const userId = req.userId;
            const { otherUserId } = req.body;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'User is not authorized'
                });
            }

            if (!otherUserId) {
                return res.status(400).json({
                    success: false,
                    message: 'otherUserId is required'
                });
            }

            const thread = await messageService.createOrGetThread(userId, Number(otherUserId));

            res.status(200).json({
                success: true,
                thread
            });
        } catch (error) {
            logger.error('createThread error:', error);
            const message = error instanceof Error ? error.message : 'Failed to create thread';
            res.status(400).json({
                success: false,
                message
            });
        }
    }

    async sendMessage(req: Request, res: Response) {
        try {
            const userId = req.userId;
            const { threadId, body } = req.body;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'User is not authorized'
                });
            }

            if (!threadId || !body) {
                return res.status(400).json({
                    success: false,
                    message: 'threadId and body are required'
                });
            }

            const message = await messageService.sendMessage(
                userId,
                Number(threadId),
                body
            );

            res.status(201).json({
                success: true,
                message
            });
        } catch (error) {
            logger.error('sendMessage error:', error);
            const message = error instanceof Error ? error.message : 'Failed to send message';
            res.status(400).json({
                success: false,
                message
            });
        }
    }

    async getMessages(req: Request, res: Response) {
        try {
            const userId = req.userId;

            const threadId = Number(req.params.threadId);

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'User is not authorized'
                });
            }

            if (!threadId || isNaN(threadId)) {
                return res.status(400).json({
                    success: false,
                    message: 'Valid threadId is required'
                });
            }

            const messages = await messageService.getMessages(threadId, userId);

            res.status(200).json({
                success: true,
                data: messages
            });
        } catch (error) {
            logger.error('getMessages error:', error);
            const message = error instanceof Error ? error.message : 'Failed to get messages';
            res.status(400).json({
                success: false,
                message
            });
        }
    }

    async getThreadsWithLastMessage(req: Request, res: Response) {
        try {
            const userId = req.userId;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Unauthorized'
                });
            }

            const threads = await messageService.getThreadsWithLastMessage(userId);

            res.status(200).json({
                success: true,
                data: threads
            });
        } catch (error) {
            logger.error('getThreadsWithLastMessage error:', error);
            const message = error instanceof Error ? error.message : 'Failed to get threads';
            res.status(400).json({
                success: false,
                message
            });
        }
    }

    async deleteMessage(req: Request, res: Response) {
        try {
            const userId = req.userId;

            const messageId = Number(req.params.messageId);

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Unauthorized'
                });
            }

            if (!messageId || isNaN(messageId)) {
                return res.status(400).json({
                    success: false,
                    message: 'Valid messageId is required'
                });
            }

            await messageService.deleteMessage(messageId, userId);

            res.status(200).json({
                success: true,
                message: 'Message deleted successfully'
            });
        } catch (error) {
            logger.error('deleteMessage error:', error);
            const message = error instanceof Error ? error.message : 'Failed to delete message';
            res.status(404).json({
                success: false,
                message
            });
        }
    }
}

export const messageController = new MessageController();