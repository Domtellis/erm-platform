import { Controller, Post, Get, Body, Param, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MonitoringService } from './monitoring.service';
import { CreateBreachSubmissionDto } from './dto/create-breach-submission.dto';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Monitoring & Breaches')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('breaches')
export class MonitoringController {
    constructor(private readonly monitoringService: MonitoringService) { }

    @Post('manual-submission')
    @ApiOperation({ summary: 'Manually submit a breach signal/case' })
    async create(@Body() dto: CreateBreachSubmissionDto, @Request() req) {
        const userRoles = req.user?.roles || [];
        if (!userRoles.includes('site_manager')) {
            throw new ForbiddenException('Only Site Managers can submit breaches');
        }
        return this.monitoringService.submitBreach(dto);
    }

    @Get()
    @ApiOperation({ summary: 'List all breach cases' })
    async findAll() {
        return this.monitoringService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get details for a specific breach case' })
    async findOne(@Param('id') id: string) {
        return this.monitoringService.findOne(id);
    }
}
