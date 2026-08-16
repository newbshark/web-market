import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  console.log('=== AUTH MIDDLEWARE CALLED ===');
  console.log('Headers:', req.headers);

  const authHeader = req.headers.authorization;
  console.log('Auth Header:', authHeader);

  if (!authHeader) {
    console.log('No auth header!');
    return res.status(401).json({
      success: false,
      message: 'Authorization header required'
    });
  }

  const token = authHeader.split(' ')[1];
  console.log('Token:', token);

  if (!token) {
    console.log('No token!');
    return res.status(401).json({
      success: false,
      message: 'Token required'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
    console.log('Decoded token:', decoded);
    req.userId = (decoded as any).userId;
    console.log('UserId set to:', req.userId);
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
};