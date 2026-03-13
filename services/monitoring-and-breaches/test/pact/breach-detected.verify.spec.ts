import { MessageProviderPact, providerWithMetadata } from '@pact-foundation/pact';
import * as path from 'path';

describe('Breach Detected Event Pact (Provider)', () => {
  it('verifies the breach-detected event contract', async () => {
    await new MessageProviderPact({
      provider: 'monitoring-service',
      pactUrls: [
        path.resolve(
          __dirname,
          '../../../erm-ai-risk-service/pacts/ai-risk-service-monitoring-service.json'
        ),
      ],
      messageProviders: {
        'a breach is detected': providerWithMetadata(() => ({
          id: 'e2490de5-5bd3-43d5-b7c4-526e33f71304',
          type: 'erm.monitoring.breach-detected.v1',
          source: 'monitoring-service',
          time: '2023-01-01T00:00:00.000Z',
          data: {
            breach_case_id: 'e2490de5-5bd3-43d5-b7c4-526e33f71304', // BROKEN: expects breach_case_id
            bu_id: 'BU-001',
            severity: 'high',
            title: 'Test Breach',
            metric_name: 'LTIFR',
            observed_value: 12.5,
            site_id: 'SITE-001',
          }
        }), {
          'contentType': 'application/json',
          'eventType': 'erm.monitoring.illegal-change.v1'
        }),
      },
    }).verify();
  });
});
