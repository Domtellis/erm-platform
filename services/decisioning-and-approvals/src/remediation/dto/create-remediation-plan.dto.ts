import { IsString, IsUUID, IsDateString, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum RemediationStatus {
    OPEN = 'open',
    IN_PROGRESS = 'in_progress',
    COMPLETED = 'completed'
}

export class CreateRemediationPlanDto {
    @ApiProperty()
    @IsUUID()
    risk_assessment_id: string;

    @ApiProperty()
    @IsString()
    title: string;

    @ApiProperty()
    @IsString()
    description: string;

    @ApiProperty()
    @IsString()
    assigned_to: string;

    @ApiProperty()
    @IsDateString()
    due_date: string;
}
