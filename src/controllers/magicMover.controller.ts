import { injectable, inject } from 'tsyringe';
import { Request, Response, NextFunction } from 'express';
import { MagicMoverService } from '../services/magicMover.service';
import { ResponseUtil } from '../utils/response.util';
import { CreateMagicMoverDto } from '../dtos/magicMover.dto';

@injectable()
export class MagicMoverController {
    constructor(
        @inject(MagicMoverService) private magicMoverService: MagicMoverService
    ) { }
    /**
     * Create a new Magic Mover
     * @param req - Express request object containing Magic Mover data in body
     * @param res - Express response object
     * @param next - Express next function
     * @returns Promise<void> - Sends JSON response with created Magic Mover
     */
    public create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const magicMoverData: CreateMagicMoverDto = req.body;

            // Create the magic mover (validation is handled by middleware)
            const magicMover = await this.magicMoverService.create(magicMoverData);

            // Return success response
            ResponseUtil.created(res, 'Magic Mover created successfully', magicMover);
        } catch (error) {
            if (error instanceof Error) {
                ResponseUtil.error(res, error.message, 500);
            } else {
                ResponseUtil.error(res, 'Failed to create Magic Mover', 500);
            }
        }
    };

    /**
     * Get all Magic Movers
     * @param req - Express request object
     * @param res - Express response object
     * @param next - Express next function
     * @returns Promise<void> - Sends JSON response with list of Magic Movers
     */
    public findAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const magicMovers = await this.magicMoverService.findAll();
            ResponseUtil.success(res, 'Magic Movers retrieved successfully', magicMovers);
        } catch (error) {
            if (error instanceof Error) {
                ResponseUtil.error(res, error.message, 500);
            } else {
                ResponseUtil.error(res, 'Failed to retrieve Magic Movers', 500);
            }
        }
    };


    /**
     * Load items onto a Magic Mover
     * @param req - Express request object with Magic Mover ID in params and itemIds array in body
     * @param res - Express response object
     * @param next - Express next function
     * @returns Promise<void> - Sends JSON response with updated Magic Mover
     * @throws {400} - If itemIds is not a valid non-empty array
     * @throws {404} - If Magic Mover not found
     */
    public load = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;
            const { itemIds } = req.body;

            // Validate itemIds array
            if (!itemIds || !Array.isArray(itemIds) || itemIds.length === 0) {
                ResponseUtil.error(res, 'itemIds must be a non-empty array', 400);
                return;
            }

            // Load items onto the magic mover
            const magicMover = await this.magicMoverService.loadItems(id, itemIds);

            ResponseUtil.success(res, 'Items loaded successfully', magicMover);
        } catch (error) {
            if (error instanceof Error) {
                // Check for specific error types
                if (error.message.includes('not found')) {
                    ResponseUtil.error(res, error.message, 404);
                } else if (error.message.includes('Weight limit exceeded') ||
                    error.message.includes('Invalid state transition') ||
                    error.message.includes('Duplicate items')) {
                    ResponseUtil.error(res, error.message, 400);
                } else if (error.message.includes('Concurrent modification')) {
                    ResponseUtil.error(res, error.message, 409); // Conflict
                } else {
                    ResponseUtil.error(res, error.message, 500);
                }
            } else {
                ResponseUtil.error(res, 'Failed to load items', 500);
            }
        }
    };

    /**
     * Start mission for a Magic Mover
     * @param req - Express request object with Magic Mover ID in params
     * @param res - Express response object
     * @param next - Express next function
     * @returns Promise<void> - Sends JSON response with updated Magic Mover
     * @throws {404} - If Magic Mover not found
     * @throws {400} - If invalid state transition
     */
    public startMission = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;

            // Start mission for the magic mover
            const magicMover = await this.magicMoverService.startMission(id);

            ResponseUtil.success(res, 'Mission started successfully', magicMover);
        } catch (error) {
            if (error instanceof Error) {
                // Check for specific error types
                if (error.message.includes('not found')) {
                    ResponseUtil.error(res, error.message, 404);
                } else if (error.message.includes('Invalid state transition')) {
                    ResponseUtil.error(res, error.message, 400);
                } else if (error.message.includes('Concurrent modification')) {
                    ResponseUtil.error(res, error.message, 409); // Conflict
                } else {
                    ResponseUtil.error(res, error.message, 500);
                }
            } else {
                ResponseUtil.error(res, 'Failed to start mission', 500);
            }
        }
    };

    /**
     * End mission for a Magic Mover
     * @param req - Express request object with Magic Mover ID in params
     * @param res - Express response object
     * @param next - Express next function
     * @returns Promise<void> - Sends JSON response with updated Magic Mover
     * @throws {404} - If Magic Mover not found
     * @throws {400} - If invalid state transition
     */
    public endMission = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;

            // End mission for the magic mover
            const magicMover = await this.magicMoverService.endMission(id);

            ResponseUtil.success(res, 'Mission ended successfully', magicMover);
        } catch (error) {
            if (error instanceof Error) {
                // Check for specific error types
                if (error.message.includes('not found')) {
                    ResponseUtil.error(res, error.message, 404);
                } else if (error.message.includes('Invalid state transition')) {
                    ResponseUtil.error(res, error.message, 400);
                } else if (error.message.includes('Concurrent modification')) {
                    ResponseUtil.error(res, error.message, 409); // Conflict
                } else {
                    ResponseUtil.error(res, error.message, 500);
                }
            } else {
                ResponseUtil.error(res, 'Failed to end mission', 500);
            }
        }
    };

    /**
     * Unload items from a Magic Mover (Issue 2.2)
     * @param req - Express request object with Magic Mover ID in params
     * @param res - Express response object
     * @param next - Express next function
     * @returns Promise<void> - Sends JSON response with updated Magic Mover
     * @throws {404} - If Magic Mover not found
     * @throws {400} - If invalid state transition
     */
    public unload = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;

            // Unload items from the magic mover
            const magicMover = await this.magicMoverService.unloadItems(id);

            ResponseUtil.success(res, 'Items unloaded successfully', magicMover);
        } catch (error) {
            if (error instanceof Error) {
                // Check for specific error types
                if (error.message.includes('not found')) {
                    ResponseUtil.error(res, error.message, 404);
                } else if (error.message.includes('Invalid state transition')) {
                    ResponseUtil.error(res, error.message, 400);
                } else if (error.message.includes('Concurrent modification')) {
                    ResponseUtil.error(res, error.message, 409); // Conflict
                } else {
                    ResponseUtil.error(res, error.message, 500);
                }
            } else {
                ResponseUtil.error(res, 'Failed to unload items', 500);
            }
        }
    };

    /**
     * Get top performers by completed missions
     * @param req - Express request object with optional itemId query parameter
     * @param res - Express response object
     * @param next - Express next function
     * @returns Promise<void> - Sends JSON response with list of top performing Magic Movers
     */
    public getTopPerformers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { itemId } = req.query;
            const topPerformers = await this.magicMoverService.getTopPerformers(itemId as string | undefined);
            ResponseUtil.success(res, 'Top performers retrieved successfully', topPerformers);
        } catch (error) {
            if (error instanceof Error) {
                ResponseUtil.error(res, error.message, 500);
            } else {
                ResponseUtil.error(res, 'Failed to retrieve top performers', 500);
            }
        }
    };
}
