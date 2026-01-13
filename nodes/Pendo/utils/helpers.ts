/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IDataObject } from 'n8n-workflow';

/**
 * Remove undefined or null values from an object
 */
export function cleanObject(obj: IDataObject): IDataObject {
  const result: IDataObject = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined && value !== null && value !== '') {
      result[key] = value;
    }
  }
  return result;
}

/**
 * Deep merge two objects
 */
export function deepMerge(target: IDataObject, source: IDataObject): IDataObject {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    if (
      source[key] &&
      typeof source[key] === 'object' &&
      !Array.isArray(source[key]) &&
      target[key] &&
      typeof target[key] === 'object' &&
      !Array.isArray(target[key])
    ) {
      result[key] = deepMerge(target[key] as IDataObject, source[key] as IDataObject);
    } else {
      result[key] = source[key];
    }
  }
  return result;
}

/**
 * Convert additional fields to a flat object
 */
export function flattenAdditionalFields(additionalFields: IDataObject): IDataObject {
  const result: IDataObject = {};
  for (const [key, value] of Object.entries(additionalFields)) {
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      Object.assign(result, flattenAdditionalFields(value as IDataObject));
    } else {
      result[key] = value;
    }
  }
  return result;
}

/**
 * Parse comma-separated string to array
 */
export function parseCommaSeparated(value: string): string[] {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

/**
 * Format date for Pendo API (epoch milliseconds)
 */
export function formatDateForPendo(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.getTime().toString();
}

/**
 * Parse Pendo date (epoch milliseconds to Date)
 */
export function parsePendoDate(epoch: string | number): Date {
  const ms = typeof epoch === 'string' ? parseInt(epoch, 10) : epoch;
  return new Date(ms);
}

/**
 * Build a simple page events aggregation pipeline
 */
export function buildPageEventsAggregation(
  startDate: string,
  endDate: string,
  filters?: IDataObject,
): IDataObject[] {
  const pipeline: IDataObject[] = [
    {
      source: {
        pageEvents: filters || {},
        timeSeries: {
          period: 'dayRange',
          first: formatDateForPendo(startDate),
          last: formatDateForPendo(endDate),
        },
      },
    },
    {
      identified: 'visitorId',
    },
    {
      reduce: [{ count: { count: 'visitorId' } }],
    },
  ];
  return pipeline;
}

/**
 * Build a simple feature events aggregation pipeline
 */
export function buildFeatureEventsAggregation(
  startDate: string,
  endDate: string,
  featureId?: string,
): IDataObject[] {
  const featureFilter: IDataObject = featureId ? { featureId } : {};
  const pipeline: IDataObject[] = [
    {
      source: {
        featureEvents: featureFilter,
        timeSeries: {
          period: 'dayRange',
          first: formatDateForPendo(startDate),
          last: formatDateForPendo(endDate),
        },
      },
    },
    {
      identified: 'visitorId',
    },
    {
      reduce: [{ count: { count: 'visitorId' } }],
    },
  ];
  return pipeline;
}

/**
 * Build a guide events aggregation pipeline
 */
export function buildGuideEventsAggregation(
  startDate: string,
  endDate: string,
  guideId?: string,
): IDataObject[] {
  const guideFilter: IDataObject = guideId ? { guideId } : {};
  const pipeline: IDataObject[] = [
    {
      source: {
        guideEvents: guideFilter,
        timeSeries: {
          period: 'dayRange',
          first: formatDateForPendo(startDate),
          last: formatDateForPendo(endDate),
        },
      },
    },
    {
      group: {
        group: ['guideId', 'type'],
      },
    },
    {
      reduce: [{ count: { count: 'visitorId' } }],
    },
  ];
  return pipeline;
}

/**
 * Validate required fields are present
 */
export function validateRequiredFields(
  data: IDataObject,
  requiredFields: string[],
  context: string,
): void {
  const missingFields = requiredFields.filter((field) => !data[field]);
  if (missingFields.length > 0) {
    throw new Error(`Missing required fields for ${context}: ${missingFields.join(', ')}`);
  }
}

/**
 * Truncate string to specified length
 */
export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.substring(0, length - 3) + '...';
}

/**
 * Sleep for specified milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
