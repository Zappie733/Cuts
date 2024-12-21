import { Request } from "express";

export function getAccessTokenFromHeader(req: Request): string | null {
    const authHeader = req.headers.authorization;
    return authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : null;
}