import { injectable, inject } from 'tsyringe';
import { IMagicItem } from '../database/schemas/MagicItem.schema';
import { CreateMagicItemDto } from '../dtos/magicItem.dto';
import { MagicItemRepository } from '../database/repositories/MagicItem.repository';

@injectable()
export class MagicItemService {
    constructor(
        @inject(MagicItemRepository) private magicItemRepository: MagicItemRepository
    ) { }

    /**
     * Create a new Magic Item
     * @param data - Magic Item creation data
     * @returns Promise<IMagicItem> - The created Magic Item
     */
    async create(data: CreateMagicItemDto): Promise<IMagicItem> {
        return await this.magicItemRepository.create(data);
    }
}

