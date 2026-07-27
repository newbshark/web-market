import express from 'express';
import logger from './common/logger/logger.js';
import 'dotenv/config';

import { register, login, updateUserName } from './controllers/auth.controller.js';
import { getAllOffers, getUserOffers } from './controllers/offer.controller.js';
import { authenticate } from './middleware/jwt-validate.js';
import { messageController } from './controllers/message.controller.js';

logger.info('Running application');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.get('/offers', getAllOffers);
app.post('/register', register);
app.post('/login', login);
app.patch('/user/name', authenticate, updateUserName);
app.get('/api/users/:userId/offers', getUserOffers);


app.post('/threads', authenticate, messageController.createThread.bind(messageController));
app.post('/messages', authenticate, messageController.sendMessage.bind(messageController));
app.get('/threads', authenticate, messageController.getUserThreads.bind(messageController));
app.get('/threads/:threadId/messages', authenticate, messageController.getMessages.bind(messageController));

const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, () => {
    logger.info(`Server started on port ${PORT}`);
});