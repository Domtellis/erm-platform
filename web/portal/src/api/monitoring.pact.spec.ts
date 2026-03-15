import { describe, it, expect } from 'vitest';
import { PactV3, MatchersV3 } from '@pact-foundation/pact';
import path from 'path';
import axios from 'axios';
import { getBreaches } from './monitoring';

const { like } = MatchersV3;

const provider = new PactV3({
    consumer: 'WebPortal',
    provider: 'MonitoringService',
    dir: path.resolve(process.cwd(), 'pacts'),
    cors: true,
});

describe('Monitoring API Pact Test', () => {
    it('returns a list of breaches', async () => {
        // Set up the interaction
        provider.addInteraction({
            states: [{ description: 'Has breaches' }],
            uponReceiving: 'a request for all breaches',
            withRequest: {
                method: 'GET',
                path: '/breaches',
                headers: {
                    Authorization: like('Bearer mock-token')
                }
            },
            willRespondWith: {
                status: 200,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: like([
                    {
                        id: 'breach-123',
                        site_id: 'site-001',
                        metric_name: 'temperature',
                        observed_value: 25.5,
                        severity: 'high',
                        status: 'open',
                        created_at: '2023-01-01T00:00:00.000Z'
                    }
                ])
            },
        });

        await provider.executeTest(async (mockServer) => {
            // IMPORTANT: We must override the API URL to point to the mock server
            // Since getBreaches uses import.meta.env.VITE_MONITORING_API_URL, we need to mock it
            // Or in this test, we can validly assume standard Axios behavior
            // But getBreaches has the URL hardcoded/env var'd inside.
            // We need to intercept the request or configure getBreaches.

            // Since we can't easily change the module-level constant in a running test without reloading modules,
            // we might need to modify getBreaches to accept a baseUrl, or config.
            // OR better: In the unit test, we can use a library like 'msw' but here we want Pact.

            // Actually, 'executeTest' provides the mock server URL.
            // If we can't inject it, we can't test it easily.

            // Let's modify the getBreaches signature to accept an optional base URL for testing?
            // Or use an axios interceptor to redirect?
            // Let's use an axios request interceptor to redirect all localhost:4010 requests to mockServer.url

            const originalAdapter = axios.defaults.adapter;
            // Forcing node http adapter for Pact tests in jsdom environment
            axios.defaults.adapter = 'http';

            const interceptor = axios.interceptors.request.use((config) => {
                // Redirect relative API calls to the Pact Mock Server
                if (config.url?.startsWith('/api/monitoring')) {
                    config.baseURL = mockServer.url;
                    config.url = config.url.replace('/api/monitoring', '');
                } else if (config.url?.includes('localhost:4010')) {
                    config.baseURL = mockServer.url;
                    config.url = config.url.replace('http://localhost:4010', '');
                }
                return config;
            });

            try {
                const breaches = await getBreaches('mock-token');
                expect(breaches).toHaveLength(1);
                expect(breaches[0].id).toBe('breach-123');
            } finally {
                axios.interceptors.request.eject(interceptor);
                axios.defaults.adapter = originalAdapter;
            }
        });
    });
});
