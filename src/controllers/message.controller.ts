import { Request, Response } from 'express';
import { messageService } from '../services/message.service.js';
import { authenticate } from '../middleware/jwt-validate.js';

export class MessageController {
    async createThread(req: Request, res: Response) {

        try {
            const userId = req.userId; // из JWT middleware
            const { otherUserId } = req.body;

            if (!otherUserId) {
                return res.status(400).json({
                    success: false,
                    message: 'otherUserId обязателен'
                });
            }

            const thread = await messageService.createOrGetThread(userId!, Number(otherUserId));

            res.status(200).json({
                success: true,
                thread
            });
        } catch (error: any) {
            res.status(400).json({
                message: error.message
            });
        }
    }

    async sendMessage(req: Request, res: Response) {
        try {
            const userId = req.userId;
            const { threadId, body } = req.body;

            if (!threadId || !body) {
                return res.status(400).json({
                    message: 'threadId and body indeed'
                });
            }

            const message = await messageService.sendMessage(userId!, Number(threadId), body);

            res.status(201).json({
                message
            });
        } catch (error: any) {
            res.status(400).json({
                message: error.message
            });
        }
    }

    async getMessages(req: Request, res: Response) {
        try {
            const userId = req.userId;
            const { threadId } = req.params;

            if (!threadId) {
                return res.status(400).json({
                    success: false,
                    message: 'threadId indeed'
                });
            }

            const messages = await messageService.getMessages(Number(threadId), userId!);

            res.status(200).json({
                data: messages
            });
        } catch (error: any) {
            res.status(400).json({
                message: error.message
            });
        }
    }

    async getUserThreads(req: Request, res: Response) {
        try {
            const userId = req.userId;

            const threads = await messageService.getUserThreads(userId!);

            res.status(200).json({
                data: threads
            });
        } catch (error: any) {
            res.status(400).json({
                message: error.message
            });
        }
    }
}
export const messageController = new MessageController();

