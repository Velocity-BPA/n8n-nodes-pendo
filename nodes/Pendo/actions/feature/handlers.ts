/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, IDataObject, INodeExecutionData } from 'n8n-workflow';
import { pendoApiRequest, pendoApiRequestAllItems, parseJsonInput, buildAggregationRequest } from '../../transport/pendoApi';
import { cleanObject, formatDateForPendo } from '../../utils/helpers';

/**
 * Get a single feature by ID
 */
export async function get(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const featureId = this.getNodeParameter('featureId', index) as string;

  const response = await pendoApiRequest.call(this, 'GET', `/feature/${encodeURIComponent(featureId)}`);

  return [{ json: response as IDataObject }];
}

/**
 * Get multiple features
 */
export async function getMany(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const returnAll = this.getNodeParameter('returnAll', index) as boolean;
  const filters = this.getNodeParameter('filters', index, {}) as IDataObject;

  const query: IDataObject = {};

  if (filters.appId) {
    query.appId = filters.appId;
  }

  if (filters.pageId) {
    query.pageId = filters.pageId;
  }

  if (returnAll) {
    const response = await pendoApiRequestAllItems.call(
      this,
      'GET',
      '/feature',
      undefined,
      query,
    );
    return response.map((item) => ({ json: item }));
  } else {
    const limit = this.getNodeParameter('limit', index) as number;
    query.limit = limit;

    const response = await pendoApiRequest.call(this, 'GET', '/feature', undefined, query);
    const items = Array.isArray(response) ? response : [response];
    return items.map((item) => ({ json: item as IDataObject }));
  }
}

/**
 * Create a new feature
 */
export async function create(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const name = this.getNodeParameter('name', index) as string;
  const selectorJson = this.getNodeParameter('selector', index) as string;
  const additionalFields = this.getNodeParameter('additionalFields', index, {}) as IDataObject;

  const selector = parseJsonInput(selectorJson, 'selector');

  const body: IDataObject = {
    name,
    elementPathRules: selector,
  };

  if (additionalFields.appId) {
    body.appId = additionalFields.appId;
  }

  if (additionalFields.pageId) {
    body.pageId = additionalFields.pageId;
  }

  if (additionalFields.color) {
    body.color = additionalFields.color;
  }

  const cleanedBody = cleanObject(body);
  const response = await pendoApiRequest.call(this, 'POST', '/feature', cleanedBody);

  return [{ json: response as IDataObject }];
}

/**
 * Update a feature
 */
export async function update(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const featureId = this.getNodeParameter('featureId', index) as string;
  const updateFields = this.getNodeParameter('updateFields', index, {}) as IDataObject;

  const body: IDataObject = {};

  if (updateFields.name) {
    body.name = updateFields.name;
  }

  if (updateFields.selector) {
    body.elementPathRules = parseJsonInput(updateFields.selector as string, 'selector');
  }

  if (updateFields.pageId) {
    body.pageId = updateFields.pageId;
  }

  if (updateFields.color) {
    body.color = updateFields.color;
  }

  const cleanedBody = cleanObject(body);
  const response = await pendoApiRequest.call(
    this,
    'PUT',
    `/feature/${encodeURIComponent(featureId)}`,
    cleanedBody,
  );

  return [{ json: response as IDataObject }];
}

/**
 * Delete a feature
 */
export async function deleteFeature(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const featureId = this.getNodeParameter('featureId', index) as string;

  const response = await pendoApiRequest.call(
    this,
    'DELETE',
    `/feature/${encodeURIComponent(featureId)}`,
  );

  return [{ json: response as IDataObject }];
}

/**
 * Get feature analytics
 */
export async function getAnalytics(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const featureId = this.getNodeParameter('featureId', index) as string;
  const startDate = this.getNodeParameter('startDate', index) as string;
  const endDate = this.getNodeParameter('endDate', index) as string;

  const pipeline: IDataObject[] = [
    {
      source: {
        featureEvents: {
          featureId,
        },
        timeSeries: {
          period: 'dayRange',
          first: formatDateForPendo(startDate),
          last: formatDateForPendo(endDate),
        },
      },
    },
    {
      group: {
        group: ['day'],
      },
    },
    {
      reduce: [
        { clicks: { count: 'visitorId' } },
        { uniqueVisitors: { countUnique: 'visitorId' } },
      ],
    },
    {
      sort: ['day'],
    },
  ];

  const body = buildAggregationRequest(pipeline);
  const response = await pendoApiRequest.call(this, 'POST', '/aggregation', body as IDataObject);

  return [{ json: response as IDataObject }];
}

/**
 * Get feature adoption data
 */
export async function getAdoption(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const featureId = this.getNodeParameter('featureId', index) as string;
  const startDate = this.getNodeParameter('startDate', index) as string;
  const endDate = this.getNodeParameter('endDate', index) as string;

  const pipeline: IDataObject[] = [
    {
      source: {
        featureEvents: {
          featureId,
        },
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
      reduce: [
        { totalClicks: { count: 'visitorId' } },
        { firstUse: { min: 'browserTime' } },
        { lastUse: { max: 'browserTime' } },
      ],
    },
  ];

  const body = buildAggregationRequest(pipeline);
  const response = await pendoApiRequest.call(this, 'POST', '/aggregation', body as IDataObject);

  return [{ json: response as IDataObject }];
}
