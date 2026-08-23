console.log('=== MAIN.TS LOADED ==='); import cors from 'cors';
import express from 'express';
import logger from './common/logger/logger.js';
import 'dotenv/config';

import { register, login } from './controllers/auth.controller.js';
import {
    getAllOffers,
    getUserOffers,
    createOffer,
    completeOffer,
    getFinishedOffers
} from './controllers/offer.controller.js';
import { authenticate } from './middleware/jwt-validate.js';
import { messageController } from './controllers/message.controller.js';
import { userController } from './controllers/user.controller.js';

logger.info('🚀 Running application');

const app = express();


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

app.get('/api/v1/offers', getAllOffers);
app.post('/api/v1/register', register);
app.post('/api/v1/login', login);


app.patch('/api/v1/user/name', authenticate, userController.updateUserName.bind(userController));
app.get('/api/v1/users/:userId/offers', authenticate, getUserOffers);
app.post('/api/v1/offers', authenticate, createOffer);

app.post('/api/v1/offers/complete/:offer_id', authenticate, completeOffer);
app.get('/api/v1/finished-offers/:userId', authenticate, getFinishedOffers);


app.post('/api/v1/threads', authenticate, messageController.createThread.bind(messageController));
app.post('/api/v1/messages', authenticate, messageController.sendMessage.bind(messageController));
app.get('/api/v1/threads/:threadId/messages', authenticate, messageController.getMessages.bind(messageController));
app.get('/api/v1/threads/last-messages', authenticate, messageController.getThreadsWithLastMessage.bind(messageController));
app.delete('/api/v1/messages/:messageId', authenticate, messageController.deleteMessage.bind(messageController));


app.get('/api/v1/users/me', authenticate, userController.getMe.bind(userController));
app.get('/api/v1/users', authenticate, userController.getAllUsers.bind(userController));


app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.method} ${req.path} not found`
    });
});


app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    logger.error('Unhandled error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error'
    });
});

const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, () => {
    logger.info(`🚀 Server started on port ${PORT}`);
    logger.info(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.info(`🌐 CORS enabled`);
    logger.info(`📋 Available routes:`);
    logger.info(`   GET  /health - Health check`);
    logger.info(`   GET  /api/v1/offers - Get all offers`);
    logger.info(`   POST /api/v1/offers - Create offer (auth required)`);
    logger.info(`   POST /api/v1/offers/complete/:offer_id - Complete offer (auth required)`);  // ← ДОБАВИТЬ
    logger.info(`   GET  /api/v1/finished-offers/:userId - Get finished offers (auth required)`); // ← ДОБАВИТЬ
    logger.info(`   POST /api/v1/register - Register`);
    logger.info(`   POST /api/v1/login - Login`);
    logger.info(`   PATCH /api/v1/user/name - Update user name (auth required)`);
    logger.info(`   GET  /api/v1/users/me - Get current user (auth required)`);
    logger.info(`   GET  /api/v1/users/:userId/offers - Get user offers (auth required)`);
    logger.info(`   POST /api/v1/threads - Create thread (auth required)`);
    logger.info(`   POST /api/v1/messages - Send message (auth required)`);
    logger.info(`   GET  /api/v1/threads/:threadId/messages - Get messages (auth required)`);
    logger.info(`   GET  /api/v1/threads/last-messages - Get threads with last messages (auth required)`);
    logger.info(`   DELETE /api/v1/messages/:messageId - Delete message (auth required)`);
});
