import { MessageConsumerPact, Matchers } from '@pact-foundation/pact';
import { Test, TestingModule } from '@nestjs/testing';
import { AiService } from '../../src/ai/ai.service';
import { PrismaService } from '../../src/prisma/prisma.service';
import { GeminiClient } from '../../src/ai/gemini.client';
import { OutboxService } from '../../src/outbox/outbox.service';
import { PortContextService } from '../../src/standards/port-context.service';
import * as path from 'path';

const { like, uuid } = Matchers;

describe('Breach Detected Event Pact (Consumer)', () => {
  let aiService: AiService;

  const pact = new MessageConsumerPact({
    consumer: 'ai-risk-service',
    dir: path.resolve(process.cwd(), 'pacts'),
    provider: 'monitoring-service',
    pactfileWriteMode: 'update',
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiService,
        { 
          provide: PrismaService, 
          useValue: { 
            assessmentSuggestion: { findUnique: jest.fn().mockResolvedValue(null) },
            $transaction: jest.fn().mockImplementation((cb) => cb({
              assessmentSuggestion: { create: jest.fn().mockResolvedValue({ id: '123' }) },
              standardSnapshot: { create: jest.fn().mockResolvedValue({}) },
            }))
          } 
        },
        { 
          provide: GeminiClient, 
          useValue: { 
            modelVersion: 'gemini-3-flash', 
            promptVersion: '1.0.0',
            assessRisk: jest.fn().mockResolvedValue({ impact: 1, likelihood: 1, risk_score: 1 })
          } 
        },
        { 
          provide: OutboxService, 
          useValue: { enqueue: jest.fn(), enqueueWithTx: jest.fn() } 
        },
        { 
          provide: PortContextService, 
          useValue: { isRegistryHealthy: jest.fn().mockResolvedValue(true), getClausesForMetric: jest.fn().mockResolvedValue([]) } 
        },
      ],
    }).compile();

    aiService = module.get<AiService>(AiService);
  });

  describe('when a breach is detected', () => {
    it('generates a pact and verifies the consumer can parse the message', () => {
      return pact
        .expectsToReceive('a breach is detected')
        .withMetadata({
          'contentType': 'application/json',
          'eventType': 'erm.monitoring.breach-detected.v1',
        })
        .withContent({
          id: uuid(),
          type: 'erm.monitoring.breach-detected.v1',
          source: like('monitoring-service'),
          time: like('2023-01-01T00:00:00.000Z'),
          data: {
            breach_case_id: uuid(),
            bu_id: like('BU-001'),
            severity: like('high'),
            title: like('Test Breach'),
            metric_name: like('LTIFR'),
            observed_value: like(12.5),
            site_id: like('SITE-001'),
          }
        })
        .verify(async (message) => {
          // DOGFOODING: Pass the generated mock message into the actual service logic
          // The Pact message content is used to simulate the Kafka payload
          // AiController.handleBreachDetected extracts from .data || .value.data
          const data = message.contents as any;
          const payload = data.data || data;
          await aiService.handleBreachDetected(payload as any);
        });
    });
  });
});
