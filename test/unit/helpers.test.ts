/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import {
  cleanObject,
  deepMerge,
  parseCommaSeparated,
  formatDateForPendo,
  parsePendoDate,
  validateRequiredFields,
  truncate,
  buildPageEventsAggregation,
  buildFeatureEventsAggregation,
  buildGuideEventsAggregation,
} from '../../nodes/Pendo/utils/helpers';

describe('Pendo Helper Functions', () => {
  describe('cleanObject', () => {
    it('should remove undefined and null values', () => {
      const input = {
        a: 'value',
        b: undefined,
        c: null,
        d: '',
        e: 0,
        f: false,
      };
      const result = cleanObject(input);
      expect(result).toEqual({
        a: 'value',
        e: 0,
        f: false,
      });
    });

    it('should return empty object for all undefined/null values', () => {
      const input = {
        a: undefined,
        b: null,
        c: '',
      };
      const result = cleanObject(input);
      expect(result).toEqual({});
    });
  });

  describe('deepMerge', () => {
    it('should merge two flat objects', () => {
      const target = { a: 1, b: 2 };
      const source = { b: 3, c: 4 };
      const result = deepMerge(target, source);
      expect(result).toEqual({ a: 1, b: 3, c: 4 });
    });

    it('should deeply merge nested objects', () => {
      const target = { a: { x: 1, y: 2 } };
      const source = { a: { y: 3, z: 4 } };
      const result = deepMerge(target, source);
      expect(result).toEqual({ a: { x: 1, y: 3, z: 4 } });
    });

    it('should not merge arrays', () => {
      const target = { a: [1, 2] };
      const source = { a: [3, 4] };
      const result = deepMerge(target, source);
      expect(result).toEqual({ a: [3, 4] });
    });
  });

  describe('parseCommaSeparated', () => {
    it('should parse comma-separated string', () => {
      const result = parseCommaSeparated('a, b, c');
      expect(result).toEqual(['a', 'b', 'c']);
    });

    it('should handle extra whitespace', () => {
      const result = parseCommaSeparated('  a  ,  b  ,  c  ');
      expect(result).toEqual(['a', 'b', 'c']);
    });

    it('should filter empty strings', () => {
      const result = parseCommaSeparated('a,,b,  ,c');
      expect(result).toEqual(['a', 'b', 'c']);
    });

    it('should handle single value', () => {
      const result = parseCommaSeparated('single');
      expect(result).toEqual(['single']);
    });
  });

  describe('formatDateForPendo', () => {
    it('should convert date string to epoch milliseconds', () => {
      const result = formatDateForPendo('2024-01-01T00:00:00.000Z');
      expect(result).toBe('1704067200000');
    });

    it('should convert Date object to epoch milliseconds', () => {
      const date = new Date('2024-01-01T00:00:00.000Z');
      const result = formatDateForPendo(date);
      expect(result).toBe('1704067200000');
    });
  });

  describe('parsePendoDate', () => {
    it('should parse epoch string to Date', () => {
      const result = parsePendoDate('1704067200000');
      expect(result.toISOString()).toBe('2024-01-01T00:00:00.000Z');
    });

    it('should parse epoch number to Date', () => {
      const result = parsePendoDate(1704067200000);
      expect(result.toISOString()).toBe('2024-01-01T00:00:00.000Z');
    });
  });

  describe('validateRequiredFields', () => {
    it('should not throw for valid data', () => {
      const data = { a: 'value', b: 'value' };
      expect(() => validateRequiredFields(data, ['a', 'b'], 'test')).not.toThrow();
    });

    it('should throw for missing required fields', () => {
      const data = { a: 'value' };
      expect(() => validateRequiredFields(data, ['a', 'b'], 'test')).toThrow(
        'Missing required fields for test: b',
      );
    });

    it('should list all missing fields', () => {
      const data = {};
      expect(() => validateRequiredFields(data, ['a', 'b', 'c'], 'test')).toThrow(
        'Missing required fields for test: a, b, c',
      );
    });
  });

  describe('truncate', () => {
    it('should not truncate short strings', () => {
      const result = truncate('short', 10);
      expect(result).toBe('short');
    });

    it('should truncate long strings', () => {
      const result = truncate('this is a long string', 10);
      expect(result).toBe('this is...');
    });

    it('should handle exact length', () => {
      const result = truncate('exact', 5);
      expect(result).toBe('exact');
    });
  });

  describe('buildPageEventsAggregation', () => {
    it('should build page events pipeline', () => {
      const result = buildPageEventsAggregation('2024-01-01', '2024-01-31');
      expect(result).toHaveLength(3);
      expect(result[0]).toHaveProperty('source');
      expect(result[1]).toEqual({ identified: 'visitorId' });
      expect(result[2]).toHaveProperty('reduce');
    });

    it('should include filters when provided', () => {
      const result = buildPageEventsAggregation('2024-01-01', '2024-01-31', {
        pageId: 'page-123',
      });
      expect((result[0] as { source: { pageEvents: { pageId: string } } }).source.pageEvents).toEqual({
        pageId: 'page-123',
      });
    });
  });

  describe('buildFeatureEventsAggregation', () => {
    it('should build feature events pipeline', () => {
      const result = buildFeatureEventsAggregation('2024-01-01', '2024-01-31');
      expect(result).toHaveLength(3);
      expect(result[0]).toHaveProperty('source');
    });

    it('should include feature ID filter when provided', () => {
      const result = buildFeatureEventsAggregation('2024-01-01', '2024-01-31', 'feature-123');
      expect(
        (result[0] as { source: { featureEvents: { featureId: string } } }).source.featureEvents,
      ).toEqual({ featureId: 'feature-123' });
    });
  });

  describe('buildGuideEventsAggregation', () => {
    it('should build guide events pipeline', () => {
      const result = buildGuideEventsAggregation('2024-01-01', '2024-01-31');
      expect(result).toHaveLength(3);
      expect(result[0]).toHaveProperty('source');
      expect(result[1]).toHaveProperty('group');
      expect(result[2]).toHaveProperty('reduce');
    });

    it('should include guide ID filter when provided', () => {
      const result = buildGuideEventsAggregation('2024-01-01', '2024-01-31', 'guide-123');
      expect(
        (result[0] as { source: { guideEvents: { guideId: string } } }).source.guideEvents,
      ).toEqual({ guideId: 'guide-123' });
    });
  });
});
