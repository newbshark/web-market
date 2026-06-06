import express from 'express';
import logger from './common/logger/logger.js';
import 'dotenv/config';
import { register } from './controllers/auth.controller.js';
import { login } from './controllers/auth.controller.js';
import { getAllOffers } from './controllers/offer.controller.js';

logger.info('Приложение запущено');

const app = express();


app.use(express.json());
app.use(express.urlencoded({extended: true}));


app.get('/offers', getAllOffers);
app.post('/register', register);
app.post('/login', login)


const PORT = process.env.PORT||8080;
app.listen(PORT,() => {
    console.log(`port ${PORT}`);

});