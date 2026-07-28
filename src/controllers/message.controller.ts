import { Request, Response } from 'express';
import { messageService } from '../services/message.service.js';
import { authenticate } from '../middleware/jwt-validate.js';
import logger from '../common/logger/logger.js';
import { error } from 'node:console';

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
            const threadId = Number(req.params.threadId);
            const { body } = req.body;

            if (!threadId || !body) {
                return res.status(400).json({
                    message: 'threadId and body indeed'
                });
            }

            const message = await messageService.sendMessage(userId!, threadId, body);

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
            const threadId = Number(req.params.threadId);

            if (!threadId) {
                return res.status(400).json({
                    success: false,
                    message: 'threadId indeed'
                });
            }

            const messages = await messageService.getMessages(threadId, userId!);

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
    async getThreadsWithLastMessage(req: Request, res: Response){
        try{
            const threadId = req.params.threadId;
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
        }
        catch(error: any){
         res.status(400).json({
                message: error.message
            });
            
        }
    }
    
    async deleteMessage(req: Request, res: Response) {
        try {
            const messageId = parseInt(req.params.messageId as string);
            const userId = req.userId;
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            await messageService.deleteMessage(messageId, userId);

            res.status(200).json({
                success: true,
                message: 'Message deleted successfully'
            });
        } catch (error) {
            res.status(404).json({
                
            });
        }
    }
}
export const messageController = new MessageController();

