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

export const reportOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['report'],
      },
    },
    options: [
      {
        name: 'Create',
        value: 'create',
        description: 'Create a custom report',
        action: 'Create a report',
      },
      {
        name: 'Delete',
        value: 'delete',
        description: 'Delete a report',
        action: 'Delete a report',
      },
      {
        name: 'Export',
        value: 'export',
        description: 'Export report data',
        action: 'Export a report',
      },
      {
        name: 'Get',
        value: 'get',
        description: 'Get a report by ID',
        action: 'Get a report',
      },
      {
        name: 'Get Many',
        value: 'getMany',
        description: 'Get many reports',
        action: 'Get many reports',
      },
      {
        name: 'Run',
        value: 'run',
        description: 'Execute report and get data',
        action: 'Run a report',
      },
      {
        name: 'Schedule',
        value: 'schedule',
        description: 'Set up report schedule',
        action: 'Schedule a report',
      },
      {
        name: 'Update',
        value: 'update',
        description: 'Update report configuration',
        action: 'Update a report',
      },
    ],
    default: 'getMany',
  },
];

export const reportFields: INodeProperties[] = [
  // ----------------------------------
  //         report:get
  // ----------------------------------
  {
    displayName: 'Report ID',
    name: 'reportId',
    type: 'string',
    required: true,
    displayOptions: {
      show: {
        resource: ['report'],
        operation: ['get', 'delete', 'update', 'run', 'export', 'schedule'],
      },
    },
    default: '',
    description: 'The ID of the report',
  },

  // ----------------------------------
  //         report:getMany
  // ----------------------------------
  {
    displayName: 'Return All',
    name: 'returnAll',
    type: 'boolean',
    displayOptions: {
      show: {
        resource: ['report'],
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
        resource: ['report'],
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
        resource: ['report'],
        operation: ['getMany'],
      },
    },
    default: {},
    options: [
      {
        displayName: 'Type',
        name: 'type',
        type: 'options',
        options: [
          { name: 'All', value: '' },
          { name: 'Funnel', value: 'funnel' },
          { name: 'Path', value: 'path' },
          { name: 'Retention', value: 'retention' },
          { name: 'Custom', value: 'custom' },
        ],
        default: '',
        description: 'Filter by report type',
      },
    ],
  },

  // ----------------------------------
  //         report:create
  // ----------------------------------
  {
    displayName: 'Name',
    name: 'name',
    type: 'string',
    required: true,
    displayOptions: {
      show: {
        resource: ['report'],
        operation: ['create'],
      },
    },
    default: '',
    description: 'The name of the report',
  },
  {
    displayName: 'Type',
    name: 'type',
    type: 'options',
    required: true,
    displayOptions: {
      show: {
        resource: ['report'],
        operation: ['create'],
      },
    },
    options: [
      { name: 'Funnel', value: 'funnel' },
      { name: 'Path', value: 'path' },
      { name: 'Retention', value: 'retention' },
      { name: 'Custom', value: 'custom' },
    ],
    default: 'funnel',
    description: 'The type of report',
  },
  {
    displayName: 'Configuration (JSON)',
    name: 'configuration',
    type: 'json',
    required: true,
    displayOptions: {
      show: {
        resource: ['report'],
        operation: ['create'],
      },
    },
    default: '{}',
    description: 'Report configuration as JSON',
  },
  {
    displayName: 'Additional Fields',
    name: 'additionalFields',
    type: 'collection',
    placeholder: 'Add Field',
    displayOptions: {
      show: {
        resource: ['report'],
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
        description: 'The application ID for this report',
      },
      {
        displayName: 'Description',
        name: 'description',
        type: 'string',
        default: '',
        description: 'Description of the report',
      },
    ],
  },

  // ----------------------------------
  //         report:update
  // ----------------------------------
  {
    displayName: 'Update Fields',
    name: 'updateFields',
    type: 'collection',
    placeholder: 'Add Field',
    displayOptions: {
      show: {
        resource: ['report'],
        operation: ['update'],
      },
    },
    default: {},
    options: [
      {
        displayName: 'Configuration (JSON)',
        name: 'configuration',
        type: 'json',
        default: '',
        description: 'Report configuration as JSON',
      },
      {
        displayName: 'Description',
        name: 'description',
        type: 'string',
        default: '',
        description: 'Description of the report',
      },
      {
        displayName: 'Name',
        name: 'name',
        type: 'string',
        default: '',
        description: 'The name of the report',
      },
    ],
  },

  // ----------------------------------
  //         report:run
  // ----------------------------------
  {
    displayName: 'Date Range',
    name: 'dateRange',
    type: 'fixedCollection',
    displayOptions: {
      show: {
        resource: ['report'],
        operation: ['run'],
      },
    },
    default: {},
    options: [
      {
        name: 'range',
        displayName: 'Date Range',
        values: [
          {
            displayName: 'Start Date',
            name: 'startDate',
            type: 'dateTime',
            default: '',
            description: 'Start date for the report',
          },
          {
            displayName: 'End Date',
            name: 'endDate',
            type: 'dateTime',
            default: '',
            description: 'End date for the report',
          },
        ],
      },
    ],
    description: 'Date range for the report execution',
  },

  // ----------------------------------
  //         report:export
  // ----------------------------------
  {
    displayName: 'Format',
    name: 'format',
    type: 'options',
    displayOptions: {
      show: {
        resource: ['report'],
        operation: ['export'],
      },
    },
    options: [
      { name: 'JSON', value: 'json' },
      { name: 'CSV', value: 'csv' },
      { name: 'PDF', value: 'pdf' },
    ],
    default: 'json',
    description: 'Export format',
  },
  {
    displayName: 'Options',
    name: 'options',
    type: 'collection',
    placeholder: 'Add Option',
    displayOptions: {
      show: {
        resource: ['report'],
        operation: ['export'],
      },
    },
    default: {},
    options: [
      {
        displayName: 'Start Date',
        name: 'startDate',
        type: 'dateTime',
        default: '',
        description: 'Export data from this date',
      },
      {
        displayName: 'End Date',
        name: 'endDate',
        type: 'dateTime',
        default: '',
        description: 'Export data until this date',
      },
    ],
  },

  // ----------------------------------
  //         report:schedule
  // ----------------------------------
  {
    displayName: 'Schedule Configuration',
    name: 'scheduleConfig',
    type: 'fixedCollection',
    displayOptions: {
      show: {
        resource: ['report'],
        operation: ['schedule'],
      },
    },
    default: {},
    options: [
      {
        name: 'schedule',
        displayName: 'Schedule',
        values: [
          {
            displayName: 'Frequency',
            name: 'frequency',
            type: 'options',
            options: [
              { name: 'Daily', value: 'daily' },
              { name: 'Weekly', value: 'weekly' },
              { name: 'Monthly', value: 'monthly' },
            ],
            default: 'weekly',
            description: 'How often to run the report',
          },
          {
            displayName: 'Recipients',
            name: 'recipients',
            type: 'string',
            default: '',
            description: 'Comma-separated email addresses',
          },
          {
            displayName: 'Format',
            name: 'format',
            type: 'options',
            options: [
              { name: 'PDF', value: 'pdf' },
              { name: 'CSV', value: 'csv' },
            ],
            default: 'pdf',
            description: 'Report format for delivery',
          },
          {
            displayName: 'Enabled',
            name: 'enabled',
            type: 'boolean',
            default: true,
            description: 'Whether the schedule is active',
          },
        ],
      },
    ],
    description: 'Schedule configuration for the report',
  },
];
