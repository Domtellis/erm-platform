import { Controller, Post, Body, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RemediationService } from './remediation.service';
import { CreateRemediationPlanDto } from './dto/create-remediation-plan.dto';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('remediation-plans')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('remediations')
export class RemediationController {
    constructor(private readonly remediationService: RemediationService) { }

    @Post()
    @ApiOperation({ summary: 'Create a Remediation Plan' })
    @ApiResponse({ status: 201, description: 'Plan created successfully' })
    create(@Body() dto: CreateRemediationPlanDto) {
        return this.remediationService.create(dto);
    }

    @Get()
    @ApiOperation({ summary: 'List remediation plans' })
    findAll(@Query('risk_assessment_id') riskAssessmentId?: string) {
        return this.remediationService.findAll(riskAssessmentId);
    }
}
