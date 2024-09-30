import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

declare global {
    namespace Express {
        interface Request {
            role?: string[];
        }
    }
}


export const createToken = async (userId: string, roles: string[], expire: string): Promise<string> => {
    try {
        const jwtSecretKey: string | undefined = process.env.SECRET_KEY || "Rashid";
        const payload = { userId, roles };
        const token = jwt.sign(payload, jwtSecretKey, { expiresIn: expire });
        return token;
    } catch (error) {
        console.error("Error creating token:", error);
        throw new Error("Something went wrong while creating the token");
    }
};



export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(403).json({ message: 'A token is required for authentication' });
    }

    const jwtSecretKey: string = process.env.SECRET_KEY || "Rashid";

    jwt.verify(token, jwtSecretKey, (err, decoded: { userId: string; roles: string[] }) => {
        if (err) {
            if (err.name === 'JsonWebTokenError') {
                return res.status(401).json({ success: false, message: 'Invalid token provided' });
            } else if (err.name === 'TokenExpiredError') {
                return res.status(401).json({ success: false, message: 'Token has expired' });
            } else {
                console.error("JWT verification error:", err);
                return res.status(500).json({ success: false, message: 'An error occurred during token verification' });
            }
        }

        // Ensure that the token has valid roles
        if (!decoded.roles || !Array.isArray(decoded.roles)) {
            return res.status(403).json({ success: false, message: 'Invalid role data in token' });
        }

        req.role = decoded.roles;
        next();
    });
};

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
    // Check if the role includes 'ADMIN' (case-insensitive comparison)
    if (!req.role || !req.role.includes("ADMIN")) {
        return res.status(401).json({ message: 'Only an admin can perform this action' });
    }

    next();
};

