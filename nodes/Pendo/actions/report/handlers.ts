/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, IDataObject, INodeExecutionData } from 'n8n-workflow';
import { pendoApiRequest, pendoApiRequestAllItems, parseJsonInput } from '../../transport/pendoApi';
import { cleanObject } from '../../utils/helpers';

/**
 * Get a single report by ID
 */
export async function get(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const reportId = this.getNodeParameter('reportId', index) as string;

  const response = await pendoApiRequest.call(this, 'GET', `/report/${encodeURIComponent(reportId)}`);

  return [{ json: response as IDataObject }];
}

/**
 * Get multiple reports
 */
export async function getMany(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const returnAll = this.getNodeParameter('returnAll', index) as boolean;
  const filters = this.getNodeParameter('filters', index, {}) as IDataObject;

  const query: IDataObject = {};

  if (filters.type) {
    query.type = filters.type;
  }

  if (returnAll) {
    const response = await pendoApiRequestAllItems.call(
      this,
      'GET',
      '/report',
      undefined,
      query,
    );
    return response.map((item) => ({ json: item }));
  } else {
    const limit = this.getNodeParameter('limit', index) as number;
    query.limit = limit;

    const response = await pendoApiRequest.call(this, 'GET', '/report', undefined, query);
    const items = Array.isArray(response) ? response : [response];
    return items.map((item) => ({ json: item as IDataObject }));
  }
}

/**
 * Create a new report
 */
export async function create(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const name = this.getNodeParameter('name', index) as string;
  const type = this.getNodeParameter('type', index) as string;
  const configurationJson = this.getNodeParameter('configuration', index) as string;
  const additionalFields = this.getNodeParameter('additionalFields', index, {}) as IDataObject;

  const configuration = parseJsonInput(configurationJson, 'configuration');

  const body: IDataObject = {
    name,
    type,
    configuration,
  };

  if (additionalFields.appId) {
    body.appId = additionalFields.appId;
  }

  if (additionalFields.description) {
    body.description = additionalFields.description;
  }

  const cleanedBody = cleanObject(body);
  const response = await pendoApiRequest.call(this, 'POST', '/report', cleanedBody);

  return [{ json: response as IDataObject }];
}

/**
 * Update a report
 */
export async function update(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const reportId = this.getNodeParameter('reportId', index) as string;
  const updateFields = this.getNodeParameter('updateFields', index, {}) as IDataObject;

  const body: IDataObject = {};

  if (updateFields.name) {
    body.name = updateFields.name;
  }

  if (updateFields.description) {
    body.description = updateFields.description;
  }

  if (updateFields.configuration) {
    body.configuration = parseJsonInput(updateFields.configuration as string, 'configuration');
  }

  const cleanedBody = cleanObject(body);
  const response = await pendoApiRequest.call(
    this,
    'PUT',
    `/report/${encodeURIComponent(reportId)}`,
    cleanedBody,
  );

  return [{ json: response as IDataObject }];
}

/**
 * Delete a report
 */
export async function deleteReport(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const reportId = this.getNodeParameter('reportId', index) as string;

  const response = await pendoApiRequest.call(
    this,
    'DELETE',
    `/report/${encodeURIComponent(reportId)}`,
  );

  return [{ json: response as IDataObject }];
}

/**
 * Run a report
 */
export async function run(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const reportId = this.getNodeParameter('reportId', index) as string;
  const dateRange = this.getNodeParameter('dateRange', index, {}) as IDataObject;

  const query: IDataObject = {};

  if (dateRange.range) {
    const range = dateRange.range as IDataObject;
    if (range.startDate) {
      query.startDate = new Date(range.startDate as string).getTime();
    }
    if (range.endDate) {
      query.endDate = new Date(range.endDate as string).getTime();
    }
  }

  const response = await pendoApiRequest.call(
    this,
    'GET',
    `/report/${encodeURIComponent(reportId)}/run`,
    undefined,
    query,
  );

  return [{ json: response as IDataObject }];
}

/**
 * Export a report
 */
export async function exportReport(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const reportId = this.getNodeParameter('reportId', index) as string;
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
    `/report/${encodeURIComponent(reportId)}/export`,
    undefined,
    query,
  );

  return [{ json: response as IDataObject }];
}

/**
 * Schedule a report
 */
export async function schedule(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const reportId = this.getNodeParameter('reportId', index) as string;
  const scheduleConfig = this.getNodeParameter('scheduleConfig', index, {}) as IDataObject;

  const body: IDataObject = {};

  if (scheduleConfig.schedule) {
    const config = scheduleConfig.schedule as IDataObject;
    body.frequency = config.frequency;
    body.format = config.format;
    body.enabled = config.enabled;

    if (config.recipients) {
      body.recipients = (config.recipients as string).split(',').map((r) => r.trim());
    }
  }

  const cleanedBody = cleanObject(body);
  const response = await pendoApiRequest.call(
    this,
    'PUT',
    `/report/${encodeURIComponent(reportId)}/schedule`,
    cleanedBody,
  );

  return [{ json: response as IDataObject }];
}
