import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
     if (!authHeader || typeof authHeader !== 'string') {
    return res.status(401).json({ message: 'Token not provided' });
  }

    const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Token abcent' });
  }

     const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {

    return res.status(500).json({ message: 'Internal server error' });
  }

      try {
    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};
