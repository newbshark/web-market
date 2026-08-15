
import { getPool } from '../common/database.js';
import logger from '../common/logger/logger.js';
import { Thread, Message, ThreadWithLastMessage } from './interfaces/index.js';

export class MessageService {
    private pool = getPool();

    async createOrGetThread(userId: number, otherUserId: number): Promise<Thread> {
       
        if (userId === otherUserId) {
            logger.error('User tried to create thread with themselves', { userId });
            throw new Error('Cannot create thread with yourself');
        }

        try {
            
            const query = `
                SELECT idthread, user_id, nextuser_id
                FROM threads 
                WHERE (user_id = $1 AND nextuser_id = $2) 
                   OR (user_id = $2 AND nextuser_id = $1)
            `;
            const result = await this.pool.query(query, [userId, otherUserId]);

            if (result.rows.length > 0) {
                logger.debug('Existing thread found', {
                    threadId: result.rows[0].idthread,
                    userId,
                    otherUserId
                });
                return result.rows[0];
            }

            
            const insertQuery = `
                INSERT INTO threads (user_id, nextuser_id)
                VALUES ($1, $2)
                RETURNING idthread, user_id, nextuser_id
            `;
            const newThread = await this.pool.query(insertQuery, [userId, otherUserId]);

            logger.info('New thread created', {
                threadId: newThread.rows[0].idthread,
                userId,
                otherUserId
            });

            return newThread.rows[0];

        } catch (error) {
            logger.error('Error in createOrGetThread:', error);
            throw new Error(`Failed to create or get thread: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async sendMessage(senderId: number, threadId: number, body: string): Promise<Message> {
        try {
            
            if (!body?.trim()) {
                throw new Error('Message cannot be empty');
            }

            if (body.length > 10000) {
                throw new Error('Message is too long (max 10000 characters)');
            }

            
            const accessCheck = `
                SELECT idthread, user_id, nextuser_id
                FROM threads 
                WHERE idthread = $1 
                  AND (user_id = $2 OR nextuser_id = $2)
            `;
            const access = await this.pool.query(accessCheck, [threadId, senderId]);

            if (access.rows.length === 0) {
                logger.warn('User tried to send message to thread without access', {
                    senderId,
                    threadId
                });
                throw new Error('No access to this thread');
            }

            
            const thread = access.rows[0];
            if (thread.user_id === thread.nextuser_id) {
                throw new Error('Invalid thread');
            }

            
            const query = `
                INSERT INTO messages (thread_id, sender_id, body, created_at)
                VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
                RETURNING id, thread_id, sender_id, body, created_at
            `;
            const result = await this.pool.query(query, [
                threadId,
                senderId,
                body.trim()
            ]);

            logger.debug('Message sent successfully', {
                messageId: result.rows[0].id,
                threadId,
                senderId,
                messageLength: body.length
            });

            return result.rows[0];
        } catch (error) {
            logger.error('Error in sendMessage:', error);
            throw error;
        }
    }

    async getMessages(threadId: number, userId: number): Promise<Message[]> {
        try {
            
            const threadCheck = await this.pool.query(
                `SELECT idthread FROM threads 
                 WHERE idthread = $1 
                 AND (user_id = $2 OR nextuser_id = $2)`,
                [threadId, userId]
            );

            if (threadCheck.rows.length === 0) {
                throw new Error('User is not a participant of this thread');
            }

            
            const result = await this.pool.query(
                `SELECT m.id, m.thread_id, m.sender_id, m.body, m.created_at, u.name as sender_name
                 FROM messages m
                 JOIN users u ON m.sender_id = u.id
                 WHERE m.thread_id = $1
                 ORDER BY m.created_at ASC`,
                [threadId]
            );

            return result.rows;
        } catch (error) {
            logger.error('Error in getMessages:', error);
            throw new Error(`Failed to get messages: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async getThreadsWithLastMessage(userId: number): Promise<ThreadWithLastMessage[]> {
        try {
            const result = await this.pool.query(
                `SELECT 
                    t.idthread as thread_id,
                    t.user_id,
                    t.nextuser_id,
                    CASE 
                        WHEN t.user_id = $1 THEN u2.name 
                        ELSE u1.name 
                    END as other_user_name,
                    m.id as last_message_id,
                    m.body as last_message,
                    m.created_at as last_message_date,
                    m.sender_id as last_sender_id
                 FROM threads t
                 JOIN users u1 ON t.user_id = u1.id
                 JOIN users u2 ON t.nextuser_id = u2.id
                 LEFT JOIN LATERAL (
                     SELECT * FROM messages 
                     WHERE thread_id = t.idthread 
                     ORDER BY created_at DESC 
                     LIMIT 1
                 ) m ON true
                 WHERE t.user_id = $1 OR t.nextuser_id = $1
                 ORDER BY m.created_at DESC NULLS LAST`,
                [userId]
            );

            return result.rows;
        } catch (error) {
            logger.error('Error in getThreadsWithLastMessage:', error);
            throw new Error(`Failed to get threads: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async deleteMessage(messageId: number, userId: number): Promise<void> {
        try {
            
            const result = await this.pool.query(
                `DELETE FROM messages 
                 WHERE id = $1 AND sender_id = $2 
                 RETURNING id`,
                [messageId, userId]
            );

            if (result.rows.length === 0) {
                throw new Error('Message not found or you are not the sender');
            }

            logger.debug('Message deleted', { messageId, userId });
        } catch (error) {
            logger.error('Error in deleteMessage:', error);
            throw new Error(`Failed to delete message: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}

export const messageService = new MessageService();