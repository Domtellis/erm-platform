import { Module } from '@nestjs/common';
import { MonitoringService } from './monitoring.service';
import { MonitoringController } from './monitoring.controller';
import { OutboxService } from './outbox.service';

@Module({
    controllers: [MonitoringController],
    providers: [MonitoringService, OutboxService],
})
export class MonitoringModule { }
