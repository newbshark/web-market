import jwt, { JwtPayload } from 'jsonwebtoken';

export function getUserIdFromToken(token: string): number | null {
  try {
    const accessToken = token.split(' ')[1];
    if (!accessToken) return null;
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) return null;
    const decoded = jwt.verify(accessToken, jwtSecret) as JwtPayload;
    return decoded.userId;
  } catch {
    return null;
  }
}