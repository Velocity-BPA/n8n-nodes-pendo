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
 * Get a single NPS survey by ID
 */
export async function get(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const npsId = this.getNodeParameter('npsId', index) as string;

  const response = await pendoApiRequest.call(this, 'GET', `/nps/${encodeURIComponent(npsId)}`);

  return [{ json: response as IDataObject }];
}

/**
 * Get multiple NPS surveys
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

  if (filters.state) {
    query.state = filters.state;
  }

  if (returnAll) {
    const response = await pendoApiRequestAllItems.call(
      this,
      'GET',
      '/nps',
      undefined,
      query,
    );
    return response.map((item) => ({ json: item }));
  } else {
    const limit = this.getNodeParameter('limit', index) as number;
    query.limit = limit;

    const response = await pendoApiRequest.call(this, 'GET', '/nps', undefined, query);
    const items = Array.isArray(response) ? response : [response];
    return items.map((item) => ({ json: item as IDataObject }));
  }
}

/**
 * Create a new NPS survey
 */
export async function create(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const name = this.getNodeParameter('name', index) as string;
  const question = this.getNodeParameter('question', index) as string;
  const additionalFields = this.getNodeParameter('additionalFields', index, {}) as IDataObject;

  const body: IDataObject = {
    name,
    question,
  };

  if (additionalFields.appId) {
    body.appId = additionalFields.appId;
  }

  if (additionalFields.targeting) {
    body.targeting = parseJsonInput(additionalFields.targeting as string, 'targeting');
  }

  if (additionalFields.followUp) {
    body.followUp = parseJsonInput(additionalFields.followUp as string, 'followUp');
  }

  const cleanedBody = cleanObject(body);
  const response = await pendoApiRequest.call(this, 'POST', '/nps', cleanedBody);

  return [{ json: response as IDataObject }];
}

/**
 * Update an NPS survey
 */
export async function update(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const npsId = this.getNodeParameter('npsId', index) as string;
  const updateFields = this.getNodeParameter('updateFields', index, {}) as IDataObject;

  const body: IDataObject = {};

  if (updateFields.name) {
    body.name = updateFields.name;
  }

  if (updateFields.question) {
    body.question = updateFields.question;
  }

  if (updateFields.state) {
    body.state = updateFields.state;
  }

  if (updateFields.targeting) {
    body.targeting = parseJsonInput(updateFields.targeting as string, 'targeting');
  }

  if (updateFields.followUp) {
    body.followUp = parseJsonInput(updateFields.followUp as string, 'followUp');
  }

  const cleanedBody = cleanObject(body);
  const response = await pendoApiRequest.call(
    this,
    'PUT',
    `/nps/${encodeURIComponent(npsId)}`,
    cleanedBody,
  );

  return [{ json: response as IDataObject }];
}

/**
 * Delete an NPS survey
 */
export async function deleteNps(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const npsId = this.getNodeParameter('npsId', index) as string;

  const response = await pendoApiRequest.call(
    this,
    'DELETE',
    `/nps/${encodeURIComponent(npsId)}`,
  );

  return [{ json: response as IDataObject }];
}

/**
 * Get NPS responses
 */
export async function getResponses(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const npsId = this.getNodeParameter('npsId', index) as string;
  const returnAll = this.getNodeParameter('returnAll', index) as boolean;
  const options = this.getNodeParameter('options', index, {}) as IDataObject;

  const query: IDataObject = {};

  if (options.startDate) {
    query.startDate = new Date(options.startDate as string).getTime();
  }

  if (options.endDate) {
    query.endDate = new Date(options.endDate as string).getTime();
  }

  if (returnAll) {
    const response = await pendoApiRequestAllItems.call(
      this,
      'GET',
      `/nps/${encodeURIComponent(npsId)}/response`,
      undefined,
      query,
    );
    return response.map((item) => ({ json: item }));
  } else {
    const limit = this.getNodeParameter('limit', index) as number;
    query.limit = limit;

    const response = await pendoApiRequest.call(
      this,
      'GET',
      `/nps/${encodeURIComponent(npsId)}/response`,
      undefined,
      query,
    );
    const items = Array.isArray(response) ? response : [response];
    return items.map((item) => ({ json: item as IDataObject }));
  }
}

/**
 * Get NPS analytics
 */
export async function getAnalytics(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const npsId = this.getNodeParameter('npsId', index) as string;
  const startDate = this.getNodeParameter('startDate', index) as string;
  const endDate = this.getNodeParameter('endDate', index) as string;

  const pipeline: IDataObject[] = [
    {
      source: {
        npsEvents: {
          npsId,
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
        { responses: { count: 'visitorId' } },
        { avgScore: { avg: 'npsScore' } },
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
 * Export NPS data
 */
export async function exportData(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const npsId = this.getNodeParameter('npsId', index) as string;
  const format = this.getNodeParameter('format', index) as string;
  const options = this.getNodeParameter('options', index, {}) as IDataObject;

  const query: IDataObject = {
    format,
  };

  if (options.startDate) {
    query.startDate = new Date(options.startDate as string).getTime();
  }

  if (options.endDate) {
    query.endDate = new Date(options.endDate as string).getTime();
  }

  const response = await pendoApiRequest.call(
    this,
    'GET',
    `/nps/${encodeURIComponent(npsId)}/export`,
    undefined,
    query,
  );

  return [{ json: response as IDataObject }];
}
