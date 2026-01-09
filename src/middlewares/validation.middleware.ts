import { plainToInstance } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import { Request, Response, NextFunction } from 'express';
import { ResponseUtil } from '../utils/response.util';

/**
 * Middleware to validate request body against a DTO class
 * @param type - The DTO class to validate against
 * @param skipMissingProperties - Whether to skip validation of missing properties (default: false)
 */
export const validationMiddleware = (
    type: any,
    skipMissingProperties = false,
) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Transform plain object to class instance
            const dto = plainToInstance(type, req.body);

            // Validate the DTO
            const errors: ValidationError[] = await validate(dto, {
                skipMissingProperties,
                whitelist: true, // Strip properties that don't have decorators
                forbidNonWhitelisted: false, // Don't throw error for extra properties
            });

            // If there are validation errors, return them
            if (errors.length > 0) {
                const message = errors
                    .map((error: ValidationError) => {
                        if (error.constraints) {
                            return Object.values(error.constraints);
                        }
                        return [];
                    })
                    .flat()
                    .join(', ');

                ResponseUtil.error(res, `Validation failed: ${message}`, 400);
                return;
            }

            // Replace req.body with validated DTO instance
            req.body = dto;
            next();
        } catch (error) {
            ResponseUtil.error(res, 'Validation error', 400);
        }
    };
};

