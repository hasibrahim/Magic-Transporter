import { IsString, IsNumber, IsOptional, IsEnum, IsArray, IsPositive, Min, IsNotEmpty } from 'class-validator';
import { MagicMoverState } from '../enums';

export class CreateMagicMoverDto {
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    name?: string;

    @IsNumber()
    @IsPositive()
    @IsNotEmpty()
    weightLimit: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    currentWeight?: number;

    @IsOptional()
    @IsEnum(MagicMoverState)
    state?: MagicMoverState;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    items?: string[];

    @IsOptional()
    @IsNumber()
    @Min(0)
    completedMissions?: number;
}

export class UpdateMagicMoverDto {
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    name?: string;

    @IsOptional()
    @IsNumber()
    @IsPositive()
    weightLimit?: number;


    @IsOptional()
    @IsNumber()
    @Min(0)
    completedMissions?: number;
}

export class LoadItemsDto {
    @IsArray()
    @IsString({ each: true })
    @IsNotEmpty()
    itemIds: string[];
}
