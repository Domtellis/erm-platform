import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Verifier } from '@pact-foundation/pact';
import * as path from 'path';
import { MonitoringModule } from '../../src/monitoring/monitoring.module';
import { MonitoringService } from '../../src/monitoring/monitoring.service';
import { OutboxService } from '../../src/monitoring/outbox.service';
import { AuthGuard } from '@nestjs/passport';

describe('Pact Verification', () => {
    let app: INestApplication;

    const mockMonitoringService = {
        findAll: jest.fn(),
        findOne: jest.fn(),
        submitBreach: jest.fn(),
    };

    const mockOutboxService = {
        onModuleInit: jest.fn(),
        onModuleDestroy: jest.fn(),
    };

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [MonitoringModule],
        })
            .overrideProvider(MonitoringService)
            .useValue(mockMonitoringService)
            .overrideProvider(OutboxService)
            .useValue(mockOutboxService)
            .overrideGuard(AuthGuard('jwt'))
            .useValue({ canActivate: () => true })
            .compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new ValidationPipe({ transform: true }));
        await app.init();
        await app.listen(0);
    });

    afterAll(async () => {
        if (app) {
            await app.close();
        }
    });

    it('validates the expectations of WebPortal', async () => {
        const url = await app.getUrl();

        const output = await new Verifier({
            provider: 'MonitoringService',
            providerBaseUrl: url,
            pactUrls: [
                path.resolve(process.cwd(), '../../web/portal/pacts/WebPortal-MonitoringService.json'),
            ],
            stateHandlers: {
                'Has breaches': async () => {
                    mockMonitoringService.findAll.mockResolvedValue([
                        {
                            id: 'breach-123',
                            site_id: 'site-001',
                            metric_name: 'temperature',
                            observed_value: 25.5,
                            severity: 'high',
                            status: 'open',
                            created_at: new Date('2023-01-01T00:00:00.000Z'),
                        },
                    ]);
                    return Promise.resolve('Breaches exist');
                },
            },
        }).verifyProvider();

        console.log('Pact Verification Complete!');
    });
});
