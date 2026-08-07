import cors from 'cors';
import express from 'express';
import logger from './common/logger/logger.js';
import 'dotenv/config';

import { register, login, updateUserName } from './controllers/auth.controller.js';
import { getAllOffers, getUserOffers, createOffer } from './controllers/offer.controller.js';
import { authenticate } from './middleware/jwt-validate.js';
import { messageController } from './controllers/message.controller.js';

logger.info('Running application');

const app = express();

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.get('/api/v1/offers', getAllOffers);
app.post('/api/v1/register', register);
app.post('/api/v1/login', login);


app.patch('/api/v1/user/name', authenticate, updateUserName);
app.get('/api/v1/users/:userId/offers', authenticate, getUserOffers);
app.post('/api/v1/offers', authenticate, createOffer);


app.post('/api/v1/threads', authenticate, messageController.createThread.bind(messageController));
app.post('/api/v1/messages', authenticate, messageController.sendMessage.bind(messageController));
app.get('/api/v1/threads/:threadId/messages', authenticate, messageController.getMessages.bind(messageController));
app.get('/api/v1/threads/last-messages', authenticate, messageController.getThreadsWithLastMessage.bind(messageController));
app.delete('/api/v1/messages/:messageId', authenticate, messageController.deleteMessage.bind(messageController));

const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, () => {
    logger.info(`Server started on port ${PORT}`);
    logger.info(` CORS enabled`);
    logger.info(` GET  /api/v1/offers - Get all offers`);
    logger.info(` POST /api/v1/offers - Create offer (auth required)`);
    logger.info(` POST /api/v1/register - Register`);
    logger.info(` POST /api/v1/login - Login`);
});