import jwt from "jsonwebtoken";
import { JWT_SECRET } from "..";
import { NextFunction, Request, Response } from "express";

export function adminMiddleware(req: Request, res: Response, next: NextFunction) {
    const headerToken = req.headers.authorization;
    const token = headerToken?.split(" ")[1];
    if (!token) {
        res.status(403).json({ msgL: "Unauthorized" });
        return;
    }

    try {
        // verify jwt
        const decode = jwt.verify(token, JWT_SECRET) as { role: string, userId: string };
        if (decode.role != "Admin") {
            res.status(403).json({ msg: "Unauthorized" });
            return;
        }
        req.userId = decode.userId;
        next();
    } catch (e) {
        res.status(403).json({ msg: "Unauthorized" });
        return;
    }
}