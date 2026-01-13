/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * Integration tests for n8n-nodes-pendo
 *
 * These tests require actual Pendo API credentials and are intended
 * for local development testing only.
 *
 * To run these tests:
 * 1. Set the PENDO_INTEGRATION_KEY environment variable
 * 2. Set the PENDO_REGION environment variable (US or EU)
 * 3. Run: npm run test:integration
 */

describe('Pendo Integration Tests', () => {
  const integrationKey = process.env.PENDO_INTEGRATION_KEY;
  const region = process.env.PENDO_REGION || 'US';

  const skipIntegrationTests = !integrationKey;

  beforeAll(() => {
    if (skipIntegrationTests) {
      console.log('Skipping integration tests: PENDO_INTEGRATION_KEY not set');
    }
  });

  describe('Pendo Node Structure', () => {
    it('should have correct node metadata', async () => {
      const { Pendo } = await import('../../nodes/Pendo/Pendo.node');
      const node = new Pendo();

      expect(node.description.displayName).toBe('Pendo');
      expect(node.description.name).toBe('pendo');
      expect(node.description.group).toContain('transform');
    });

    it('should have all resources defined', async () => {
      const { Pendo } = await import('../../nodes/Pendo/Pendo.node');
      const node = new Pendo();

      const resourceProperty = node.description.properties.find((p) => p.name === 'resource');
      expect(resourceProperty).toBeDefined();

      const resourceOptions = (resourceProperty as { options: Array<{ value: string }> }).options;
      const resourceValues = resourceOptions.map((o) => o.value);

      expect(resourceValues).toContain('aggregation');
      expect(resourceValues).toContain('visitor');
      expect(resourceValues).toContain('account');
      expect(resourceValues).toContain('guide');
      expect(resourceValues).toContain('segment');
      expect(resourceValues).toContain('trackEvent');
      expect(resourceValues).toContain('feedback');
    });

    it('should require pendoApi credentials', async () => {
      const { Pendo } = await import('../../nodes/Pendo/Pendo.node');
      const node = new Pendo();

      expect(node.description.credentials).toBeDefined();
      const credentialNames = node.description.credentials?.map((c) => c.name);
      expect(credentialNames).toContain('pendoApi');
    });
  });

  describe('Pendo Trigger Node Structure', () => {
    it('should have correct trigger metadata', async () => {
      const { PendoTrigger } = await import('../../nodes/Pendo/PendoTrigger.node');
      const node = new PendoTrigger();

      expect(node.description.displayName).toBe('Pendo Trigger');
      expect(node.description.name).toBe('pendoTrigger');
      expect(node.description.group).toContain('trigger');
    });

    it('should have webhook events defined', async () => {
      const { PendoTrigger } = await import('../../nodes/Pendo/PendoTrigger.node');
      const node = new PendoTrigger();

      const eventProperty = node.description.properties.find((p) => p.name === 'event');
      expect(eventProperty).toBeDefined();

      const eventOptions = (eventProperty as { options: Array<{ value: string }> }).options;
      const eventValues = eventOptions.map((o) => o.value);

      expect(eventValues).toContain('guideShown');
      expect(eventValues).toContain('guideDismissed');
      expect(eventValues).toContain('pollResponse');
      expect(eventValues).toContain('npsResponse');
    });
  });

  describe('Credentials Structure', () => {
    it('should have correct credential properties', async () => {
      const { PendoApi } = await import('../../credentials/PendoApi.credentials');
      const credentials = new PendoApi();

      expect(credentials.name).toBe('pendoApi');
      expect(credentials.displayName).toBe('Pendo API');

      const propertyNames = credentials.properties.map((p) => p.name);
      expect(propertyNames).toContain('integrationKey');
      expect(propertyNames).toContain('region');
      expect(propertyNames).toContain('subdomain');
    });

    it('should have region options for US and EU', async () => {
      const { PendoApi } = await import('../../credentials/PendoApi.credentials');
      const credentials = new PendoApi();

      const regionProperty = credentials.properties.find((p) => p.name === 'region');
      expect(regionProperty).toBeDefined();

      const regionOptions = (regionProperty as { options: Array<{ value: string }> }).options;
      const regionValues = regionOptions.map((o) => o.value);

      expect(regionValues).toContain('US');
      expect(regionValues).toContain('EU');
    });
  });

  // The following tests require actual API credentials
  describe.skip('API Integration (requires credentials)', () => {
    beforeAll(() => {
      if (skipIntegrationTests) {
        console.log('Skipping API integration tests');
      }
    });

    it('should connect to Pendo API', async () => {
      // This test would verify actual API connectivity
      // Requires mocking the n8n execution context
    });

    it('should list guides', async () => {
      // This test would verify guide listing functionality
    });

    it('should run aggregation query', async () => {
      // This test would verify aggregation functionality
    });
  });
});
