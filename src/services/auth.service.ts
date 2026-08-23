import { getKnex } from '../common/database/knex.js';
import logger from '../common/logger/logger.js';
import { configService } from '../common/config/config.service.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export class AuthService {
    private knex = getKnex();

    async register(name: string, email: string, password: string) {
        try {

            const existingUser = await this.knex('users')
                .where('email', email)
                .first();

            if (existingUser) {
                throw new Error('User with this email already exists');
            }

            const hashedPassword = await bcrypt.hash(password, 10);


            const [newUser] = await this.knex('users')
                .insert({
                    name: name,
                    email: email,
                    password: hashedPassword,
                    role: 'customer'
                })
                .returning(['id', 'name', 'email', 'role', 'created_at']);


            const token = jwt.sign(
                { userId: newUser.id, email: newUser.email },
                configService.jwtSecret,
                { expiresIn: '7d' }
            );

            logger.info(`User registered: ${email}`);

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

            const user = await this.knex('users')
                .where('email', email)
                .first();

            if (!user) {
                throw new Error('Invalid email or password');
            }


            const isValid = await bcrypt.compare(password, user.password);
            if (!isValid) {
                throw new Error('Invalid email or password');
            }


            const token = jwt.sign(
                { userId: user.id, email: user.email },
                configService.jwtSecret,
                { expiresIn: '7d' }
            );

            logger.info(`User logged in: ${email}`);

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

    async updateUserName(userId: number, name: string) {
        try {
            const [updatedUser] = await this.knex('users')
                .where('id', userId)
                .update({ name: name })
                .returning(['id', 'name', 'email', 'role']);

            if (!updatedUser) {
                throw new Error('User not found');
            }

            logger.info(`User ${userId} updated name to ${name}`);
            return updatedUser;
        } catch (error) {
            logger.error('AuthService.updateUserName error:', error);
            throw error;
        }
    }
}