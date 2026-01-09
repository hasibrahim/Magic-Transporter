import { singleton } from 'tsyringe';
import { ActivityLogModel, IActivityLog } from '../schemas/ActivityLog.schema';
import { ActivityType } from '../../enums';

@singleton()
export class ActivityLogRepository {
    /**
     * Create a new activity log entry
     * Uses createdAt timestamp automatically from Mongoose
     * @param data - Activity log data including moverId, activityType, and optional details
     * @returns Promise<IActivityLog> - The created activity log
     */
    async create(data: {
        moverId: string;
        activityType: ActivityType;
        details?: IActivityLog['details'];
    }): Promise<IActivityLog> {
        const activityLog = new ActivityLogModel({
            moverId: data.moverId,
            activityType: data.activityType,
            details: data.details || {},
        });
        return await activityLog.save();
    }

    /**
     * Find all activity logs for a specific Magic Mover
     * @param moverId - Magic Mover ID
     * @returns Promise<IActivityLog[]> - List of activity logs sorted by createdAt descending
     */
    async findByMoverId(moverId: string): Promise<IActivityLog[]> {
        return await ActivityLogModel.find({ moverId })
            .sort({ createdAt: -1 })
            .exec();
    }

    /**
     * Find activity logs by type
     * @param activityType - Type of activity to filter by
     * @returns Promise<IActivityLog[]> - List of activity logs sorted by createdAt descending
     */
    async findByActivityType(activityType: ActivityType): Promise<IActivityLog[]> {
        return await ActivityLogModel.find({ activityType })
            .sort({ createdAt: -1 })
            .exec();
    }

    /**
     * Find all activity logs with pagination
     * @param limit - Optional limit for pagination
     * @param skip - Optional skip for pagination
     * @returns Promise<IActivityLog[]> - List of activity logs sorted by createdAt descending
     */
    async findAll(limit?: number, skip?: number): Promise<IActivityLog[]> {
        const query = ActivityLogModel.find({}).sort({ createdAt: -1 });

        if (skip !== undefined) {
            query.skip(skip);
        }

        if (limit !== undefined) {
            query.limit(limit);
        }

        return await query.exec();
    }

    /**
     * Find activity logs within a date range
     * @param startDate - Start date for the range
     * @param endDate - End date for the range
     * @param moverId - Optional Magic Mover ID to filter by
     * @returns Promise<IActivityLog[]> - List of activity logs within the date range
     */
    async findByDateRange(
        startDate: Date,
        endDate: Date,
        moverId?: string
    ): Promise<IActivityLog[]> {
        const query: any = {
            createdAt: {
                $gte: startDate,
                $lte: endDate,
            },
        };

        if (moverId) {
            query.moverId = moverId;
        }

        return await ActivityLogModel.find(query)
            .sort({ createdAt: -1 })
            .exec();
    }

    /**
     * Get activity log statistics for a Magic Mover
     * @param moverId - Magic Mover ID
     * @returns Promise<object> - Statistics including counts for different activity types
     */
    async getStatsByMoverId(moverId: string): Promise<{
        totalActivities: number;
        loadingCount: number;
        missionStartedCount: number;
        missionEndedCount: number;
    }> {
        const logs = await this.findByMoverId(moverId);

        return {
            totalActivities: logs.length,
            loadingCount: logs.filter(log => log.activityType === ActivityType.LOADING).length,
            missionStartedCount: logs.filter(log => log.activityType === ActivityType.MISSION_STARTED).length,
            missionEndedCount: logs.filter(log => log.activityType === ActivityType.MISSION_ENDED).length,
        };
    }

    /**
     * Delete all activity logs for a specific Magic Mover
     * @param moverId - Magic Mover ID
     * @returns Promise<number> - Number of deleted activity logs
     */
    async deleteByMoverId(moverId: string): Promise<number> {
        const result = await ActivityLogModel.deleteMany({ moverId }).exec();
        return result.deletedCount || 0;
    }

    /**
     * Count total activity logs
     * @param filter - Optional filter object for counting
     * @returns Promise<number> - Total count of activity logs matching the filter
     */
    async count(filter?: { [key: string]: any }): Promise<number> {
        return await ActivityLogModel.countDocuments(filter || {}).exec();
    }
}

