/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, IDataObject, INodeExecutionData } from 'n8n-workflow';
import { pendoApiRequest, pendoApiRequestAllItems } from '../../transport/pendoApi';
import { cleanObject } from '../../utils/helpers';

/**
 * Get a single webhook by ID
 */
export async function get(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const webhookId = this.getNodeParameter('webhookId', index) as string;

  const response = await pendoApiRequest.call(this, 'GET', `/webhook/${encodeURIComponent(webhookId)}`);

  return [{ json: response as IDataObject }];
}

/**
 * Get multiple webhooks
 */
export async function getMany(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const returnAll = this.getNodeParameter('returnAll', index) as boolean;

  if (returnAll) {
    const response = await pendoApiRequestAllItems.call(
      this,
      'GET',
      '/webhook',
    );
    return response.map((item) => ({ json: item }));
  } else {
    const limit = this.getNodeParameter('limit', index) as number;
    const query: IDataObject = { limit };

    const response = await pendoApiRequest.call(this, 'GET', '/webhook', undefined, query);
    const items = Array.isArray(response) ? response : [response];
    return items.map((item) => ({ json: item as IDataObject }));
  }
}

/**
 * Create a new webhook
 */
export async function create(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const url = this.getNodeParameter('url', index) as string;
  const events = this.getNodeParameter('events', index) as string[];
  const additionalFields = this.getNodeParameter('additionalFields', index, {}) as IDataObject;

  const body: IDataObject = {
    url,
    events,
  };

  if (additionalFields.name) {
    body.name = additionalFields.name;
  }

  if (additionalFields.secret) {
    body.secret = additionalFields.secret;
  }

  const cleanedBody = cleanObject(body);
  const response = await pendoApiRequest.call(this, 'POST', '/webhook', cleanedBody);

  return [{ json: response as IDataObject }];
}

/**
 * Update a webhook
 */
export async function update(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const webhookId = this.getNodeParameter('webhookId', index) as string;
  const updateFields = this.getNodeParameter('updateFields', index, {}) as IDataObject;

  const body: IDataObject = {};

  if (updateFields.url) {
    body.url = updateFields.url;
  }

  if (updateFields.events) {
    body.events = updateFields.events;
  }

  if (updateFields.name) {
    body.name = updateFields.name;
  }

  if (updateFields.secret) {
    body.secret = updateFields.secret;
  }

  if (updateFields.enabled !== undefined) {
    body.enabled = updateFields.enabled;
  }

  const cleanedBody = cleanObject(body);
  const response = await pendoApiRequest.call(
    this,
    'PUT',
    `/webhook/${encodeURIComponent(webhookId)}`,
    cleanedBody,
  );

  return [{ json: response as IDataObject }];
}

/**
 * Delete a webhook
 */
export async function deleteWebhook(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const webhookId = this.getNodeParameter('webhookId', index) as string;

  const response = await pendoApiRequest.call(
    this,
    'DELETE',
    `/webhook/${encodeURIComponent(webhookId)}`,
  );

  return [{ json: response as IDataObject }];
}

/**
 * Test a webhook
 */
export async function test(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const webhookId = this.getNodeParameter('webhookId', index) as string;

  const response = await pendoApiRequest.call(
    this,
    'POST',
    `/webhook/${encodeURIComponent(webhookId)}/test`,
  );

  return [{ json: response as IDataObject }];
}

/**
 * Get webhook delivery history
 */
export async function getDeliveries(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const webhookId = this.getNodeParameter('webhookId', index) as string;
  const returnAll = this.getNodeParameter('returnAll', index) as boolean;
  const filters = this.getNodeParameter('filters', index, {}) as IDataObject;

  const query: IDataObject = {};

  if (filters.status) {
    query.status = filters.status;
  }

  if (filters.startDate) {
    query.startDate = new Date(filters.startDate as string).getTime();
  }

  if (filters.endDate) {
    query.endDate = new Date(filters.endDate as string).getTime();
  }

  if (returnAll) {
    const response = await pendoApiRequestAllItems.call(
      this,
      'GET',
      `/webhook/${encodeURIComponent(webhookId)}/deliveries`,
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
      `/webhook/${encodeURIComponent(webhookId)}/deliveries`,
      undefined,
      query,
    );
    const items = Array.isArray(response) ? response : [response];
    return items.map((item) => ({ json: item as IDataObject }));
  }
}
