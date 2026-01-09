import { injectable, inject } from 'tsyringe';
import { Request, Response, NextFunction } from 'express';
import { MagicItemService } from '../services/magicItem.service';
import { ResponseUtil } from '../utils/response.util';
import { CreateMagicItemDto } from '../dtos/magicItem.dto';

@injectable()
export class MagicItemController {
    constructor(
        @inject(MagicItemService) private magicItemService: MagicItemService
    ) { }

    /**
     * Create a new Magic Item
     * @param req - Express request object containing Magic Item data in body
     * @param res - Express response object
     * @param next - Express next function
     * @returns Promise<void> - Sends JSON response with created Magic Item
     */
    public create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const magicItemData: CreateMagicItemDto = req.body;

            // Create the magic item (validation is handled by middleware)
            const magicItem = await this.magicItemService.create(magicItemData);

            // Return success response
            ResponseUtil.created(res, 'Magic Item created successfully', magicItem);
        } catch (error) {
            if (error instanceof Error) {
                ResponseUtil.error(res, error.message, 500);
            } else {
                ResponseUtil.error(res, 'Failed to create Magic Item', 500);
            }
        }
    };
}

