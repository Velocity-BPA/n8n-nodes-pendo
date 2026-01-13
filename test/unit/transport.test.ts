/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import {
  getEngageApiBaseUrl,
  getFeedbackApiBaseUrl,
  buildAggregationRequest,
  buildTimeSeries,
  epochToIso,
  isoToEpoch,
  parseJsonInput,
} from '../../nodes/Pendo/transport/pendoApi';
import type { IPendoCredentials } from '../../nodes/Pendo/types/PendoTypes';

describe('Pendo Transport Functions', () => {
  describe('getEngageApiBaseUrl', () => {
    it('should return US URL for US region', () => {
      const credentials: IPendoCredentials = {
        integrationKey: 'test-key',
        region: 'US',
      };
      const result = getEngageApiBaseUrl(credentials);
      expect(result).toBe('https://app.pendo.io/api/v1');
    });

    it('should return EU URL for EU region', () => {
      const credentials: IPendoCredentials = {
        integrationKey: 'test-key',
        region: 'EU',
      };
      const result = getEngageApiBaseUrl(credentials);
      expect(result).toBe('https://app.eu.pendo.io/api/v1');
    });

    it('should use custom subdomain when provided', () => {
      const credentials: IPendoCredentials = {
        integrationKey: 'test-key',
        region: 'US',
        subdomain: 'custom',
      };
      const result = getEngageApiBaseUrl(credentials);
      expect(result).toBe('https://custom.pendo.io/api/v1');
    });

    it('should use custom subdomain with EU region', () => {
      const credentials: IPendoCredentials = {
        integrationKey: 'test-key',
        region: 'EU',
        subdomain: 'custom',
      };
      const result = getEngageApiBaseUrl(credentials);
      expect(result).toBe('https://custom.eu.pendo.io/api/v1');
    });
  });

  describe('getFeedbackApiBaseUrl', () => {
    it('should return US URL for US region', () => {
      const credentials: IPendoCredentials = {
        integrationKey: 'test-key',
        region: 'US',
      };
      const result = getFeedbackApiBaseUrl(credentials);
      expect(result).toBe('https://api.feedback.us.pendo.io');
    });

    it('should return EU URL for EU region', () => {
      const credentials: IPendoCredentials = {
        integrationKey: 'test-key',
        region: 'EU',
      };
      const result = getFeedbackApiBaseUrl(credentials);
      expect(result).toBe('https://api.feedback.eu.pendo.io');
    });
  });

  describe('buildAggregationRequest', () => {
    it('should build request with pipeline only', () => {
      const pipeline = [{ source: { pageEvents: {} } }];
      const result = buildAggregationRequest(pipeline);
      expect(result).toEqual({
        response: { mimeType: 'application/json' },
        request: { pipeline },
      });
    });

    it('should include request ID when provided', () => {
      const pipeline = [{ source: { pageEvents: {} } }];
      const result = buildAggregationRequest(pipeline, 'req-123');
      expect(result).toEqual({
        response: { mimeType: 'application/json' },
        request: { pipeline, requestId: 'req-123' },
      });
    });
  });

  describe('buildTimeSeries', () => {
    it('should build time series with string first', () => {
      const result = buildTimeSeries('dayRange', '1704067200000', -30);
      expect(result).toEqual({
        period: 'dayRange',
        first: '1704067200000',
        count: -30,
      });
    });

    it('should convert number first to string', () => {
      const result = buildTimeSeries('hourRange', 1704067200000, 24);
      expect(result).toEqual({
        period: 'hourRange',
        first: '1704067200000',
        count: 24,
      });
    });
  });

  describe('epochToIso', () => {
    it('should convert epoch to ISO string', () => {
      const result = epochToIso(1704067200000);
      expect(result).toBe('2024-01-01T00:00:00.000Z');
    });
  });

  describe('isoToEpoch', () => {
    it('should convert ISO string to epoch', () => {
      const result = isoToEpoch('2024-01-01T00:00:00.000Z');
      expect(result).toBe(1704067200000);
    });
  });

  describe('parseJsonInput', () => {
    it('should parse valid JSON', () => {
      const result = parseJsonInput('{"key": "value"}', 'test');
      expect(result).toEqual({ key: 'value' });
    });

    it('should parse JSON array', () => {
      const result = parseJsonInput('[{"a": 1}, {"b": 2}]', 'test');
      expect(result).toEqual([{ a: 1 }, { b: 2 }]);
    });

    it('should throw error for invalid JSON', () => {
      expect(() => parseJsonInput('not json', 'test')).toThrow('Invalid JSON in test');
    });

    it('should throw error with details for malformed JSON', () => {
      expect(() => parseJsonInput('{broken', 'pipeline')).toThrow('Invalid JSON in pipeline');
    });
  });
});
