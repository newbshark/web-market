import { getKnex } from '../common/database/knex.js';
import logger from '../common/logger/logger.js';
import { Thread, Message, ThreadWithLastMessage } from './interfaces/index.js';

export class MessageService {
    private knex = getKnex();

    async createOrGetThread(userId: number, otherUserId: number): Promise<Thread> {
        if (userId === otherUserId) {
            logger.error('User tried to create thread with themselves', { userId });
            throw new Error('Cannot create thread with yourself');
        }

        try {

            const thread = await this.knex('threads')
                .select('idthread', 'user_id', 'nextuser_id')
                .where(function () {
                    this.where('user_id', userId).andWhere('nextuser_id', otherUserId);
                })
                .orWhere(function () {
                    this.where('user_id', otherUserId).andWhere('nextuser_id', userId);
                })
                .first();

            if (thread) {
                logger.debug('Existing thread found', {
                    threadId: thread.idthread,
                    userId,
                    otherUserId
                });
                return thread;
            }


            const [newThread] = await this.knex('threads')
                .insert({
                    user_id: userId,
                    nextuser_id: otherUserId,
                })
                .returning(['idthread', 'user_id', 'nextuser_id']);

            logger.info('New thread created', {
                threadId: newThread.idthread,
                userId,
                otherUserId
            });

            return newThread;

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


            const thread = await this.knex('threads')
                .select('idthread', 'user_id', 'nextuser_id')
                .where('idthread', threadId)
                .where(function () {
                    this.where('user_id', senderId).orWhere('nextuser_id', senderId);
                })
                .first();

            if (!thread) {
                logger.warn('User tried to send message to thread without access', {
                    senderId,
                    threadId
                });
                throw new Error('No access to this thread');
            }

            if (thread.user_id === thread.nextuser_id) {
                throw new Error('Invalid thread');
            }


            const [message] = await this.knex('messages')
                .insert({
                    thread_id: threadId,
                    sender_id: senderId,
                    body: body.trim(),
                })
                .returning(['id', 'thread_id', 'sender_id', 'body', 'created_at']);

            logger.debug('Message sent successfully', {
                messageId: message.id,
                threadId,
                senderId,
                messageLength: body.length
            });

            return message;
        } catch (error) {
            logger.error('Error in sendMessage:', error);
            throw error;
        }
    }

    async getMessages(threadId: number, userId: number): Promise<Message[]> {
        try {

            const thread = await this.knex('threads')
                .select('idthread')
                .where('idthread', threadId)
                .where(function () {
                    this.where('user_id', userId).orWhere('nextuser_id', userId);
                })
                .first();

            if (!thread) {
                throw new Error('User is not a participant of this thread');
            }


            const messages = await this.knex('messages as m')
                .select(
                    'm.id',
                    'm.thread_id',
                    'm.sender_id',
                    'm.body',
                    'm.created_at',
                    'u.name as sender_name'
                )
                .join('users as u', 'm.sender_id', 'u.id')
                .where('m.thread_id', threadId)
                .orderBy('m.created_at', 'asc');

            return messages;
        } catch (error) {
            logger.error('Error in getMessages:', error);
            throw new Error(`Failed to get messages: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async getThreadsWithLastMessage(userId: number): Promise<ThreadWithLastMessage[]> {
        try {

            const threads = await this.knex.raw(
                `SELECT 
                    t.idthread as thread_id,
                    t.user_id,
                    t.nextuser_id,
                    CASE 
                        WHEN t.user_id = ? THEN u2.name 
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
                 WHERE t.user_id = ? OR t.nextuser_id = ?
                 ORDER BY m.created_at DESC NULLS LAST`,
                [userId, userId, userId]
            );

            return threads.rows;
        } catch (error) {
            logger.error('Error in getThreadsWithLastMessage:', error);
            throw new Error(`Failed to get threads: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async deleteMessage(messageId: number, userId: number): Promise<void> {
        try {

            const deleted = await this.knex('messages')
                .where('id', messageId)
                .where('sender_id', userId)
                .delete()
                .returning('id');

            if (deleted.length === 0) {
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