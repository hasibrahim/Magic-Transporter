import { Request, Response, NextFunction } from 'express';
import { HttpException } from '../exceptions/HttpException';
import { logger } from '../utils/logger';

export const errorMiddleware = (
    error: HttpException | Error,
    req: Request,
    res: Response,
    next: NextFunction,
): void => {
    try {
        if (error instanceof HttpException) {
            const status = error.status || 500;
            const message = error.message || 'Something went wrong';

            logger.error(`[${req.method}] ${req.path} >> StatusCode:: ${status}, Message:: ${message}`);

            res.status(status).json({
                success: false,
                status,
                message,
                ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
            });
        } else {
            logger.error(`[${req.method}] ${req.path} >> StatusCode:: 500, Message:: ${error.message}`, {
                stack: error.stack,
            });

            res.status(500).json({
                success: false,
                status: 500,
                message: error.message || 'Internal Server Error',
                ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
            });
        }
    } catch (err) {
        next(err);
    }
};

