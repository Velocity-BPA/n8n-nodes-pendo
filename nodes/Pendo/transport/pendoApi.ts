/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
  IExecuteFunctions,
  IHookFunctions,
  ILoadOptionsFunctions,
  IWebhookFunctions,
  IDataObject,
  IHttpRequestMethods,
  IRequestOptions,
  JsonObject,
} from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';
import type { IPendoCredentials, IPendoPaginationOptions } from '../types/PendoTypes';

/**
 * Get the base URL for the Pendo Engage API
 */
export function getEngageApiBaseUrl(credentials: IPendoCredentials): string {
  const subdomain = credentials.subdomain || 'app';
  if (credentials.region === 'EU') {
    return `https://${subdomain}.eu.pendo.io/api/v1`;
  }
  return `https://${subdomain}.pendo.io/api/v1`;
}

/**
 * Get the base URL for the Pendo Feedback API
 */
export function getFeedbackApiBaseUrl(credentials: IPendoCredentials): string {
  if (credentials.region === 'EU') {
    return 'https://api.feedback.eu.pendo.io';
  }
  return 'https://api.feedback.us.pendo.io';
}

/**
 * Make a request to the Pendo Engage API
 */
export async function pendoApiRequest(
  this: IExecuteFunctions | ILoadOptionsFunctions | IHookFunctions | IWebhookFunctions,
  method: IHttpRequestMethods,
  endpoint: string,
  body?: IDataObject,
  query?: IDataObject,
): Promise<IDataObject | IDataObject[]> {
  const credentials = (await this.getCredentials('pendoApi')) as IPendoCredentials;
  const baseUrl = getEngageApiBaseUrl(credentials);

  const options: IRequestOptions = {
    method,
    uri: `${baseUrl}${endpoint}`,
    headers: {
      'x-pendo-integration-key': credentials.integrationKey,
      'Content-Type': 'application/json',
    },
    json: true,
  };

  if (body && Object.keys(body).length > 0) {
    options.body = body;
  }

  if (query && Object.keys(query).length > 0) {
    options.qs = query;
  }

  try {
    const response = await this.helpers.request(options);
    return response as IDataObject | IDataObject[];
  } catch (error) {
    throw new NodeApiError(this.getNode(), error as JsonObject);
  }
}

/**
 * Make a request to the Pendo Feedback API
 */
export async function pendoFeedbackApiRequest(
  this: IExecuteFunctions | ILoadOptionsFunctions | IHookFunctions | IWebhookFunctions,
  method: IHttpRequestMethods,
  endpoint: string,
  body?: IDataObject,
  query?: IDataObject,
): Promise<IDataObject | IDataObject[]> {
  const credentials = (await this.getCredentials('pendoApi')) as IPendoCredentials;
  const baseUrl = getFeedbackApiBaseUrl(credentials);

  const options: IRequestOptions = {
    method,
    uri: `${baseUrl}${endpoint}`,
    headers: {
      'x-pendo-integration-key': credentials.integrationKey,
      'Content-Type': 'application/json',
    },
    json: true,
  };

  if (body && Object.keys(body).length > 0) {
    options.body = body;
  }

  if (query && Object.keys(query).length > 0) {
    options.qs = query;
  }

  try {
    const response = await this.helpers.request(options);
    return response as IDataObject | IDataObject[];
  } catch (error) {
    throw new NodeApiError(this.getNode(), error as JsonObject);
  }
}

/**
 * Make a paginated request to the Pendo API
 */
export async function pendoApiRequestAllItems(
  this: IExecuteFunctions | ILoadOptionsFunctions,
  method: IHttpRequestMethods,
  endpoint: string,
  body?: IDataObject,
  query?: IDataObject,
  pagination?: IPendoPaginationOptions,
): Promise<IDataObject[]> {
  const returnData: IDataObject[] = [];
  const limit = pagination?.limit || 100;
  let offset = pagination?.offset || 0;
  let hasMore = true;

  while (hasMore) {
    const queryWithPagination = {
      ...query,
      offset,
      limit,
    };

    const response = await pendoApiRequest.call(this, method, endpoint, body, queryWithPagination);

    if (Array.isArray(response)) {
      returnData.push(...response);
      hasMore = response.length === limit;
    } else if (response.results && Array.isArray(response.results)) {
      returnData.push(...(response.results as IDataObject[]));
      hasMore = (response.results as IDataObject[]).length === limit;
    } else {
      returnData.push(response);
      hasMore = false;
    }

    offset += limit;
  }

  return returnData;
}

/**
 * Validate and parse JSON input
 */
export function parseJsonInput(jsonString: string, fieldName: string): IDataObject {
  try {
    return JSON.parse(jsonString) as IDataObject;
  } catch (error) {
    throw new Error(`Invalid JSON in ${fieldName}: ${(error as Error).message}`);
  }
}

/**
 * Build aggregation request body
 */
export function buildAggregationRequest(
  pipeline: IDataObject[],
  requestId?: string,
): IDataObject {
  const request: IDataObject = {
    response: {
      mimeType: 'application/json',
    },
    request: {
      pipeline,
    },
  };

  if (requestId) {
    (request.request as IDataObject).requestId = requestId;
  }

  return request;
}

/**
 * Build time series object for aggregation
 */
export function buildTimeSeries(
  period: string,
  first: string | number,
  count: number,
): IDataObject {
  return {
    period,
    first: typeof first === 'number' ? first.toString() : first,
    count,
  };
}

/**
 * Convert epoch timestamp to ISO date string
 */
export function epochToIso(epoch: number): string {
  return new Date(epoch).toISOString();
}

/**
 * Convert ISO date string to epoch timestamp
 */
export function isoToEpoch(isoDate: string): number {
  return new Date(isoDate).getTime();
}
