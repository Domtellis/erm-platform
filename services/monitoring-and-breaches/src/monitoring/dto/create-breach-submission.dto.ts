import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBreachSubmissionDto {
    @ApiProperty({ example: 'SITE-ALPHA-01' })
    @IsString()
    @IsNotEmpty()
    site_id: string;

    @ApiProperty({ example: 'Pressure' })
    @IsString()
    @IsNotEmpty()
    metric_name: string;

    @ApiProperty({ example: 1200.50 })
    @IsNotEmpty()
    observed_value: number;

    @ApiProperty({ example: 'Elevated Safety Incident', required: false })
    @IsString()
    @IsOptional()
    title?: string;

    @ApiProperty({ example: 'safety' })
    @IsString()
    @IsNotEmpty()
    category: string;

    @ApiProperty({ example: 'BU-NORTH-01' })
    @IsString()
    @IsNotEmpty()
    bu_id: string;

    @ApiProperty({ example: 'high', required: false })
    @IsString()
    @IsOptional()
    severity?: string;
}
