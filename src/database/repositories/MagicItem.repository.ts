import { singleton } from 'tsyringe';
import { MagicItemModel, IMagicItem } from '../schemas/MagicItem.schema';

@singleton()
export class MagicItemRepository {
    /**
     * Create a new MagicItem
     * @param data - Partial Magic Item data
     * @returns Promise<IMagicItem> - The created Magic Item
     */
    async create(data: Partial<IMagicItem>): Promise<IMagicItem> {
        const magicItem = new MagicItemModel(data);
        // @ts-ignore - Mongoose save() return type is too complex
        return await magicItem.save();
    }

    /**
     * Find MagicItems by an array of IDs
     * @param ids - Array of Magic Item IDs
     * @returns Promise<IMagicItem[]> - List of found Magic Items
     */
    async findByIds(ids: string[]): Promise<IMagicItem[]> {
        // @ts-ignore - Mongoose exec() return type is too complex
        return await MagicItemModel.find({ _id: { $in: ids } }).exec();
    }

    /**
     * Find MagicItem by ID
     * @param id - Magic Item ID
     * @returns Promise<IMagicItem | null> - The Magic Item or null if not found
     */
    async findById(id: string): Promise<IMagicItem | null> {
        // @ts-ignore - Mongoose exec() return type is too complex
        return await MagicItemModel.findById(id).exec();
    }
}

