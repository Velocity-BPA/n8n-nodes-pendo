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
 * Get a single page by ID
 */
export async function get(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const pageId = this.getNodeParameter('pageId', index) as string;

  const response = await pendoApiRequest.call(this, 'GET', `/page/${encodeURIComponent(pageId)}`);

  return [{ json: response as IDataObject }];
}

/**
 * Get multiple pages
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

  if (filters.category) {
    query.category = filters.category;
  }

  if (returnAll) {
    const response = await pendoApiRequestAllItems.call(
      this,
      'GET',
      '/page',
      undefined,
      query,
    );
    return response.map((item) => ({ json: item }));
  } else {
    const limit = this.getNodeParameter('limit', index) as number;
    query.limit = limit;

    const response = await pendoApiRequest.call(this, 'GET', '/page', undefined, query);
    const items = Array.isArray(response) ? response : [response];
    return items.map((item) => ({ json: item as IDataObject }));
  }
}

/**
 * Create a new page
 */
export async function create(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const name = this.getNodeParameter('name', index) as string;
  const rulesJson = this.getNodeParameter('rules', index) as string;
  const additionalFields = this.getNodeParameter('additionalFields', index, {}) as IDataObject;

  const rules = parseJsonInput(rulesJson, 'rules');

  const body: IDataObject = {
    name,
    rules,
  };

  if (additionalFields.appId) {
    body.appId = additionalFields.appId;
  }

  if (additionalFields.category) {
    body.category = additionalFields.category;
  }

  if (additionalFields.color) {
    body.color = additionalFields.color;
  }

  const cleanedBody = cleanObject(body);
  const response = await pendoApiRequest.call(this, 'POST', '/page', cleanedBody);

  return [{ json: response as IDataObject }];
}

/**
 * Update a page
 */
export async function update(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const pageId = this.getNodeParameter('pageId', index) as string;
  const updateFields = this.getNodeParameter('updateFields', index, {}) as IDataObject;

  const body: IDataObject = {};

  if (updateFields.name) {
    body.name = updateFields.name;
  }

  if (updateFields.rules) {
    body.rules = parseJsonInput(updateFields.rules as string, 'rules');
  }

  if (updateFields.category) {
    body.category = updateFields.category;
  }

  if (updateFields.color) {
    body.color = updateFields.color;
  }

  const cleanedBody = cleanObject(body);
  const response = await pendoApiRequest.call(
    this,
    'PUT',
    `/page/${encodeURIComponent(pageId)}`,
    cleanedBody,
  );

  return [{ json: response as IDataObject }];
}

/**
 * Delete a page
 */
export async function deletePage(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const pageId = this.getNodeParameter('pageId', index) as string;

  const response = await pendoApiRequest.call(
    this,
    'DELETE',
    `/page/${encodeURIComponent(pageId)}`,
  );

  return [{ json: response as IDataObject }];
}

/**
 * Get page analytics
 */
export async function getAnalytics(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const pageId = this.getNodeParameter('pageId', index) as string;
  const startDate = this.getNodeParameter('startDate', index) as string;
  const endDate = this.getNodeParameter('endDate', index) as string;

  const pipeline: IDataObject[] = [
    {
      source: {
        pageEvents: {
          pageId,
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
        { views: { count: 'visitorId' } },
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
 * Get page rules
 */
export async function getRules(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const pageId = this.getNodeParameter('pageId', index) as string;

  const response = await pendoApiRequest.call(
    this,
    'GET',
    `/page/${encodeURIComponent(pageId)}`,
  ) as IDataObject;

  return [{ json: { pageId, rules: response.rules } }];
}
