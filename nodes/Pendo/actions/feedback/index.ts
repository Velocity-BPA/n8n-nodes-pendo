/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, IDataObject, INodeExecutionData } from 'n8n-workflow';
import { pendoFeedbackApiRequest } from '../../transport/pendoApi';
import { cleanObject } from '../../utils/helpers';

/**
 * Get a single feedback request by ID
 */
export async function get(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const requestId = this.getNodeParameter('requestId', index) as string;

  const response = await pendoFeedbackApiRequest.call(
    this,
    'GET',
    `/requests/${encodeURIComponent(requestId)}`,
  );

  return [{ json: response as IDataObject }];
}

/**
 * Get multiple feedback requests
 */
export async function getMany(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const returnAll = this.getNodeParameter('returnAll', index) as boolean;
  const additionalFields = this.getNodeParameter('additionalFields', index, {}) as IDataObject;

  const query: IDataObject = {};

  if (additionalFields.status) {
    query.status = additionalFields.status;
  }

  if (additionalFields.productArea) {
    query.productArea = additionalFields.productArea;
  }

  if (additionalFields.sortBy) {
    query.sortBy = additionalFields.sortBy;
  }

  if (!returnAll) {
    const limit = this.getNodeParameter('limit', index) as number;
    query.limit = limit;
  }

  const response = await pendoFeedbackApiRequest.call(this, 'GET', '/requests', undefined, query);
  const items = Array.isArray(response) ? response : [response];

  return items.map((item) => ({ json: item }));
}

/**
 * Create a new feedback request
 */
export async function create(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const title = this.getNodeParameter('title', index) as string;
  const additionalFields = this.getNodeParameter('additionalFields', index, {}) as IDataObject;

  const body: IDataObject = {
    title,
  };

  if (additionalFields.description) {
    body.description = additionalFields.description;
  }

  if (additionalFields.status) {
    body.status = additionalFields.status;
  }

  if (additionalFields.priority) {
    body.priority = additionalFields.priority;
  }

  if (additionalFields.productArea) {
    body.productArea = additionalFields.productArea;
  }

  if (additionalFields.tags) {
    const tagsString = additionalFields.tags as string;
    body.tags = tagsString.split(',').map((tag) => tag.trim());
  }

  if (additionalFields.externalUrl) {
    body.externalUrl = additionalFields.externalUrl;
  }

  const cleanedBody = cleanObject(body);
  const response = await pendoFeedbackApiRequest.call(this, 'POST', '/requests', cleanedBody);

  return [{ json: response as IDataObject }];
}

/**
 * Update a feedback request
 */
export async function update(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const requestId = this.getNodeParameter('requestId', index) as string;
  const updateFields = this.getNodeParameter('updateFields', index, {}) as IDataObject;

  const body: IDataObject = {};

  if (updateFields.title) {
    body.title = updateFields.title;
  }

  if (updateFields.description) {
    body.description = updateFields.description;
  }

  if (updateFields.status) {
    body.status = updateFields.status;
  }

  if (updateFields.priority) {
    body.priority = updateFields.priority;
  }

  if (updateFields.productArea) {
    body.productArea = updateFields.productArea;
  }

  if (updateFields.tags) {
    const tagsString = updateFields.tags as string;
    body.tags = tagsString.split(',').map((tag) => tag.trim());
  }

  const cleanedBody = cleanObject(body);
  const response = await pendoFeedbackApiRequest.call(
    this,
    'PUT',
    `/requests/${encodeURIComponent(requestId)}`,
    cleanedBody,
  );

  return [{ json: response as IDataObject }];
}

/**
 * Get votes on a feedback request
 */
export async function getVotes(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const requestId = this.getNodeParameter('requestId', index) as string;

  const response = await pendoFeedbackApiRequest.call(
    this,
    'GET',
    `/requests/${encodeURIComponent(requestId)}/votes`,
  );

  const items = Array.isArray(response) ? response : [response];
  return items.map((item) => ({ json: item }));
}

/**
 * Delete a feedback request
 */
export async function deleteRequest(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const requestId = this.getNodeParameter('requestId', index) as string;

  const response = await pendoFeedbackApiRequest.call(
    this,
    'DELETE',
    `/requests/${encodeURIComponent(requestId)}`,
  );

  return [{ json: response as IDataObject }];
}

/**
 * Add a vote to a feedback request
 */
export async function addVote(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const requestId = this.getNodeParameter('requestId', index) as string;
  const additionalFields = this.getNodeParameter('additionalFields', index, {}) as IDataObject;

  const body: IDataObject = {};

  if (additionalFields.visitorId) {
    body.visitorId = additionalFields.visitorId;
  }

  if (additionalFields.accountId) {
    body.accountId = additionalFields.accountId;
  }

  if (additionalFields.weight) {
    body.weight = additionalFields.weight;
  }

  const cleanedBody = cleanObject(body);
  const response = await pendoFeedbackApiRequest.call(
    this,
    'POST',
    `/requests/${encodeURIComponent(requestId)}/votes`,
    cleanedBody,
  );

  return [{ json: response as IDataObject }];
}

/**
 * Remove a vote from a feedback request
 */
export async function removeVote(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const requestId = this.getNodeParameter('requestId', index) as string;
  const voteId = this.getNodeParameter('voteId', index) as string;

  const response = await pendoFeedbackApiRequest.call(
    this,
    'DELETE',
    `/requests/${encodeURIComponent(requestId)}/votes/${encodeURIComponent(voteId)}`,
  );

  return [{ json: response as IDataObject }];
}

/**
 * Get comments on a feedback request
 */
export async function getComments(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const requestId = this.getNodeParameter('requestId', index) as string;

  const response = await pendoFeedbackApiRequest.call(
    this,
    'GET',
    `/requests/${encodeURIComponent(requestId)}/comments`,
  );

  const items = Array.isArray(response) ? response : [response];
  return items.map((item) => ({ json: item as IDataObject }));
}

/**
 * Add a comment to a feedback request
 */
export async function addComment(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const requestId = this.getNodeParameter('requestId', index) as string;
  const content = this.getNodeParameter('content', index) as string;
  const additionalFields = this.getNodeParameter('additionalFields', index, {}) as IDataObject;

  const body: IDataObject = {
    content,
  };

  if (additionalFields.visitorId) {
    body.visitorId = additionalFields.visitorId;
  }

  if (additionalFields.isInternal !== undefined) {
    body.isInternal = additionalFields.isInternal;
  }

  const cleanedBody = cleanObject(body);
  const response = await pendoFeedbackApiRequest.call(
    this,
    'POST',
    `/requests/${encodeURIComponent(requestId)}/comments`,
    cleanedBody,
  );

  return [{ json: response as IDataObject }];
}

/**
 * Get the status of a feedback request
 */
export async function getStatus(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const requestId = this.getNodeParameter('requestId', index) as string;

  const response = await pendoFeedbackApiRequest.call(
    this,
    'GET',
    `/requests/${encodeURIComponent(requestId)}`,
  ) as IDataObject;

  // Return just the status-related fields
  const statusInfo: IDataObject = {
    id: response.id,
    status: response.status,
    priority: response.priority,
    createdAt: response.createdAt,
    updatedAt: response.updatedAt,
  };

  return [{ json: statusInfo }];
}
