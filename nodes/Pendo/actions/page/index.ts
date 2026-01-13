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

export const pageOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['page'],
      },
    },
    options: [
      {
        name: 'Create',
        value: 'create',
        description: 'Create a new page tag',
        action: 'Create a page',
      },
      {
        name: 'Delete',
        value: 'delete',
        description: 'Delete a page tag',
        action: 'Delete a page',
      },
      {
        name: 'Get',
        value: 'get',
        description: 'Get a page by ID',
        action: 'Get a page',
      },
      {
        name: 'Get Analytics',
        value: 'getAnalytics',
        description: 'Get page view metrics',
        action: 'Get page analytics',
      },
      {
        name: 'Get Many',
        value: 'getMany',
        description: 'Get many pages',
        action: 'Get many pages',
      },
      {
        name: 'Get Rules',
        value: 'getRules',
        description: 'Get page matching rules',
        action: 'Get page rules',
      },
      {
        name: 'Update',
        value: 'update',
        description: 'Update a page definition',
        action: 'Update a page',
      },
    ],
    default: 'getMany',
  },
];

export const pageFields: INodeProperties[] = [
  // ----------------------------------
  //         page:get
  // ----------------------------------
  {
    displayName: 'Page ID',
    name: 'pageId',
    type: 'string',
    required: true,
    displayOptions: {
      show: {
        resource: ['page'],
        operation: ['get', 'delete', 'update', 'getAnalytics', 'getRules'],
      },
    },
    default: '',
    description: 'The ID of the page',
  },

  // ----------------------------------
  //         page:getMany
  // ----------------------------------
  {
    displayName: 'Return All',
    name: 'returnAll',
    type: 'boolean',
    displayOptions: {
      show: {
        resource: ['page'],
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
        resource: ['page'],
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
        resource: ['page'],
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
        displayName: 'Category',
        name: 'category',
        type: 'string',
        default: '',
        description: 'Filter by page category',
      },
    ],
  },

  // ----------------------------------
  //         page:create
  // ----------------------------------
  {
    displayName: 'Name',
    name: 'name',
    type: 'string',
    required: true,
    displayOptions: {
      show: {
        resource: ['page'],
        operation: ['create'],
      },
    },
    default: '',
    description: 'The display name for the page',
  },
  {
    displayName: 'Rules (JSON)',
    name: 'rules',
    type: 'json',
    required: true,
    displayOptions: {
      show: {
        resource: ['page'],
        operation: ['create'],
      },
    },
    default: '[\n  {\n    "rule": "/path/*"\n  }\n]',
    description: 'URL matching rules as JSON array',
  },
  {
    displayName: 'Additional Fields',
    name: 'additionalFields',
    type: 'collection',
    placeholder: 'Add Field',
    displayOptions: {
      show: {
        resource: ['page'],
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
        description: 'The application ID this page belongs to',
      },
      {
        displayName: 'Category',
        name: 'category',
        type: 'string',
        default: '',
        description: 'Category for organizing pages',
      },
      {
        displayName: 'Color',
        name: 'color',
        type: 'string',
        default: '',
        description: 'Color code for the page in the UI',
      },
    ],
  },

  // ----------------------------------
  //         page:update
  // ----------------------------------
  {
    displayName: 'Update Fields',
    name: 'updateFields',
    type: 'collection',
    placeholder: 'Add Field',
    displayOptions: {
      show: {
        resource: ['page'],
        operation: ['update'],
      },
    },
    default: {},
    options: [
      {
        displayName: 'Category',
        name: 'category',
        type: 'string',
        default: '',
        description: 'Category for organizing pages',
      },
      {
        displayName: 'Color',
        name: 'color',
        type: 'string',
        default: '',
        description: 'Color code for the page in the UI',
      },
      {
        displayName: 'Name',
        name: 'name',
        type: 'string',
        default: '',
        description: 'The display name for the page',
      },
      {
        displayName: 'Rules (JSON)',
        name: 'rules',
        type: 'json',
        default: '',
        description: 'URL matching rules as JSON array',
      },
    ],
  },

  // ----------------------------------
  //         page:getAnalytics
  // ----------------------------------
  {
    displayName: 'Start Date',
    name: 'startDate',
    type: 'dateTime',
    required: true,
    displayOptions: {
      show: {
        resource: ['page'],
        operation: ['getAnalytics'],
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
        resource: ['page'],
        operation: ['getAnalytics'],
      },
    },
    default: '',
    description: 'End date for analytics data',
  },
];
