/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, IDataObject, INodeExecutionData } from 'n8n-workflow';
import { pendoApiRequest, pendoApiRequestAllItems, buildAggregationRequest, parseJsonInput } from '../../transport/pendoApi';
import { cleanObject, formatDateForPendo } from '../../utils/helpers';

/**
 * Get a single guide by ID
 */
export async function get(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const guideId = this.getNodeParameter('guideId', index) as string;

  const response = await pendoApiRequest.call(this, 'GET', `/guide/${encodeURIComponent(guideId)}`);

  return [{ json: response as IDataObject }];
}

/**
 * Get multiple guides
 */
export async function getMany(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const returnAll = this.getNodeParameter('returnAll', index) as boolean;
  const additionalFields = this.getNodeParameter('additionalFields', index, {}) as IDataObject;

  const query: IDataObject = {};

  if (additionalFields.state) {
    query.state = additionalFields.state;
  }

  if (additionalFields.appId) {
    query.appId = additionalFields.appId;
  }

  if (returnAll) {
    const response = await pendoApiRequestAllItems.call(
      this,
      'GET',
      '/guide',
      undefined,
      query,
    );
    return response.map((item) => ({ json: item }));
  } else {
    const limit = this.getNodeParameter('limit', index) as number;
    query.limit = limit;

    const response = await pendoApiRequest.call(this, 'GET', '/guide', undefined, query);
    const items = Array.isArray(response) ? response : [response];
    return items.map((item) => ({ json: item }));
  }
}

/**
 * Update guide settings
 */
export async function update(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const guideId = this.getNodeParameter('guideId', index) as string;
  const updateFields = this.getNodeParameter('updateFields', index, {}) as IDataObject;

  const body: IDataObject = {};

  if (updateFields.state) {
    body.state = updateFields.state;
  }

  if (updateFields.name) {
    body.name = updateFields.name;
  }

  if (updateFields.launchMethod) {
    body.launchMethod = updateFields.launchMethod;
  }

  const cleanedBody = cleanObject(body);
  const response = await pendoApiRequest.call(
    this,
    'PUT',
    `/guide/${encodeURIComponent(guideId)}`,
    cleanedBody,
  );

  return [{ json: response as IDataObject }];
}

/**
 * Get guide analytics/performance data
 */
export async function getAnalytics(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const guideId = this.getNodeParameter('guideId', index) as string;
  const startDate = this.getNodeParameter('startDate', index) as string;
  const endDate = this.getNodeParameter('endDate', index) as string;

  const pipeline: IDataObject[] = [
    {
      source: {
        guideEvents: {
          guideId,
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
        group: ['type', 'stepId'],
      },
    },
    {
      reduce: [
        { count: { count: 'visitorId' } },
        { uniqueVisitors: { countUnique: 'visitorId' } },
      ],
    },
  ];

  const body = buildAggregationRequest(pipeline);
  const response = await pendoApiRequest.call(this, 'POST', '/aggregation', body as IDataObject);

  return [{ json: response as IDataObject }];
}

/**
 * Create a new guide
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

  if (additionalFields.launchMethod) {
    body.launchMethod = additionalFields.launchMethod;
  }

  if (additionalFields.audience) {
    body.audience = parseJsonInput(additionalFields.audience as string, 'audience');
  }

  const cleanedBody = cleanObject(body);
  const response = await pendoApiRequest.call(this, 'POST', '/guide', cleanedBody);

  return [{ json: response as IDataObject }];
}

/**
 * Delete a guide
 */
export async function deleteGuide(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const guideId = this.getNodeParameter('guideId', index) as string;

  const response = await pendoApiRequest.call(
    this,
    'DELETE',
    `/guide/${encodeURIComponent(guideId)}`,
  );

  return [{ json: response as IDataObject }];
}

/**
 * Enable a guide (set to public)
 */
export async function enable(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const guideId = this.getNodeParameter('guideId', index) as string;

  const body: IDataObject = {
    state: 'public',
  };

  const response = await pendoApiRequest.call(
    this,
    'PUT',
    `/guide/${encodeURIComponent(guideId)}`,
    body,
  );

  return [{ json: response as IDataObject }];
}

/**
 * Disable a guide
 */
export async function disable(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const guideId = this.getNodeParameter('guideId', index) as string;

  const body: IDataObject = {
    state: 'disabled',
  };

  const response = await pendoApiRequest.call(
    this,
    'PUT',
    `/guide/${encodeURIComponent(guideId)}`,
    body,
  );

  return [{ json: response as IDataObject }];
}

/**
 * Get guide step definitions
 */
export async function getSteps(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const guideId = this.getNodeParameter('guideId', index) as string;

  const response = await pendoApiRequest.call(
    this,
    'GET',
    `/guide/${encodeURIComponent(guideId)}/step`,
  );

  const items = Array.isArray(response) ? response : [response];
  return items.map((item) => ({ json: item as IDataObject }));
}

/**
 * Get guides by segment
 */
export async function getBySegment(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const segmentId = this.getNodeParameter('segmentId', index) as string;
  const returnAll = this.getNodeParameter('returnAll', index) as boolean;

  const query: IDataObject = {
    segment: segmentId,
  };

  if (returnAll) {
    const response = await pendoApiRequestAllItems.call(
      this,
      'GET',
      '/guide',
      undefined,
      query,
    );
    return response.map((item) => ({ json: item }));
  } else {
    const limit = this.getNodeParameter('limit', index) as number;
    query.limit = limit;

    const response = await pendoApiRequest.call(this, 'GET', '/guide', undefined, query);
    const items = Array.isArray(response) ? response : [response];
    return items.map((item) => ({ json: item as IDataObject }));
  }
}
