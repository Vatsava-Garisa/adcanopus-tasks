import "dotenv/config";
import * as jwt from 'jsonwebtoken';

const DEFAULT_JWT_EXPIRY = 60 * 60;
const JWT_EXPIRY = Number(process.env.JWT_ACCESS_TOKEN_EXPIRY_SECONDS ?? DEFAULT_JWT_EXPIRY);

export type AuthenticatedUser = {
    username: string;
};

export type JwtPayload = AuthenticatedUser & {
    sub: string;
    iat: number;
    exp: number;
};

function getJwtSecret() {
    const secret = process.env.JWT_SECRET;

    if (!secret || typeof secret !== "string") {
        throw new Error("JWT secret is not configured");
    }

    return secret;
}

/* Generate JWT Token */
export function generateJwt(username: string) {
    const secret = getJwtSecret();
    const token = jwt.sign(
        { username },
        secret,
        {
            algorithm: "HS256",
            subject: username,
            expiresIn: JWT_EXPIRY
        }
    );

    return {
        token,
        expiresIn: JWT_EXPIRY
    };
}

/* Verify JWT Token */
export function verifyJwt(token: string): JwtPayload {
    const secret = getJwtSecret();
    const payload = jwt.verify(token, secret, {
        algorithms: ["HS256"]
    });

    if (
        typeof payload === "string" ||
        typeof payload.username !== "string" ||
        typeof payload.sub !== "string" ||
        typeof payload.iat !== "number" ||
        typeof payload.exp !== "number"
    ) {
        throw new Error("Invalid token payload");
    }

    return {
        username: payload.username,
        sub: payload.sub,
        iat: payload.iat,
        exp: payload.exp
    };
}
