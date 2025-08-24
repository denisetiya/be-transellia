import type { Response } from "express";


export default class response {

    static created(
        res: Response, 
        data: Record<string, unknown> | Record<string, unknown>[] | null, 
        meta: Record<string, unknown> | null = null
    ) {
        res.status(201).json({
            success: true,
            message: "Created",
            data,
            meta
        });
    }

    static success(
        res: Response, 
        data: Record<string, unknown> | Record<string, unknown>[] | null, 
        message: string = "Success", 
        meta: Record<string, unknown> | null = null) {
        res.status(200).json({
            success: true,
            message,
            data,
            meta
        });
    }

    static badRequest(
        res: Response, 
        message: string = "Error",
        errorDetail: Record<string, unknown> | Record<string, unknown>[] | string | null = null, 
        meta: Record<string, unknown> | null = null) {
        res.status(400).json({
            success: false,
            message,
            errorDetail: errorDetail,
            meta
        });
    }

    static notFound(
        res: Response, 
        message: string = "Not Found", 
        meta: Record<string, unknown> | null = null) {
        res.status(404).json({
            success: false,
            message,
            meta
        });
    }

    static internalServerError(
        res: Response, 
        message: string = "Internal Server Error",
        errorDetail: Record<string, unknown> | Record<string, unknown>[] | string | null = null,
        meta: Record<string, unknown> | null = null) {
        res.status(500).json({
            success: false,
            message,
            errorDetail,
            meta
        });
    }

    static unauthorized(
        res: Response, 
        message: string = "Unauthorized", 
        meta: Record<string, unknown> | null = null) {
        res.status(401).json({
            success: false,
            message,
            meta
        });
    }

    static forbidden(
        res: Response, 
        message: string = "Forbidden", 
        meta: Record<string, unknown> | null = null) {
        res.status(403).json({
            success: false,
            message,
            meta
        });
    }

    static conflict(
        res: Response, 
        message: string = "Conflict", 
        meta: Record<string, unknown> | null = null) {
        res.status(409).json({
            success: false,
            message,
            meta
        });
    }
}
