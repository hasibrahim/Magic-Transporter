import { IsString, IsNumber, IsNotEmpty, IsPositive } from 'class-validator';

export class CreateMagicItemDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsNumber()
    @IsPositive()
    @IsNotEmpty()
    weight: number;
}

