/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, IDataObject, INodeExecutionData } from 'n8n-workflow';
import { pendoApiRequest, parseJsonInput, buildAggregationRequest } from '../../transport/pendoApi';
import {
  buildPageEventsAggregation,
  buildFeatureEventsAggregation,
  buildGuideEventsAggregation,
  formatDateForPendo,
} from '../../utils/helpers';

/**
 * Run a custom aggregation query
 */
export async function runAggregation(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const pipelineJson = this.getNodeParameter('pipeline', index) as string;
  const requestId = this.getNodeParameter('requestId', index, '') as string;

  const pipeline = parseJsonInput(pipelineJson, 'pipeline');
  const pipelineArray = Array.isArray(pipeline) ? pipeline : [pipeline];

  const body = buildAggregationRequest(pipelineArray as IDataObject[], requestId || undefined);
  const response = await pendoApiRequest.call(this, 'POST', '/aggregation', body as IDataObject);

  return [{ json: response as IDataObject }];
}

/**
 * Get page view events
 */
export async function getPageEvents(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const startDate = this.getNodeParameter('startDate', index) as string;
  const endDate = this.getNodeParameter('endDate', index) as string;
  const additionalFields = this.getNodeParameter('additionalFields', index, {}) as IDataObject;

  const filters: IDataObject = {};
  if (additionalFields.pageId) {
    filters.pageId = additionalFields.pageId;
  }
  if (additionalFields.appId) {
    filters.appId = additionalFields.appId;
  }

  const pipeline = buildPageEventsAggregation(startDate, endDate, filters);
  const body = buildAggregationRequest(pipeline);
  const response = await pendoApiRequest.call(this, 'POST', '/aggregation', body as IDataObject);

  return [{ json: response as IDataObject }];
}

/**
 * Get feature click events
 */
export async function getFeatureEvents(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const startDate = this.getNodeParameter('startDate', index) as string;
  const endDate = this.getNodeParameter('endDate', index) as string;
  const additionalFields = this.getNodeParameter('additionalFields', index, {}) as IDataObject;

  const featureId = additionalFields.featureId as string | undefined;
  const pipeline = buildFeatureEventsAggregation(startDate, endDate, featureId);
  const body = buildAggregationRequest(pipeline);
  const response = await pendoApiRequest.call(this, 'POST', '/aggregation', body as IDataObject);

  return [{ json: response as IDataObject }];
}

/**
 * Get guide interaction events
 */
export async function getGuideEvents(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const startDate = this.getNodeParameter('startDate', index) as string;
  const endDate = this.getNodeParameter('endDate', index) as string;
  const additionalFields = this.getNodeParameter('additionalFields', index, {}) as IDataObject;

  const guideId = additionalFields.guideId as string | undefined;
  const pipeline = buildGuideEventsAggregation(startDate, endDate, guideId);
  const body = buildAggregationRequest(pipeline);
  const response = await pendoApiRequest.call(this, 'POST', '/aggregation', body as IDataObject);

  return [{ json: response as IDataObject }];
}

/**
 * Get track events
 */
export async function getTrackEvents(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const startDate = this.getNodeParameter('startDate', index) as string;
  const endDate = this.getNodeParameter('endDate', index) as string;
  const additionalFields = this.getNodeParameter('additionalFields', index, {}) as IDataObject;

  const pipeline: IDataObject[] = [
    {
      source: {
        trackEvents: additionalFields.trackTypeId
          ? { trackTypeId: additionalFields.trackTypeId }
          : {},
        timeSeries: {
          period: 'dayRange',
          first: formatDateForPendo(startDate),
          last: formatDateForPendo(endDate),
        },
      },
    },
    {
      group: {
        group: ['trackTypeId'],
      },
    },
    {
      reduce: [{ count: { count: 'visitorId' } }],
    },
  ];

  const body = buildAggregationRequest(pipeline);
  const response = await pendoApiRequest.call(this, 'POST', '/aggregation', body as IDataObject);

  return [{ json: response as IDataObject }];
}

/**
 * Get visitor activity summary
 */
export async function getVisitorActivity(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const visitorId = this.getNodeParameter('visitorId', index) as string;
  const startDate = this.getNodeParameter('startDate', index) as string;
  const endDate = this.getNodeParameter('endDate', index) as string;

  const pipeline: IDataObject[] = [
    {
      source: {
        pageEvents: {
          visitorId,
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
        { pageViews: { count: 'pageId' } },
        { uniquePages: { countUnique: 'pageId' } },
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
 * Get poll response events
 */
export async function getPollEvents(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const startDate = this.getNodeParameter('startDate', index) as string;
  const endDate = this.getNodeParameter('endDate', index) as string;
  const additionalFields = this.getNodeParameter('additionalFields', index, {}) as IDataObject;

  const pollSource: IDataObject = {};
  if (additionalFields.guideId) {
    pollSource.guideId = additionalFields.guideId;
  }
  if (additionalFields.pollId) {
    pollSource.pollId = additionalFields.pollId;
  }

  const pipeline: IDataObject[] = [
    {
      source: {
        pollEvents: pollSource,
        timeSeries: {
          period: 'dayRange',
          first: formatDateForPendo(startDate),
          last: formatDateForPendo(endDate),
        },
      },
    },
    {
      group: {
        group: ['guideId', 'pollId'],
      },
    },
    {
      reduce: [
        { responses: { count: 'visitorId' } },
        { uniqueRespondents: { countUnique: 'visitorId' } },
      ],
    },
  ];

  const body = buildAggregationRequest(pipeline);
  const response = await pendoApiRequest.call(this, 'POST', '/aggregation', body as IDataObject);

  return [{ json: response as IDataObject }];
}

/**
 * Get account activity summary
 */
export async function getAccountActivity(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const accountId = this.getNodeParameter('accountId', index) as string;
  const startDate = this.getNodeParameter('startDate', index) as string;
  const endDate = this.getNodeParameter('endDate', index) as string;

  const pipeline: IDataObject[] = [
    {
      source: {
        pageEvents: {
          accountId,
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
        { pageViews: { count: 'pageId' } },
        { uniquePages: { countUnique: 'pageId' } },
        { activeVisitors: { countUnique: 'visitorId' } },
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
 * Run a time series aggregation
 */
export async function runTimeSeries(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const source = this.getNodeParameter('source', index) as string;
  const period = this.getNodeParameter('period', index) as string;
  const startDate = this.getNodeParameter('startDate', index) as string;
  const count = this.getNodeParameter('count', index) as number;
  const additionalFields = this.getNodeParameter('additionalFields', index, {}) as IDataObject;

  const sourceConfig: IDataObject = {};
  sourceConfig[source] = additionalFields.sourceFilters
    ? parseJsonInput(additionalFields.sourceFilters as string, 'sourceFilters')
    : {};

  const pipeline: IDataObject[] = [
    {
      source: {
        ...sourceConfig,
        timeSeries: {
          period,
          first: formatDateForPendo(startDate),
          count,
        },
      },
    },
    {
      group: {
        group: [period === 'dayRange' ? 'day' : period === 'hourRange' ? 'hour' : 'minute'],
      },
    },
    {
      reduce: [
        { count: { count: 'visitorId' } },
        { uniqueVisitors: { countUnique: 'visitorId' } },
      ],
    },
    {
      sort: [period === 'dayRange' ? 'day' : period === 'hourRange' ? 'hour' : 'minute'],
    },
  ];

  const body = buildAggregationRequest(pipeline);
  const response = await pendoApiRequest.call(this, 'POST', '/aggregation', body as IDataObject);

  return [{ json: response as IDataObject }];
}
