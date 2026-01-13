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
 * Get a single visitor by ID
 */
export async function get(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const visitorId = this.getNodeParameter('visitorId', index) as string;

  const response = await pendoApiRequest.call(this, 'GET', `/visitor/${encodeURIComponent(visitorId)}`);

  return [{ json: response as IDataObject }];
}

/**
 * Get multiple visitors
 */
export async function getMany(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const returnAll = this.getNodeParameter('returnAll', index) as boolean;
  const additionalFields = this.getNodeParameter('additionalFields', index, {}) as IDataObject;

  const query: IDataObject = {};

  if (additionalFields.segment) {
    query.segment = additionalFields.segment;
  }

  if (additionalFields.accountId) {
    query.accountId = additionalFields.accountId;
  }

  if (returnAll) {
    const response = await pendoApiRequestAllItems.call(
      this,
      'GET',
      '/visitor',
      undefined,
      query,
    );
    return response.map((item) => ({ json: item }));
  } else {
    const limit = this.getNodeParameter('limit', index) as number;
    query.limit = limit;

    const response = await pendoApiRequest.call(this, 'GET', '/visitor', undefined, query);
    const items = Array.isArray(response) ? response : [response];
    return items.map((item) => ({ json: item }));
  }
}

/**
 * Update visitor metadata
 */
export async function update(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const visitorId = this.getNodeParameter('visitorId', index) as string;
  const updateFields = this.getNodeParameter('updateFields', index, {}) as IDataObject;

  const body: IDataObject = {
    visitorId,
  };

  if (updateFields.metadata) {
    const metadataString = updateFields.metadata as string;
    body.metadata = parseJsonInput(metadataString, 'metadata');
  }

  if (updateFields.accountId) {
    body.accountId = updateFields.accountId;
  }

  const cleanedBody = cleanObject(body);
  const response = await pendoApiRequest.call(
    this,
    'PUT',
    `/visitor/${encodeURIComponent(visitorId)}`,
    cleanedBody,
  );

  return [{ json: response as IDataObject }];
}

/**
 * Delete visitors (bulk operation)
 */
export async function deleteVisitor(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const visitorIds = this.getNodeParameter('visitorIds', index) as string;
  const visitorIdArray = visitorIds.split(',').map((id) => id.trim());

  const body: IDataObject = {
    visitorIds: visitorIdArray,
  };

  const response = await pendoApiRequest.call(this, 'POST', '/visitor/delete', body);

  return [{ json: response as IDataObject }];
}

/**
 * Search visitors by metadata
 */
export async function search(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const returnAll = this.getNodeParameter('returnAll', index) as boolean;
  const filterJson = this.getNodeParameter('filter', index) as string;

  const filter = parseJsonInput(filterJson, 'filter');

  const body: IDataObject = {
    filter,
  };

  if (returnAll) {
    const response = await pendoApiRequestAllItems.call(
      this,
      'POST',
      '/visitor/search',
      body,
    );
    return response.map((item) => ({ json: item }));
  } else {
    const limit = this.getNodeParameter('limit', index) as number;
    const query: IDataObject = { limit };

    const response = await pendoApiRequest.call(this, 'POST', '/visitor/search', body, query);
    const items = Array.isArray(response) ? response : (response as IDataObject).results || [response];
    return (items as IDataObject[]).map((item) => ({ json: item }));
  }
}

/**
 * Get visitor event history
 */
export async function getHistory(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const visitorId = this.getNodeParameter('visitorId', index) as string;
  const options = this.getNodeParameter('options', index, {}) as IDataObject;

  const query: IDataObject = {};
  if (options.startDate) {
    query.startDate = new Date(options.startDate as string).getTime();
  }
  if (options.endDate) {
    query.endDate = new Date(options.endDate as string).getTime();
  }
  if (options.limit) {
    query.limit = options.limit;
  }

  const response = await pendoApiRequest.call(
    this,
    'GET',
    `/visitor/${encodeURIComponent(visitorId)}/history`,
    undefined,
    query,
  );

  return [{ json: response as IDataObject }];
}

/**
 * Get visitor guide interaction history
 */
export async function getGuideHistory(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const visitorId = this.getNodeParameter('visitorId', index) as string;
  const options = this.getNodeParameter('options', index, {}) as IDataObject;

  const query: IDataObject = {};
  if (options.guideId) {
    query.guideId = options.guideId;
  }

  const response = await pendoApiRequest.call(
    this,
    'GET',
    `/visitor/${encodeURIComponent(visitorId)}/guide/history`,
    undefined,
    query,
  );

  return [{ json: response as IDataObject }];
}

/**
 * Merge duplicate visitors
 */
export async function merge(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const sourceVisitorId = this.getNodeParameter('sourceVisitorId', index) as string;
  const targetVisitorId = this.getNodeParameter('targetVisitorId', index) as string;

  const body: IDataObject = {
    sourceVisitorId,
    targetVisitorId,
  };

  const response = await pendoApiRequest.call(this, 'POST', '/visitor/merge', body);

  return [{ json: response as IDataObject }];
}

/**
 * Get accounts associated with a visitor
 */
export async function getAccounts(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const visitorId = this.getNodeParameter('visitorId', index) as string;

  const response = await pendoApiRequest.call(
    this,
    'GET',
    `/visitor/${encodeURIComponent(visitorId)}/account`,
  );

  const items = Array.isArray(response) ? response : [response];
  return items.map((item) => ({ json: item as IDataObject }));
}
