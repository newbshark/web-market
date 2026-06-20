import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Pool } from 'pg';
import { configService } from '../common/config/config.service.js';

const pool = new Pool({
    host: configService.dbHost,
    port: configService.dbPort,
    user: configService.dbUser,
    password: configService.dbPassword,
    database: configService.dbName,
});

export class AuthService {
    async register(name: string, password: string, email: string) {
        const existingUser = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );
        if (existingUser.rows.length > 0) {
            throw new Error("Пользователь с таким email уже существует");
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await pool.query(
            'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email',
            [name, email, hashedPassword]
        );
        const token = jwt.sign(
            { userId: newUser.rows[0].id, email: email },
            process.env.JWT_SECRET || 'secret_key',
            { expiresIn: '7d' }
        );

        return {
            success: true,
            user: newUser.rows[0],
            token
        }
    };

    async login(email: string, password: string) {
        const userFromDb = await pool.query(
            'SELECT id, email, password FROM users WHERE email = $1',
            [email]
        );

        if (userFromDb.rows.length === 0) {
            throw new Error('Invalid email or password');
        }

        const isValid = await bcrypt.compare(password, userFromDb.rows[0].password);
        if (!isValid) {
            throw new Error('Invalid email or password');
        }

        const payload = { userId: userFromDb.rows[0].id };
        const accessToken = jwt.sign(
            payload,
            process.env.JWT_SECRET || 'secret_key',
            { expiresIn: '4h' }
        );

        return {
            success: true,
            accessToken
        }
    };
}

