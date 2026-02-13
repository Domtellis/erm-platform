import { Module } from '@nestjs/common';
import { DecisioningService } from './decisioning.service';
import { DecisioningController } from './decisioning.controller';
import { OutboxService } from './outbox.service';

@Module({
    controllers: [DecisioningController],
    providers: [DecisioningService, OutboxService],
})
export class DecisioningModule { }
