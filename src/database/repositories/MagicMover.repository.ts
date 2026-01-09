import { singleton } from 'tsyringe';
import { MagicMoverModel, IMagicMover } from '../schemas/MagicMover.schema';
import { MagicMoverState } from '../../enums';
import { MagicMoverStateMachine } from '../../utils/stateMachine.util';

@singleton()
export class MagicMoverRepository {
    /**
     * Create a new MagicMover
     * @param data - Partial Magic Mover data
     * @returns Promise<IMagicMover> - The created Magic Mover
     */
    async create(data: Partial<IMagicMover>): Promise<IMagicMover> {
        const magicMover = new MagicMoverModel(data);
        // @ts-ignore - Mongoose save() return type is too complex
        return await magicMover.save();
    }

    /**
     * Find MagicMover by ID
     * @param id - Magic Mover ID
     * @returns Promise<IMagicMover | null> - The Magic Mover or null if not found
     */
    async findById(id: string): Promise<IMagicMover | null> {
        // @ts-ignore - Mongoose exec() return type is too complex
        return await MagicMoverModel.findById(id).exec();
    }

    /**
     * Find all MagicMovers
     * @returns Promise<IMagicMover[]> - List of all Magic Movers
     */
    async findAll(): Promise<IMagicMover[]> {
        // @ts-ignore - Mongoose exec() return type is too complex
        return await MagicMoverModel.find({}).exec();
    }

    /**
     * Find MagicMovers by state
     * @param state - The state to filter by
     * @returns Promise<IMagicMover[]> - List of Magic Movers in the specified state
     */
    async findByState(state: MagicMoverState): Promise<IMagicMover[]> {
        // @ts-ignore - Mongoose exec() return type is too complex
        return await MagicMoverModel.find({ state }).exec();
    }

    /**
     * Find MagicMover by name
     * @param name - Magic Mover name
     * @returns Promise<IMagicMover | null> - The Magic Mover or null if not found
     */
    async findByName(name: string): Promise<IMagicMover | null> {
        // @ts-ignore - Mongoose exec() return type is too complex
        return await MagicMoverModel.findOne({ name }).exec();
    }

    /**
     * Update MagicMover by ID
     * @param id - Magic Mover ID
     * @param data - Partial Magic Mover data to update
     * @returns Promise<IMagicMover | null> - The updated Magic Mover or null if not found
     */
    async updateById(id: string, data: Partial<IMagicMover>): Promise<IMagicMover | null> {
        // @ts-ignore - Mongoose exec() return type is too complex
        return await MagicMoverModel.findByIdAndUpdate(id, data, { new: true, runValidators: true }).exec();
    }

    /**
     * Delete MagicMover by ID
     * @param id - Magic Mover ID
     * @returns Promise<boolean> - True if deleted, false otherwise
     */
    async deleteById(id: string): Promise<boolean> {
        const result = await MagicMoverModel.findByIdAndDelete(id).exec();
        return !!result;
    }

    /**
     * Update MagicMover state
     * @param id - Magic Mover ID
     * @param state - New state to set
     * @returns Promise<IMagicMover | null> - The updated Magic Mover or null if not found
     */
    async updateState(id: string, state: MagicMoverState): Promise<IMagicMover | null> {
        // @ts-ignore - Mongoose exec() return type is too complex
        return await MagicMoverModel.findByIdAndUpdate(id, { state }, { new: true }).exec();
    }

    /**
     * Add item to MagicMover
     * @param id - Magic Mover ID
     * @param itemId - Item ID to add
     * @param weight - Weight of the item
     * @returns Promise<IMagicMover | null> - The updated Magic Mover or null if not found
     * @throws {Error} If weight limit exceeded
     */
    async addItem(id: string, itemId: string, weight: number): Promise<IMagicMover | null> {
        // @ts-ignore - Mongoose exec() return type is too complex
        const magicMover = await MagicMoverModel.findById(id).exec();
        if (!magicMover) {
            return null;
        }

        if (magicMover.currentWeight + weight > magicMover.weightLimit) {
            throw new Error('Weight limit exceeded');
        }

        magicMover.items.push(itemId);
        magicMover.currentWeight += weight;
        // @ts-ignore - Mongoose save() return type is too complex
        return await magicMover.save();
    }

    /**
     * Remove item from MagicMover
     * @param id - Magic Mover ID
     * @param itemId - Item ID to remove
     * @param weight - Weight of the item
     * @returns Promise<IMagicMover | null> - The updated Magic Mover or null if not found
     */
    async removeItem(id: string, itemId: string, weight: number): Promise<IMagicMover | null> {
        // @ts-ignore - Mongoose exec() return type is too complex
        const magicMover = await MagicMoverModel.findById(id).exec();
        if (!magicMover) {
            return null;
        }

        magicMover.items = magicMover.items.filter(item => item !== itemId);
        magicMover.currentWeight = Math.max(0, magicMover.currentWeight - weight);
        // @ts-ignore - Mongoose save() return type is too complex
        return await magicMover.save();
    }

