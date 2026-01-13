/**
 * n8n-nodes-pendo
 * Copyright © 2025 Velocity BPA
 *
 * Licensed under the Business Source License 1.1 (BSL 1.1).
 * You may not use this file except in compliance with the License.
 * Commercial use requires a license from Velocity BPA.
 *
 * See LICENSE file for details.
 * Contact: licensing@velobpa.com
 */

import type { INodeProperties } from 'n8n-workflow';

export const featureOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['feature'],
      },
    },
    options: [
      {
        name: 'Create',
        value: 'create',
        description: 'Create a new feature tag',
        action: 'Create a feature',
      },
      {
        name: 'Delete',
        value: 'delete',
        description: 'Delete a feature tag',
        action: 'Delete a feature',
      },
      {
        name: 'Get',
        value: 'get',
        description: 'Get a feature by ID',
        action: 'Get a feature',
      },
      {
        name: 'Get Adoption',
        value: 'getAdoption',
        description: 'Get feature adoption data',
        action: 'Get feature adoption',
      },
      {
        name: 'Get Analytics',
        value: 'getAnalytics',
        description: 'Get feature click metrics',
        action: 'Get feature analytics',
      },
      {
        name: 'Get Many',
        value: 'getMany',
        description: 'Get many features',
        action: 'Get many features',
      },
      {
        name: 'Update',
        value: 'update',
        description: 'Update a feature definition',
        action: 'Update a feature',
      },
    ],
    default: 'getMany',
  },
];

export const featureFields: INodeProperties[] = [
  // ----------------------------------
  //         feature:get
  // ----------------------------------
  {
    displayName: 'Feature ID',
    name: 'featureId',
    type: 'string',
    required: true,
    displayOptions: {
      show: {
        resource: ['feature'],
        operation: ['get', 'delete', 'update', 'getAnalytics', 'getAdoption'],
      },
    },
    default: '',
    description: 'The ID of the feature',
  },

  // ----------------------------------
  //         feature:getMany
  // ----------------------------------
  {
    displayName: 'Return All',
    name: 'returnAll',
    type: 'boolean',
    displayOptions: {
      show: {
        resource: ['feature'],
        operation: ['getMany'],
      },
    },
    default: false,
    description: 'Whether to return all results or only up to a given limit',
  },
  {
    displayName: 'Limit',
    name: 'limit',
    type: 'number',
    displayOptions: {
      show: {
        resource: ['feature'],
        operation: ['getMany'],
        returnAll: [false],
      },
    },
    typeOptions: {
      minValue: 1,
      maxValue: 100,
    },
    default: 50,
    description: 'Max number of results to return',
  },
  {
    displayName: 'Filters',
    name: 'filters',
    type: 'collection',
    placeholder: 'Add Filter',
    displayOptions: {
      show: {
        resource: ['feature'],
        operation: ['getMany'],
      },
    },
    default: {},
    options: [
      {
        displayName: 'App ID',
        name: 'appId',
        type: 'string',
        default: '',
        description: 'Filter by application ID',
      },
      {
        displayName: 'Page ID',
        name: 'pageId',
        type: 'string',
        default: '',
        description: 'Filter by associated page ID',
      },
    ],
  },

  // ----------------------------------
  //         feature:create
  // ----------------------------------
  {
    displayName: 'Name',
    name: 'name',
    type: 'string',
    required: true,
    displayOptions: {
      show: {
        resource: ['feature'],
        operation: ['create'],
      },
    },
    default: '',
    description: 'The display name for the feature',
  },
  {
    displayName: 'Selector (JSON)',
    name: 'selector',
    type: 'json',
    required: true,
    displayOptions: {
      show: {
        resource: ['feature'],
        operation: ['create'],
      },
    },
    default: '{\n  "css": "#my-button"\n}',
    description: 'Element selector definition as JSON',
  },
  {
    displayName: 'Additional Fields',
    name: 'additionalFields',
    type: 'collection',
    placeholder: 'Add Field',
    displayOptions: {
      show: {
        resource: ['feature'],
        operation: ['create'],
      },
    },
    default: {},
    options: [
      {
        displayName: 'App ID',
        name: 'appId',
        type: 'string',
        default: '',
        description: 'The application ID this feature belongs to',
      },
      {
        displayName: 'Color',
        name: 'color',
        type: 'string',
        default: '',
        description: 'Color code for the feature in the UI',
      },
      {
        displayName: 'Page ID',
        name: 'pageId',
        type: 'string',
        default: '',
        description: 'Associated page ID',
      },
    ],
  },

  // ----------------------------------
  //         feature:update
  // ----------------------------------
  {
    displayName: 'Update Fields',
    name: 'updateFields',
    type: 'collection',
    placeholder: 'Add Field',
    displayOptions: {
      show: {
        resource: ['feature'],
        operation: ['update'],
      },
    },
    default: {},
    options: [
      {
        displayName: 'Color',
        name: 'color',
        type: 'string',
        default: '',
        description: 'Color code for the feature in the UI',
      },
      {
        displayName: 'Name',
        name: 'name',
        type: 'string',
        default: '',
        description: 'The display name for the feature',
      },
      {
        displayName: 'Page ID',
        name: 'pageId',
        type: 'string',
        default: '',
        description: 'Associated page ID',
      },
      {
        displayName: 'Selector (JSON)',
        name: 'selector',
        type: 'json',
        default: '',
        description: 'Element selector definition as JSON',
      },
    ],
  },

  // ----------------------------------
  //         feature:getAnalytics / getAdoption
  // ----------------------------------
  {
    displayName: 'Start Date',
    name: 'startDate',
    type: 'dateTime',
    required: true,
    displayOptions: {
      show: {
        resource: ['feature'],
        operation: ['getAnalytics', 'getAdoption'],
      },
    },
    default: '',
    description: 'Start date for analytics data',
  },
  {
    displayName: 'End Date',
    name: 'endDate',
    type: 'dateTime',
    required: true,
    displayOptions: {
      show: {
        resource: ['feature'],
        operation: ['getAnalytics', 'getAdoption'],
      },
    },
    default: '',
    description: 'End date for analytics data',
  },
];
