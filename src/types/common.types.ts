import { Request } from 'express';

export interface RequestWithUser extends Request {
    user?: {
        id: string;
        email?: string;
        [key: string]: any;
    };
}

export interface PaginationQuery {
    page?: string;
    limit?: string;
    sort?: string;
    order?: 'asc' | 'desc';
}

export interface PaginationOptions {
    page: number;
    limit: number;
    skip: number;
    sort?: { [key: string]: 1 | -1 };
}

export interface ServiceResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    error?: Error;
}

