import { Pool } from "pg";
import { Thread } from "./interfaces/index.js";
import { Message } from "./interfaces/index.js";
import { configService } from "../common/config/config.service.js";
import logger from "../common/logger/logger.js";

const pool = new Pool({
    host: configService.dbHost,
    port: configService.dbPort,
    user: configService.dbUser,
    password: configService.dbPassword,
    database: configService.dbName,
});

export class MessageService {
    async createOrGetThread(userId: number, otherUserId: number): Promise<Thread> {
        if (userId === otherUserId) {
            logger.error('Cannot create thread for user itself');
        }
        const query = `
            SELECT idthread 
            FROM threads 
            WHERE (user_id = $1 AND nextuser_id = $2) 
               OR (user_id = $2 AND nextuser_id = $1)
        `;
        const result = await pool.query(query, [userId, otherUserId]);

        if (result.rows.length > 0) {
            return result.rows[0];
        }
        const insertQuery = `
        INSERT INTO threads(user_id, nextuser_id)
        VALUES ($1, $2)
        RETURNING *
        `;
        const newThread = await pool.query(insertQuery, [userId, otherUserId]);
        return newThread.rows[0];
    }

    async sendMessage(senderId: number, threadId: number, body: string){
        if (!body?.trim()) {
            throw new Error('Message can not be empty');
        }
        const accessCheck = `
            SELECT idthread 
            FROM threads 
            WHERE idthread = $1 
              AND (user_id = $2 OR nextuser_id = $2)
        `;
        const access = await pool.query(accessCheck, [threadId, senderId]);
        if (access.rows.length === 0) {
            throw new Error('No acccess to that thread');
        }
        const query = `
            INSERT INTO messages (thread_id, sender_id, body)
            VALUES ($1, $2, $3)
            RETURNING *
        `;
        const result = await pool.query(query, [threadId, senderId, body.trim()]);
        return result.rows[0];
    }


    async getMessages(threadId: number, userId: number){
        const accessCheck = `
            SELECT idthread 
            FROM threads 
            WHERE idthread = $1 
              AND (user_id = $2 OR nextuser_id = $2)
        `;
        const access = await pool.query(accessCheck, [threadId, userId]);
        if (access.rows.length === 0) {
            throw new Error('No acccess to that thread');
        }

        const query = `
            SELECT 
                m.id,
                m.thread_id,
                m.sender_id,
                m.body,
                m.created_at,
                u.name as sender_name
            FROM messages m
            JOIN users u ON u.id = m.sender_id
            WHERE m.thread_id = $1
            ORDER BY m.created_at ASC
        `;

        const result = await pool.query(query, [threadId]);
        return result.rows;
    

    }
    async getUserThreads(userId: number){
        const query = `
            SELECT 
                t.idthread,
                t.user_id,
                t.nextuser_id,
                u.name as other_user_name,
                m.body as last_message,
                m.created_at as last_message_date,
                m.sender_id as last_sender_id
            FROM threads t
            JOIN users u ON u.id = (CASE 
                WHEN t.user_id = $1 THEN t.nextuser_id 
                ELSE t.user_id 
            END)
            LEFT JOIN LATERAL (
                SELECT body, created_at, sender_id
                FROM messages 
                WHERE thread_id = t.idthread
                ORDER BY created_at DESC
                LIMIT 1
            ) m ON true
            WHERE t.user_id = $1 OR t.nextuser_id = $1
            ORDER BY m.created_at DESC NULLS LAST
        `;

        const result = await pool.query(query, [userId]);
        return result.rows;
    }


    async deleteMessage(messageId: number, userId: number): Promise<boolean> {
    const query = `
        DELETE FROM messages 
        WHERE id = $1 
          AND sender_id = $2
        RETURNING id
    `;

    const result = await pool.query(query, [messageId, userId]);
    
    if (result.rowCount === 0) {
        throw new Error('Message not found or you do not have permission to delete it');
    }
    
    return true; 

    }
    async getThreadsWithLastMessage(userId: number) {
    const query = `
        SELECT 
            t.idthread as thread_id,
            t.user_id,
            t.nextuser_id,
            u.name as other_user_name,
            m.id as last_message_id,
            m.body as last_message,
            m.created_at as last_message_date,
            m.sender_id as last_sender_id
        FROM threads t
        JOIN users u ON u.id = (CASE 
            WHEN t.user_id = $1 THEN t.nextuser_id 
            ELSE t.user_id 
        END)
        LEFT JOIN LATERAL (
            SELECT id, body, created_at, sender_id
            FROM messages 
            WHERE thread_id = t.idthread
            ORDER BY created_at DESC
            LIMIT 1
        ) m ON true
        WHERE t.user_id = $1 OR t.nextuser_id = $1
        ORDER BY m.created_at DESC NULLS LAST
    `;

    const result = await pool.query(query, [userId]);
    return result.rows;
}
}

export const messageService = new MessageService();
    