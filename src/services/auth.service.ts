import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Pool } from 'pg';

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5234'),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'web_market',
});

export class AuthService {
    
    async register(name:string, password:string, email:string){
        const existingUser = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );
        if (existingUser.rows.length > 0) {
            throw new Error ("Пользователь с таким email уже существует");
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
    console.log('newUser:', newUser); 
    return{
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

