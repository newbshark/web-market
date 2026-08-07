
import { getPool } from '../common/database.js';
import logger from '../common/logger/logger.js';
import { configService } from '../common/config/config.service.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export class AuthService {
    private pool = getPool();

    async register(name: string, email: string, password: string) {
        try {

            const existingUser = await this.pool.query(
                'SELECT id FROM users WHERE email = $1',
                [email]
            );

            if (existingUser.rows.length > 0) {
                throw new Error('User with this email already exists');
            }


            const hashedPassword = await bcrypt.hash(password, 10);


            const result = await this.pool.query(
                `INSERT INTO users (name, email, password, role)
                 VALUES ($1, $2, $3, 'customer')
                 RETURNING id, name, email, role, created_at`,
                [name, email, hashedPassword]
            );

            const newUser = result.rows[0];


            const token = jwt.sign(
                { userId: newUser.id, email: newUser.email },
                configService.jwtSecret,
                { expiresIn: '7d' }
            );

            return {
                user: {
                    id: newUser.id,
                    name: newUser.name,
                    email: newUser.email,
                    role: newUser.role,
                },
                token,
            };
        } catch (error) {
            logger.error('AuthService.register error:', error);
            throw error;
        }
    }

    async login(email: string, password: string) {
        try {

            const result = await this.pool.query(
                'SELECT id, name, email, password, role FROM users WHERE email = $1',
                [email]
            );

            if (result.rows.length === 0) {
                throw new Error('Invalid email or password');
            }

            const user = result.rows[0];


            const isValid = await bcrypt.compare(password, user.password);
            if (!isValid) {
                throw new Error('Invalid email or password');
            }


            const token = jwt.sign(
                { userId: user.id, email: user.email },
                configService.jwtSecret,
                { expiresIn: '7d' }
            );

            return {
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
                accessToken: token,
            };
        } catch (error) {
            logger.error('AuthService.login error:', error);
            throw error;
        }
    }
}