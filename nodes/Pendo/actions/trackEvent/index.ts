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
 * Get a single track event by ID
 */
export async function get(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const trackEventId = this.getNodeParameter('trackEventId', index) as string;

  const response = await pendoApiRequest.call(
    this,
    'GET',
    `/tracktype/${encodeURIComponent(trackEventId)}`,
  );

  return [{ json: response as IDataObject }];
}

/**
 * Get multiple track events
 */
export async function getMany(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const returnAll = this.getNodeParameter('returnAll', index) as boolean;
  const additionalFields = this.getNodeParameter('additionalFields', index, {}) as IDataObject;

  const query: IDataObject = {};

  if (additionalFields.appId) {
    query.appId = additionalFields.appId;
  }

  if (returnAll) {
    const response = await pendoApiRequestAllItems.call(
      this,
      'GET',
      '/tracktype',
      undefined,
      query,
    );
    return response.map((item) => ({ json: item }));
  } else {
    const limit = this.getNodeParameter('limit', index) as number;
    query.limit = limit;

    const response = await pendoApiRequest.call(this, 'GET', '/tracktype', undefined, query);
    const items = Array.isArray(response) ? response : [response];
    return items.map((item) => ({ json: item }));
  }
}

/**
 * Create a new track event definition
 */
export async function create(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const name = this.getNodeParameter('name', index) as string;
  const additionalFields = this.getNodeParameter('additionalFields', index, {}) as IDataObject;

  const body: IDataObject = {
    name,
  };

  if (additionalFields.appId) {
    body.appId = additionalFields.appId;
  }

  if (additionalFields.description) {
    body.description = additionalFields.description;
  }

  if (additionalFields.definition) {
    const definitionString = additionalFields.definition as string;
    body.definition = parseJsonInput(definitionString, 'definition');
  }

  if (additionalFields.group) {
    body.group = additionalFields.group;
  }

  const cleanedBody = cleanObject(body);
  const response = await pendoApiRequest.call(this, 'POST', '/tracktype', cleanedBody);

  return [{ json: response as IDataObject }];
}

/**
 * Update a track event definition
 */
export async function update(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const trackEventId = this.getNodeParameter('trackEventId', index) as string;
  const updateFields = this.getNodeParameter('updateFields', index, {}) as IDataObject;

  const body: IDataObject = {};

  if (updateFields.name) {
    body.name = updateFields.name;
  }

  if (updateFields.description) {
    body.description = updateFields.description;
  }

  if (updateFields.definition) {
    body.definition = parseJsonInput(updateFields.definition as string, 'definition');
  }

  if (updateFields.group) {
    body.group = updateFields.group;
  }

  const cleanedBody = cleanObject(body);
  const response = await pendoApiRequest.call(
    this,
    'PUT',
    `/tracktype/${encodeURIComponent(trackEventId)}`,
    cleanedBody,
  );

  return [{ json: response as IDataObject }];
}

/**
 * Delete a track event definition
 */
export async function deleteTrackEvent(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const trackEventId = this.getNodeParameter('trackEventId', index) as string;

  const response = await pendoApiRequest.call(
    this,
    'DELETE',
    `/tracktype/${encodeURIComponent(trackEventId)}`,
  );

  return [{ json: response as IDataObject }];
}

/**
 * Get track event analytics
 */
export async function getAnalytics(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const trackEventId = this.getNodeParameter('trackEventId', index) as string;
  const startDate = this.getNodeParameter('startDate', index) as string;
  const endDate = this.getNodeParameter('endDate', index) as string;

  const pipeline: IDataObject[] = [
    {
      source: {
        trackEvents: {
          trackTypeId: trackEventId,
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
        { count: { count: 'visitorId' } },
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
 * Search track events by criteria
 */
export async function search(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const searchQuery = this.getNodeParameter('searchQuery', index) as string;
  const returnAll = this.getNodeParameter('returnAll', index) as boolean;

  const query: IDataObject = {
    q: searchQuery,
  };

  if (returnAll) {
    const response = await pendoApiRequestAllItems.call(
      this,
      'GET',
      '/tracktype',
      undefined,
      query,
    );
    return response.map((item) => ({ json: item }));
  } else {
    const limit = this.getNodeParameter('limit', index) as number;
    query.limit = limit;

    const response = await pendoApiRequest.call(this, 'GET', '/tracktype', undefined, query);
    const items = Array.isArray(response) ? response : [response];
    return items.map((item) => ({ json: item as IDataObject }));
  }
}
