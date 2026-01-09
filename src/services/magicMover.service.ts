import { injectable, inject } from 'tsyringe';
import { IMagicMover } from '../database/schemas/MagicMover.schema';
import { CreateMagicMoverDto } from '../dtos/magicMover.dto';
import { MagicMoverRepository } from '../database/repositories/MagicMover.repository';
import { MagicItemRepository } from '../database/repositories/MagicItem.repository';
import { ActivityLogRepository } from '../database/repositories/ActivityLog.repository';
import { ActivityType, MagicMoverState } from '../enums';

@injectable()
export class MagicMoverService {
    constructor(
        @inject(MagicMoverRepository) private magicMoverRepository: MagicMoverRepository,
        @inject(MagicItemRepository) private magicItemRepository: MagicItemRepository,
        @inject(ActivityLogRepository) private activityLogRepository: ActivityLogRepository
    ) { }
    /**
     * Helper method to verify a Magic Mover exists
     * @param id - Magic Mover ID to verify
     * @returns Promise<IMagicMover> - The Magic Mover if found
     * @throws {Error} If mover not found
     */
    private async verifyMoverExists(id: string): Promise<IMagicMover> {
        const mover = await this.magicMoverRepository.findById(id);
        if (!mover) {
            throw new Error('Magic Mover not found');
        }
        return mover;
    }

    /**
     * Helper method to create activity log with consistent structure
     * @param moverId - Magic Mover ID
     * @param activityType - Type of activity being logged
     * @param previousState - Previous state before the activity
     * @param newState - New state after the activity
     * @param additionalDetails - Optional additional details to include in log
     * @returns Promise<void>
     */
    private async createActivityLog(
        moverId: string,
        activityType: ActivityType,
        previousState: string,
        newState: string,
        additionalDetails?: Record<string, any>
    ): Promise<void> {
        await this.activityLogRepository.create({
            moverId,
            activityType,
            details: {
                previousState,
                newState,
                ...additionalDetails,
            },
        });
    }

    /**
     * Helper method to validate all items exist in the database
     * @param itemIds - Array of item IDs to validate
     * @returns Promise<void>
     * @throws {Error} If any items are not found
     */
    private async validateItemsExist(itemIds: string[]): Promise<void> {
        const items = await this.magicItemRepository.findByIds(itemIds);
        if (items.length !== itemIds.length) {
            const foundItemIds = items.map(item => item._id.toString());
            const missingItemIds = itemIds.filter(itemId => !foundItemIds.includes(itemId));
            throw new Error(`Items not found: ${missingItemIds.join(', ')}`);
        }
    }

    /**
     * Helper method to calculate total weight of items
     * @param itemIds - Array of item IDs to calculate total weight for
     * @returns Promise<number> - Total weight of all items
     */
    private async calculateTotalWeight(itemIds: string[]): Promise<number> {
        const items = await this.magicItemRepository.findByIds(itemIds);
        return items.reduce((sum, item) => sum + item.weight, 0);
    }

    /**
     * Create a new Magic Mover
     * @param data - Magic Mover creation data
     * @returns Promise<IMagicMover> - The created Magic Mover
     */
    async create(data: CreateMagicMoverDto): Promise<IMagicMover> {
        return await this.magicMoverRepository.create(data);
    }

    /**
     * Find all Magic Movers
     * @returns Promise<IMagicMover[]> - List of all Magic Movers
     */
    async findAll(): Promise<IMagicMover[]> {
        return await this.magicMoverRepository.findAll();
    }

    /**
     * Load items onto a Magic Mover
     * Validates items exist, checks weight limits, updates state, and logs activity
     * @param id - Magic Mover ID
     * @param itemIds - Array of item IDs to load
     * @returns Promise<IMagicMover> - Updated Magic Mover with loaded items
     * @throws {Error} If Magic Mover not found, items not found, weight limit exceeded, or invalid state
     */
    async loadItems(id: string, itemIds: string[]): Promise<IMagicMover> {
        // 1. Verify the mover exists
        const mover = await this.verifyMoverExists(id);

        // 2. Verify all items exist in the database
        await this.validateItemsExist(itemIds);

        // 3. Calculate total weight of items
        const totalWeight = await this.calculateTotalWeight(itemIds);

        // 4. Store previous state for logging
        const previousState = mover.state;

        // 5. Load items onto the mover
        // Weight validation, duplicate checking, state validation, and optimistic locking
        // are all handled in the repository layer
        const updatedMover = await this.magicMoverRepository.loadItems(id, itemIds, totalWeight);

        if (!updatedMover) {
            throw new Error('Failed to load items onto Magic Mover');
        }

        // 6. Create activity log entry
        await this.createActivityLog(
            id,
            ActivityType.LOADING,
            previousState,
            updatedMover.state,
            {
                itemIds,
                itemCount: itemIds.length,
                totalWeight,
            }
        );

        return updatedMover;
    }

