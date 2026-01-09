import { Request } from 'express';
import { PaginationOptions, PaginationQuery } from '../types';

/**
 * Extract and validate pagination options from Express request
 * @param req - Express request object containing query parameters
 * @returns PaginationOptions - Validated pagination options with page, limit, skip, and sort
 */
export const getPaginationOptions = (req: Request): PaginationOptions => {
    const query = req.query as PaginationQuery;
    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '10', 10);
    const skip = (page - 1) * limit;

    const sortField = query.sort || 'createdAt';
    const sortOrder = query.order === 'asc' ? 1 : -1;

    return {
        page: Math.max(1, page),
        limit: Math.min(100, Math.max(1, limit)), // Cap at 100 items per page
        skip,
        sort: {
            [sortField]: sortOrder,
        },
    };
};

