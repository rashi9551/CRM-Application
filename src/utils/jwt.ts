import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

declare global {
    namespace Express {
        interface Request {
            role?: string[];
            id:number;
            brandId:number
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
    const token = req.headers['authorization']?.split(' ')[1] || req.headers['authorization']    
    if (!token) {
        return res.status(403).json({ message: 'A token is required for authentication' });
    }

    const jwtSecretKey: string = process.env.SECRET_KEY || "Rashidd";

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
        req.id=+decoded.userId
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

export const isAdminOrBO = (req: Request, res: Response, next: NextFunction) => {
    // Log the roles for debugging
    console.log('User Roles:', req.role);
    
    // Check if the role includes 'ADMIN' or 'BO' (case-insensitive comparison)
    const hasAccess = req.role && 
                      (req.role.includes("ADMIN") || req.role.includes("BO"));

    if (!hasAccess) {
        return res.status(401).json({ message: 'Only an admin or a brand owner can perform this action' });
    }

    next();
};
// export const isAdminOrIsThatBrandOwner = (req: Request, res: Response, next: NextFunction) => {
//     // Check if the role includes 'ADMIN' or 'BO' (case-insensitive comparison)
//     if (!req.role || (!req.role.includes("ADMIN") && !req.role.includes("BO"))) {
//         return res.status(401).json({ message: 'Only an admin or a brand owner can perform this action' });
//     }

//     next();
// };
export const isPoAndToOrBo = (req: Request, res: Response, next: NextFunction) => {
    console.log(req.role, "=-=-=-=");

    // Check if the role includes 'ADMIN' or both 'TO' and 'PO'
    if (req.role && (req.role.includes("ADMIN") || req.role.includes("BO")||(req.role.includes("TO") && req.role.includes("PO")))) {
        // If the user has the correct role, proceed to the next middleware or route handler
        return next();
    }

    // If the user doesn't have the correct role, return a 401 error
    return res.status(401).json({ message: 'Only an admin or a user with both TO and PO roles can perform this action' });
};
export const isTo = (req: Request, res: Response, next: NextFunction) => {
    console.log(req.role, "=-=-=-=");

    // Check if the role includes 'ADMIN' or both 'TO' and 'PO'
    if (req.role && (req.role.includes("TO"))) {
        // If the user has the correct role, proceed to the next middleware or route handler
        return next();
    }

    // If the user doesn't have the correct role, return a 401 error
    return res.status(401).json({ message: 'Only a To can add the brand ownership' });
};


