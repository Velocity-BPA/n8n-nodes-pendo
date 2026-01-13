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
 * Get a single account by ID
 */
export async function get(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const accountId = this.getNodeParameter('accountId', index) as string;

  const response = await pendoApiRequest.call(this, 'GET', `/account/${encodeURIComponent(accountId)}`);

  return [{ json: response as IDataObject }];
}

/**
 * Get multiple accounts
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

  if (returnAll) {
    const response = await pendoApiRequestAllItems.call(
      this,
      'GET',
      '/account',
      undefined,
      query,
    );
    return response.map((item) => ({ json: item }));
  } else {
    const limit = this.getNodeParameter('limit', index) as number;
    query.limit = limit;

    const response = await pendoApiRequest.call(this, 'GET', '/account', undefined, query);
    const items = Array.isArray(response) ? response : [response];
    return items.map((item) => ({ json: item }));
  }
}

/**
 * Update account metadata
 */
export async function update(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const accountId = this.getNodeParameter('accountId', index) as string;
  const updateFields = this.getNodeParameter('updateFields', index, {}) as IDataObject;

  const body: IDataObject = {
    accountId,
  };

  if (updateFields.metadata) {
    const metadataString = updateFields.metadata as string;
    body.metadata = parseJsonInput(metadataString, 'metadata');
  }

  const cleanedBody = cleanObject(body);
  const response = await pendoApiRequest.call(
    this,
    'PUT',
    `/account/${encodeURIComponent(accountId)}`,
    cleanedBody,
  );

  return [{ json: response as IDataObject }];
}

/**
 * Delete account
 */
export async function deleteAccount(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const accountId = this.getNodeParameter('accountId', index) as string;

  const response = await pendoApiRequest.call(
    this,
    'DELETE',
    `/account/${encodeURIComponent(accountId)}`,
  );

  return [{ json: response as IDataObject }];
}

/**
 * Search accounts by metadata
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
      '/account/search',
      body,
    );
    return response.map((item) => ({ json: item }));
  } else {
    const limit = this.getNodeParameter('limit', index) as number;
    const query: IDataObject = { limit };

    const response = await pendoApiRequest.call(this, 'POST', '/account/search', body, query);
    const items = Array.isArray(response) ? response : (response as IDataObject).results || [response];
    return (items as IDataObject[]).map((item) => ({ json: item }));
  }
}

/**
 * Bulk delete accounts
 */
export async function bulkDelete(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const accountIds = this.getNodeParameter('accountIds', index) as string;
  const accountIdArray = accountIds.split(',').map((id) => id.trim());

  const body: IDataObject = {
    accountIds: accountIdArray,
  };

  const response = await pendoApiRequest.call(this, 'POST', '/account/delete', body);

  return [{ json: response as IDataObject }];
}

/**
 * Get visitors in an account
 */
export async function getVisitors(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const accountId = this.getNodeParameter('accountId', index) as string;
  const returnAll = this.getNodeParameter('returnAll', index) as boolean;

  if (returnAll) {
    const response = await pendoApiRequestAllItems.call(
      this,
      'GET',
      `/account/${encodeURIComponent(accountId)}/visitor`,
    );
    return response.map((item) => ({ json: item }));
  } else {
    const limit = this.getNodeParameter('limit', index) as number;
    const query: IDataObject = { limit };

    const response = await pendoApiRequest.call(
      this,
      'GET',
      `/account/${encodeURIComponent(accountId)}/visitor`,
      undefined,
      query,
    );
    const items = Array.isArray(response) ? response : [response];
    return items.map((item) => ({ json: item as IDataObject }));
  }
}

/**
 * Get account event history
 */
export async function getHistory(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const accountId = this.getNodeParameter('accountId', index) as string;
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
    `/account/${encodeURIComponent(accountId)}/history`,
    undefined,
    query,
  );

  return [{ json: response as IDataObject }];
}

/**
 * Get account guide interaction history
 */
export async function getGuideHistory(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const accountId = this.getNodeParameter('accountId', index) as string;
  const options = this.getNodeParameter('options', index, {}) as IDataObject;

  const query: IDataObject = {};
  if (options.guideId) {
    query.guideId = options.guideId;
  }

  const response = await pendoApiRequest.call(
    this,
    'GET',
    `/account/${encodeURIComponent(accountId)}/guide/history`,
    undefined,
    query,
  );

  return [{ json: response as IDataObject }];
}
