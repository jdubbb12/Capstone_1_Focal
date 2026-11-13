/*

auth-mw.ts
Middleware that deals with proper authentication checks from the client to the server.

*/

import jsonWT from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error("No JWT_SECRET detected!");
}

// Essentially, we have to modified the Request handler from Express for an easier time getting/setting the userID.
export interface AuthRequest extends Request {
    user?: {
        userID: number;
    };
}

export const authToken = (req: AuthRequest, res: Response, next: NextFunction) => {
    // Format "Bearer <token>" The frontend MUST send the user token like this.
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith("Bearer") // If it starts with Bearer, we then split the string for the token, if for some reason that's false is undefined and we return 401.
        ? authHeader.split(" ")[1]
        : undefined;

    if (!token) {
        return res.status(401).json({ error: "Invalid token provided." })
    }

    try {
        const decodedToken = jsonWT.verify(token, JWT_SECRET) as { userID: number }; //Verifying the token given to us by using the ENV value and then moving on.
        req.user = decodedToken;
        next();
    }
    catch (err: any) {
        console.log(err);
        return res.status(403).json({ error: "Invalid or expired token." })
    }
}