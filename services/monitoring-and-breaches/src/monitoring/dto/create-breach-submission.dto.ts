import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBreachSubmissionDto {
    @ApiProperty({ example: 'PORT-TERM-04' })
    @IsString()
    @IsNotEmpty()
    site_id: string;

    @ApiProperty({ example: 'wind_speed_knots' })
    @IsString()
    @IsNotEmpty()
    metric_name: string;

    @ApiProperty({ example: 48.5 })
    @IsNotEmpty()
    observed_value: number;

    @ApiProperty({ example: 'High Wind Gusts at Quay 4', required: false })
    @IsString()
    @IsOptional()
    title?: string;

    @ApiProperty({ example: 'safety' })
    @IsString()
    @IsNotEmpty()
    category: string;

    @ApiProperty({ example: 'BU-PACIFIC' })
    @IsString()
    @IsNotEmpty()
    bu_id: string;

    @ApiProperty({ example: 'critical', required: false })
    @IsString()
    @IsOptional()
    severity?: string;
}
