import express from 'express';
import logger from './common/logger/logger.js';
import 'dotenv/config';
import { register, login, updateUserName } from './controllers/auth.controller.js';
import { getAllOffers, getUserOffers } from './controllers/offer.controller.js';
import { authenticate } from './middleware/jwt-validate.js';

logger.info('Running application');

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.get('/offers', getAllOffers);
app.post('/register', register);
app.post('/login', login);
app.patch('/user/name', authenticate, updateUserName);
app.get('/api/users/:userId/offers', authenticate, getUserOffers);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`port ${PORT}`);
});