    /**
     * Increment completed missions
     * @param id - Magic Mover ID
     * @returns Promise<IMagicMover | null> - The updated Magic Mover or null if not found
     */
    async incrementCompletedMissions(id: string): Promise<IMagicMover | null> {
        // @ts-ignore - Mongoose exec() return type is too complex
        return await MagicMoverModel.findByIdAndUpdate(
            id,
            { $inc: { completedMissions: 1 } },
            { new: true }
        ).exec();
    }

    /**
     * Find available MagicMovers (resting state with capacity)
     * @param requiredWeight - Optional required weight capacity
     * @returns Promise<IMagicMover[]> - List of available Magic Movers
     */
    async findAvailable(requiredWeight?: number): Promise<IMagicMover[]> {
        // @ts-ignore - Mongoose exec() return type is too complex
        const movers = await MagicMoverModel.find({ state: MagicMoverState.RESTING }).exec();

        if (requiredWeight === undefined) {
            return movers;
        }

        // Filter movers that have enough capacity for the required weight
        return movers.filter(mover => (mover.weightLimit - mover.currentWeight) >= requiredWeight);
    }

    /**
     * Validate if Magic Mover can carry additional weight
     * @param mover - The Magic Mover to validate
     * @param additionalWeight - Additional weight to check
     * @returns boolean - True if the mover can carry the weight, false otherwise
     */
    validateWeightLimit(mover: IMagicMover, additionalWeight: number): boolean {
        const totalWeight = mover.currentWeight + additionalWeight;
        return totalWeight <= mover.weightLimit;
    }

    /**
     * Load items onto a Magic Mover
     * Changes state to loading, adds items, and updates weight
     * Uses optimistic locking to prevent concurrent modifications
     * @param id - Magic Mover ID
     * @param itemIds - Array of item IDs to load
     * @param totalWeight - Total weight of items to load
     * @returns Promise<IMagicMover | null> - The updated Magic Mover or null if not found
     * @throws {Error} If weight limit exceeded, duplicate items, or state transition invalid
     */
    async loadItems(id: string, itemIds: string[], totalWeight: number): Promise<IMagicMover | null> {
        // @ts-ignore - Mongoose exec() return type is too complex
        const magicMover = await MagicMoverModel.findById(id).exec();
        if (!magicMover) {
            return null;
        }

        // Validate state transition
        const currentState = magicMover.state;
        const targetState = MagicMoverState.LOADING;
        MagicMoverStateMachine.validateTransition(currentState, targetState, 'load');

        // Check for duplicate items
        const existingItems = new Set(magicMover.items);
        const duplicates = itemIds.filter(itemId => existingItems.has(itemId));
        if (duplicates.length > 0) {
            throw new Error(`Duplicate items detected: ${duplicates.join(', ')}`);
        }

        // Validate weight limit
        if (!this.validateWeightLimit(magicMover, totalWeight)) {
            throw new Error(
                `Weight limit exceeded. Current: ${magicMover.currentWeight}, ` +
                `Adding: ${totalWeight}, Limit: ${magicMover.weightLimit}`
            );
        }

        // Update mover state to loading
        magicMover.state = MagicMoverState.LOADING;

        // Add items and update weight
        magicMover.items.push(...itemIds);
        magicMover.currentWeight += totalWeight;

        // Save with optimistic locking
        // Mongoose automatically increments __v on save and will throw if document changed
        try {
            // @ts-ignore - Mongoose save() return type is too complex
            return await magicMover.save();
        } catch (error: any) {
            if (error.name === 'VersionError') {
                throw new Error('Concurrent modification detected. Please retry the operation.');
            }
            throw error;
        }
    }

    /**
     * Start mission for a Magic Mover
     * Changes state from loading to on-mission
     * @param id - Magic Mover ID
     * @returns Promise<IMagicMover | null> - The updated Magic Mover or null if not found
     * @throws {Error} If state transition is invalid
     */
    async startMission(id: string): Promise<IMagicMover | null> {
        // @ts-ignore - Mongoose exec() return type is too complex
        const magicMover = await MagicMoverModel.findById(id).exec();
        if (!magicMover) {
            return null;
        }

        // Validate state transition using state machine
        const currentState = magicMover.state;
        const targetState = MagicMoverState.ON_MISSION;
        MagicMoverStateMachine.validateTransition(currentState, targetState, 'start_mission');

        // Update state to on-mission
        magicMover.state = MagicMoverState.ON_MISSION;

        // Save with optimistic locking
        try {
            // @ts-ignore - Mongoose save() return type is too complex
            return await magicMover.save();
        } catch (error: any) {
            if (error.name === 'VersionError') {
                throw new Error('Concurrent modification detected. Please retry the operation.');
            }
            throw error;
        }
    }

