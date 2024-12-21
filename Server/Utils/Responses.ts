import { Response } from "express";
import { ResponseObj } from "../Response";

export function sendErrorResponse(res: Response, status: number, message: string) {
    return res.status(status).json(<ResponseObj>{ error: true, message });
}