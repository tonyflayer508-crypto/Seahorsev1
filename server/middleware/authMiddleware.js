import jwt from "jsonwebtoken";

function getJwtSecret() {
    const secret = process.env.JWT_SECRET?.trim();

    if (!secret) {
        throw new Error("JWT_SECRET is not configured");
    }

    return secret;
}

export function authMiddleware(req, res, next) {
    const token = req.cookies?.token;

    if(!token) {
       return res.status(401).json({ error: "Access denied. No  session token provided" });
        
    }

    try {
        const decoded = jwt.verify(token, getJwtSecret());
        req.user = decoded;
        next();
    } catch (error) {
       return res.status(401).json({ error: "Session expired or invalid. Please log in again." });
    }
}