import { Request, Response, NextFunction } from "express";
import { getUserIdFromToken } from '../utils/jwt-helper.js';


export async function jwtValidationMiddleware(req: Request,
                                              res: Response,
                                              next: NextFunction) {
    const headers = req.headers;
    const accessToken = headers.authorization;
    const userId = accessToken ? getUserIdFromToken(accessToken) : null;

    if (!userId) {
        res.status(401).send({
            message: 'Authentication failed your token is invalid or missing',
            statusCode: 401,
        });
    } else {
        req.user = {
            id: userId,
        };
        next();
    }
}