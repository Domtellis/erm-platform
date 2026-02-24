import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ReportingService } from './reporting.service';

@ApiTags('Reporting & Analytics')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('reports')
export class ReportingController {
    constructor(private readonly reportingService: ReportingService) { }

    @Get('trends')
    @ApiOperation({ summary: 'Get risk trend analysis (Breaches over time)' })
    async getTrends(@Query('days') days?: number) {
        return this.reportingService.getRiskTrends(days ? Number(days) : 30);
    }

    @Get('burndown')
    @ApiOperation({ summary: 'Get total open risk over time (Burndown)' })
    async getBurndown(@Query('days') days?: number) {
        return this.reportingService.getBurndown(days ? Number(days) : 30);
    }
}
