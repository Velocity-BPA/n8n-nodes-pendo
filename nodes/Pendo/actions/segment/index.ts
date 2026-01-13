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
 * Get a single segment by ID
 */
export async function get(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const segmentId = this.getNodeParameter('segmentId', index) as string;

  const response = await pendoApiRequest.call(this, 'GET', `/segment/${encodeURIComponent(segmentId)}`);

  return [{ json: response as IDataObject }];
}

/**
 * Get multiple segments
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
      '/segment',
      undefined,
      query,
    );
    return response.map((item) => ({ json: item }));
  } else {
    const limit = this.getNodeParameter('limit', index) as number;
    query.limit = limit;

    const response = await pendoApiRequest.call(this, 'GET', '/segment', undefined, query);
    const items = Array.isArray(response) ? response : [response];
    return items.map((item) => ({ json: item }));
  }
}

/**
 * Create a new segment
 */
export async function create(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const name = this.getNodeParameter('name', index) as string;
  const definitionJson = this.getNodeParameter('definition', index) as string;
  const additionalFields = this.getNodeParameter('additionalFields', index, {}) as IDataObject;

  const definition = parseJsonInput(definitionJson, 'definition');

  const body: IDataObject = {
    name,
    definition,
  };

  if (additionalFields.appId) {
    body.appId = additionalFields.appId;
  }

  if (additionalFields.shared !== undefined) {
    body.shared = additionalFields.shared;
  }

  const cleanedBody = cleanObject(body);
  const response = await pendoApiRequest.call(this, 'POST', '/segment', cleanedBody);

  return [{ json: response as IDataObject }];
}

/**
 * Update a segment
 */
export async function update(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const segmentId = this.getNodeParameter('segmentId', index) as string;
  const updateFields = this.getNodeParameter('updateFields', index, {}) as IDataObject;

  const body: IDataObject = {};

  if (updateFields.name) {
    body.name = updateFields.name;
  }

  if (updateFields.definition) {
    body.definition = parseJsonInput(updateFields.definition as string, 'definition');
  }

  if (updateFields.shared !== undefined) {
    body.shared = updateFields.shared;
  }

  const cleanedBody = cleanObject(body);
  const response = await pendoApiRequest.call(
    this,
    'PUT',
    `/segment/${encodeURIComponent(segmentId)}`,
    cleanedBody,
  );

  return [{ json: response as IDataObject }];
}

/**
 * Delete a segment
 */
export async function deleteSegment(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const segmentId = this.getNodeParameter('segmentId', index) as string;

  const response = await pendoApiRequest.call(
    this,
    'DELETE',
    `/segment/${encodeURIComponent(segmentId)}`,
  );

  return [{ json: response as IDataObject }];
}

/**
 * Get segment members (visitors/accounts)
 */
export async function getMembers(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const segmentId = this.getNodeParameter('segmentId', index) as string;
  const memberType = this.getNodeParameter('memberType', index) as string;
  const returnAll = this.getNodeParameter('returnAll', index) as boolean;

  const endpoint = memberType === 'account'
    ? `/segment/${encodeURIComponent(segmentId)}/account`
    : `/segment/${encodeURIComponent(segmentId)}/visitor`;

  if (returnAll) {
    const response = await pendoApiRequestAllItems.call(
      this,
      'GET',
      endpoint,
    );
    return response.map((item) => ({ json: item }));
  } else {
    const limit = this.getNodeParameter('limit', index) as number;
    const query: IDataObject = { limit };

    const response = await pendoApiRequest.call(this, 'GET', endpoint, undefined, query);
    const items = Array.isArray(response) ? response : [response];
    return items.map((item) => ({ json: item as IDataObject }));
  }
}

/**
 * Get segment member count
 */
export async function getSize(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const segmentId = this.getNodeParameter('segmentId', index) as string;

  const response = await pendoApiRequest.call(
    this,
    'GET',
    `/segment/${encodeURIComponent(segmentId)}/size`,
  );

  return [{ json: response as IDataObject }];
}

/**
 * Clone a segment
 */
export async function clone(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const segmentId = this.getNodeParameter('segmentId', index) as string;
  const newName = this.getNodeParameter('newName', index) as string;

  // First get the segment
  const originalSegment = await pendoApiRequest.call(
    this,
    'GET',
    `/segment/${encodeURIComponent(segmentId)}`,
  ) as IDataObject;

  // Create a new segment with the same definition
  const body: IDataObject = {
    name: newName,
    definition: originalSegment.definition,
  };

  if (originalSegment.appId) {
    body.appId = originalSegment.appId;
  }

  const response = await pendoApiRequest.call(this, 'POST', '/segment', body);

  return [{ json: response as IDataObject }];
}

/**
 * Get guides using a segment
 */
export async function getGuides(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const segmentId = this.getNodeParameter('segmentId', index) as string;

  const query: IDataObject = {
    segment: segmentId,
  };

  const response = await pendoApiRequest.call(this, 'GET', '/guide', undefined, query);
  const items = Array.isArray(response) ? response : [response];
  return items.map((item) => ({ json: item as IDataObject }));
}