    /**
     * End mission for a Magic Mover
     * Unloads all items, changes state to resting, and increments completed missions
     * @param id - Magic Mover ID
     * @returns Promise<IMagicMover | null> - The updated Magic Mover or null if not found
     * @throws {Error} If state transition is invalid
     */
    async endMission(id: string): Promise<IMagicMover | null> {
        // @ts-ignore - Mongoose exec() return type is too complex
        const magicMover = await MagicMoverModel.findById(id).exec();
        if (!magicMover) {
            return null;
        }

        // Validate state transition using state machine
        const currentState = magicMover.state;
        const targetState = MagicMoverState.RESTING;
        MagicMoverStateMachine.validateTransition(currentState, targetState, 'end_mission');

        // Unload all items
        magicMover.items = [];
        magicMover.currentWeight = 0;

        // Change state to resting
        magicMover.state = MagicMoverState.RESTING;

        // Increment completed missions
        magicMover.completedMissions += 1;

        // Save with optimistic locking
        try {
            // @ts-ignore - Mongoose save() return type is too complex
            return await magicMover.save();
        } catch (error: any) {
            if (error.name === 'VersionError') {
                throw new Error('Concurrent modification detected. Please retry the operation.');
            }
            throw error;
        }
    }

    /**
     * Unload items from a Magic Mover
     * @param id - Magic Mover ID
     * @returns Promise<IMagicMover | null> - The updated Magic Mover or null if not found
     * @throws {Error} If state transition is invalid
     */
    async unloadItems(id: string): Promise<IMagicMover | null> {
        // @ts-ignore - Mongoose exec() return type is too complex
        const magicMover = await MagicMoverModel.findById(id).exec();
        if (!magicMover) {
            return null;
        }

        // Validate state transition using state machine
        const currentState = magicMover.state;
        const targetState = MagicMoverState.RESTING;
        MagicMoverStateMachine.validateTransition(currentState, targetState, 'unload');

        // Unload all items
        magicMover.items = [];
        magicMover.currentWeight = 0;

        // Change state to resting
        magicMover.state = MagicMoverState.RESTING;


        // Save with optimistic locking
        try {
            // @ts-ignore - Mongoose save() return type is too complex
            return await magicMover.save();
        } catch (error: any) {
            if (error.name === 'VersionError') {
                throw new Error('Concurrent modification detected. Please retry the operation.');
            }
            throw error;
        }
    }

    /**
     * Get top performers by completed missions
     * Optionally filter by a specific item
     * @param itemId - Optional item ID to filter movers who completed missions with this item
     * @returns Magic Movers ordered by completedMissions or missions with specific item
     */
    async getTopPerformers(itemId?: string): Promise<IMagicMover[]> {
        if (!itemId) {
            // Return all movers sorted by total completed missions
            // @ts-ignore - Mongoose exec() return type is too complex
            return await MagicMoverModel.find()
                .sort({ completedMissions: -1 })
                .exec();
        }

        // Import ActivityLogModel dynamically to avoid circular dependencies
        const { ActivityLogModel } = await import('../schemas/ActivityLog.schema');
        const { ActivityType } = await import('../../enums');

        // Find all LOADING activities that include the specified item
        const loadingActivities = await ActivityLogModel.find({
            activityType: ActivityType.LOADING,
            'details.itemIds': itemId,
        }).exec();

        // Get unique mover IDs who loaded this item
        const moverIds = [...new Set(loadingActivities.map(log => log.moverId))];

        if (moverIds.length === 0) {
            return [];
        }

        // For each mover, count how many missions they completed with this item
        // by finding MISSION_ENDED logs that occurred after loading this item
        const moverMissionCounts = await Promise.all(
            moverIds.map(async (moverId) => {
                // Get all loading activities for this mover with the specific item
                const moverLoadings = loadingActivities.filter(log => log.moverId === moverId);

                // Get all mission ended activities for this mover
                const missionEnded = await ActivityLogModel.find({
                    moverId,
                    activityType: ActivityType.MISSION_ENDED,
                }).exec();

                // Count missions that occurred after loading the specific item
                let missionCount = 0;
                for (const loading of moverLoadings) {
                    // Find if there's a mission ended after this loading
                    const matchingMission = missionEnded.find(
                        ended => ended.createdAt > loading.createdAt
                    );
                    if (matchingMission) {
                        missionCount++;
                    }
                }

                return { moverId, missionCount };
            })
        );

        // Sort by mission count descending
        moverMissionCounts.sort((a, b) => b.missionCount - a.missionCount);

        // Fetch the actual mover documents in the sorted order
        const sortedMovers: IMagicMover[] = [];
        for (const { moverId } of moverMissionCounts) {
            // @ts-ignore - Mongoose exec() return type is too complex
            const mover = await MagicMoverModel.findById(moverId).exec();
            if (mover) {
                sortedMovers.push(mover);
            }
        }

        return sortedMovers;
    }
}

