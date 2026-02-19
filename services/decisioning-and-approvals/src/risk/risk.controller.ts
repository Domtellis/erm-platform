import { Controller, Post, Body, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RiskService } from './risk.service';
import { CreateRiskAssessmentDto } from './dto/create-risk-assessment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('risk-assessments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('assessments')
export class RiskController {
    constructor(private readonly riskService: RiskService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new Risk Assessment' })
    @ApiResponse({ status: 201, description: 'Assessment created successfully' })
    create(@Body() dto: CreateRiskAssessmentDto) {
        return this.riskService.createAssessment(dto);
    }

    @Get()
    @ApiOperation({ summary: 'List assessments' })
    findAll(@Query('breach_case_id') breachCaseId?: string) {
        return this.riskService.findAll(breachCaseId);
    }
}
