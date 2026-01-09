import { IsString, IsEnum, IsOptional, IsObject } from 'class-validator';
import { ActivityType } from '../enums';

export class CreateActivityLogDto {
    @IsString()
    moverId: string;

    @IsEnum(ActivityType)
    activityType: ActivityType;

    @IsOptional()
    @IsObject()
    details?: {
        itemIds?: string[];
        itemCount?: number;
        totalWeight?: number;
        previousState?: string;
        newState?: string;
        [key: string]: any;
    };
}