    /**
     * Start mission for a Magic Mover
     * Changes state from loading to on-mission and logs activity
     * @param id - Magic Mover ID
     * @returns Promise<IMagicMover> - Updated Magic Mover in on-mission state
     * @throws {Error} If Magic Mover not found or invalid state transition
     */
    async startMission(id: string): Promise<IMagicMover> {
        // 1. Verify the mover exists
        const mover = await this.verifyMoverExists(id);

        // 2. Store previous state for logging
        const previousState = mover.state;

        // 3. Start mission (validates state is loading and changes to on-mission)
        const updatedMover = await this.magicMoverRepository.startMission(id);

        if (!updatedMover) {
            throw new Error('Failed to start mission for Magic Mover');
        }

        // 4. Create activity log entry
        await this.createActivityLog(
            id,
            ActivityType.MISSION_STARTED,
            previousState,
            updatedMover.state,
            {
                itemCount: updatedMover.items.length,
                totalWeight: updatedMover.currentWeight,
            }
        );

        return updatedMover;
    }

    /**
     * End mission for a Magic Mover
     * Unloads all items, changes state to resting, increments completed missions, and logs activity
     * @param id - Magic Mover ID
     * @returns Promise<IMagicMover> - Updated Magic Mover with incremented mission count
     * @throws {Error} If Magic Mover not found or not on mission
     */
    async endMission(id: string): Promise<IMagicMover> {
        // 1. Verify the mover exists
        const mover = await this.verifyMoverExists(id);

        // Validate that mover is on mission
        if (mover.state !== MagicMoverState.ON_MISSION) {
            throw new Error('Magic Mover must be on mission to end a mission');
        }

        // 2. Store previous state and current data for logging
        const previousState = mover.state;
        const itemCount = mover.items.length;
        const totalWeight = mover.currentWeight;

        // 3. End mission (validates state is on-mission, unloads items, changes to resting, increments counter)
        const updatedMover = await this.magicMoverRepository.endMission(id);

        if (!updatedMover) {
            throw new Error('Failed to end mission for Magic Mover');
        }

        // 4. Create activity log entry
        await this.createActivityLog(
            id,
            ActivityType.MISSION_ENDED,
            previousState,
            updatedMover.state,
            {
                itemCount,
                totalWeight,
                completedMissions: updatedMover.completedMissions,
            }
        );

        return updatedMover;
    }

    /**
     * Unload items from a Magic Mover
     * Transitions from LOADING to RESTING without completing a mission
     * @param id - Magic Mover ID
     * @returns Promise<IMagicMover> - Updated Magic Mover with unloaded items
     * @throws {Error} If Magic Mover not found or invalid state transition
     */
    async unloadItems(id: string): Promise<IMagicMover> {
        // 1. Verify the mover exists
        const mover = await this.verifyMoverExists(id);

        // 2. Store previous state and current data for logging
        const previousState = mover.state;
        const itemCount = mover.items.length;
        const totalWeight = mover.currentWeight;

        // 3. Unload items (validates state transition, clears items)
        const updatedMover = await this.magicMoverRepository.unloadItems(id);

        if (!updatedMover) {
            throw new Error('Failed to unload items from Magic Mover');
        }

        // 4. Create activity log entry
        await this.createActivityLog(
            id,
            ActivityType.UNLOADING,
            previousState,
            updatedMover.state,
            {
                itemCount,
                totalWeight,
            }
        );

        return updatedMover;
    }

    /**
     * Get top performers by completed missions
     * Returns Magic Movers ordered by completedMissions in descending order
     * @param itemId - Optional item ID to filter by missions completed with specific item
     * @returns Promise<IMagicMover[]> - List of Magic Movers sorted by performance
     */
    async getTopPerformers(itemId?: string): Promise<IMagicMover[]> {
        return await this.magicMoverRepository.getTopPerformers(itemId);
    }
}
