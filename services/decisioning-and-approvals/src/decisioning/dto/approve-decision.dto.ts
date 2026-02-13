import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ApproveDecisionDto {
    @ApiProperty({ example: 'APPROVER-01', required: false })
    @IsString()
    @IsOptional()
    approver_user_id?: string;

    @ApiProperty({ example: 'bu_risk_owner', required: false })
    @IsString()
    @IsOptional()
    approver_role?: string;

    @ApiProperty({ example: 'Approved after site review.', required: false })
    @IsString()
    @IsOptional()
    comments?: string;
}
