import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
     if (!authHeader || typeof authHeader !== 'string') {
    return res.status(401).json({ message: 'Токен не предоставлен или неверный формат' });
  }

    const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Токен отсутствует' });
  }

     const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    console.error('JWT_SECRET is not defined');
    return res.status(500).json({ message: 'Внутренняя ошибка сервера' });
  }

      try {
    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Недействительный или просроченный токен' });
  }
};