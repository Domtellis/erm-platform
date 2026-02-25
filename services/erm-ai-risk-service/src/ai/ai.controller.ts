import { Controller, Get, Patch, Param, Body, UseGuards, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AiService, BreachDetectedPayload } from './ai.service';
import { UpdateAiStatusDto } from './dto/assessment-suggestion.dto';

@ApiTags('AI Risk Assessment')
@Controller('ai-suggestions')
export class AiController {
    private readonly logger = new Logger(AiController.name);

    constructor(private readonly aiService: AiService) { }

    @EventPattern('erm.monitoring.breach-detected.v1')
    async handleBreachDetected(@Payload() data: any) {
        this.logger.log(`Received raw Kafka data: ${JSON.stringify(data)}`);
        // If data is wrapped in a value property (common in some NestJS Kafka configs)
        const kafkaValue = data.value || data;
        // The Outbox service nests the original payload inside a 'data' field
        const payload = kafkaValue.data || kafkaValue;

        this.logger.log(`Extracted payload breach_case_id: ${payload.breach_case_id}`);
        await this.aiService.handleBreachDetected(payload);
    }

    @Get('health')
    @ApiOperation({ summary: 'Basic health check for the AI service' })
    healthCheck() {
        return { status: 'ok', timestamp: new Date().toISOString() };
    }

    @Get(':breach_case_id')
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get the AI assessment suggestion for a specific breach case' })
    async getSuggestion(@Param('breach_case_id') breachCaseId: string) {
        this.logger.log(`Fetching AI suggestion for breach_case_id: ${breachCaseId}`);
        const suggestion = await this.aiService.getSuggestion(breachCaseId);
        if (!suggestion) {
            this.logger.warn(`No AI suggestion found for breach_case_id: ${breachCaseId}`);
        } else {
            this.logger.log(`Found AI suggestion for breach_case_id: ${breachCaseId}`);
        }
        return suggestion;
    }

    @Patch(':id/feedback')
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Record human feedback (Accept/Modify/Reject) on an AI suggestion' })
    async recordFeedback(
        @Param('id') id: string,
        @Body() dto: UpdateAiStatusDto,
    ) {
        return this.aiService.recordFeedback(id, dto.status, dto.human_feedback);
    }

}
