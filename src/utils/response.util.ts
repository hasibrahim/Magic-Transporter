import { Response } from 'express';

export interface ApiResponse<T = any> {
    success: boolean;
    status: number;
    message: string;
    data?: T;
    meta?: {
        page?: number;
        limit?: number;
        total?: number;
        totalPages?: number;
    };
}

export class ResponseUtil {
    /**
     * Send a success response
     * @param res - Express response object
     * @param message - Success message
     * @param data - Optional response data
     * @param status - HTTP status code (default: 200)
     * @param meta - Optional metadata for pagination
     * @returns Response - Express response with JSON body
     */
    public static success<T>(
        res: Response,
        message: string = 'Success',
        data?: T,
        status: number = 200,
        meta?: ApiResponse['meta'],
    ): Response<ApiResponse<T>> {
        const response: ApiResponse<T> = {
            success: true,
            status,
            message,
            ...(data !== undefined && { data }),
            ...(meta && { meta }),
        };
        return res.status(status).json(response);
    }

    /**
     * Send a created (201) response
     * @param res - Express response object
     * @param message - Success message
     * @param data - Optional response data
     * @returns Response - Express response with JSON body
     */
    public static created<T>(
        res: Response,
        message: string = 'Created successfully',
        data?: T,
    ): Response<ApiResponse<T>> {
        return ResponseUtil.success(res, message, data, 201);
    }

    /**
     * Send an error response
     * @param res - Express response object
     * @param message - Error message
     * @param status - HTTP status code (default: 500)
     * @returns Response - Express response with JSON body
     */
    public static error(
        res: Response,
        message: string = 'An error occurred',
        status: number = 500,
    ): Response<ApiResponse> {
        const response: ApiResponse = {
            success: false,
            status,
            message,
        };
        return res.status(status).json(response);
    }

    /**
     * Send a paginated response
     * @param res - Express response object
     * @param message - Success message
     * @param data - Array of data items
     * @param page - Current page number
     * @param limit - Items per page
     * @param total - Total number of items
     * @returns Response - Express response with JSON body including pagination metadata
     */
    public static paginated<T>(
        res: Response,
        message: string = 'Success',
        data: T[],
        page: number,
        limit: number,
        total: number,
    ): Response<ApiResponse<T[]>> {
        const totalPages = Math.ceil(total / limit);
        const meta = {
            page,
            limit,
            total,
            totalPages,
        };
        return ResponseUtil.success(res, message, data, 200, meta);
    }
}

