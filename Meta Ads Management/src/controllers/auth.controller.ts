import { type NextFunction, type Request, type Response } from 'express';

import { generateJwt } from '../utils/jwt.js';

/* To Generate JWT Token */
// Authentication and Refresh Tokens will be introduced when DB is introduced.
export const generateToken = async (
    req: Request,
    res: Response,
    _: NextFunction
) => {
    try {
        let { username } = req.body;

        if (!username || typeof username !== "string") {
            return res.status(400).json({
                status: "Fail",
                message: "Invalid username"
            });
        }

        username = username.trim();

        if (!username) {
            return res.status(400).json({
                status: "Fail",
                message: "Invalid username"
            });
        }

        const { token, expiresIn } = generateJwt(username);

        return res.status(200).json({
            status: "Success",
            message: "Token generated successfully",
            data: {
                token,
                expiresIn
            }
        });
    } catch (error: any) {
        console.error("Error generating auth token:", error?.response ?? error);

        return res.status(500).json({
            status: "Fail",
            message: "Error while generating token, please try later"
        });
    }
};
