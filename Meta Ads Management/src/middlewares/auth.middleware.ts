import { type NextFunction, type Request, type Response } from 'express';

import { verifyJwt } from '../utils/jwt.js';

export const authenticateJwt = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || typeof authHeader !== "string") {
            return res.status(401).json({
                status: "Fail",
                message: "Authorization token is required"
            });
        }

        const [scheme, token, ...rest] = authHeader.split(" ");

        if (scheme !== "Bearer" || !token || rest.length > 0) {
            return res.status(401).json({
                status: "Fail",
                message: "Invalid authorization header format"
            });
        }

        const payload = verifyJwt(token);

        req.user = {
            username: payload.username
        };

        return next();
    } catch (error: any) {
        console.error("JWT authentication failed:", error?.response ?? error);

        return res.status(401).json({
            status: "Fail",
            message: "Invalid or expired token"
        });
    }
};
