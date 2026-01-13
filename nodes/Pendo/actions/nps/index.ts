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

export const npsOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['nps'],
      },
    },
    options: [
      {
        name: 'Create',
        value: 'create',
        description: 'Create a new NPS survey',
        action: 'Create an NPS survey',
      },
      {
        name: 'Delete',
        value: 'delete',
        description: 'Delete an NPS survey',
        action: 'Delete an NPS survey',
      },
      {
        name: 'Export Data',
        value: 'exportData',
        description: 'Export NPS response data',
        action: 'Export NPS data',
      },
      {
        name: 'Get',
        value: 'get',
        description: 'Get an NPS survey by ID',
        action: 'Get an NPS survey',
      },
      {
        name: 'Get Analytics',
        value: 'getAnalytics',
        description: 'Get NPS score trends',
        action: 'Get NPS analytics',
      },
      {
        name: 'Get Many',
        value: 'getMany',
        description: 'Get many NPS surveys',
        action: 'Get many NPS surveys',
      },
      {
        name: 'Get Responses',
        value: 'getResponses',
        description: 'Get NPS responses for a survey',
        action: 'Get NPS responses',
      },
      {
        name: 'Update',
        value: 'update',
        description: 'Update an NPS survey',
        action: 'Update an NPS survey',
      },
    ],
    default: 'getMany',
  },
];

export const npsFields: INodeProperties[] = [
  // ----------------------------------
  //         nps:get
  // ----------------------------------
  {
    displayName: 'NPS Survey ID',
    name: 'npsId',
    type: 'string',
    required: true,
    displayOptions: {
      show: {
        resource: ['nps'],
        operation: ['get', 'delete', 'update', 'getResponses', 'getAnalytics', 'exportData'],
      },
    },
    default: '',
    description: 'The ID of the NPS survey',
  },

  // ----------------------------------
  //         nps:getMany
  // ----------------------------------
  {
    displayName: 'Return All',
    name: 'returnAll',
    type: 'boolean',
    displayOptions: {
      show: {
        resource: ['nps'],
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
        resource: ['nps'],
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
        resource: ['nps'],
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
        displayName: 'State',
        name: 'state',
        type: 'options',
        options: [
          { name: 'Draft', value: 'draft' },
          { name: 'Staged', value: 'staged' },
          { name: 'Public', value: 'public' },
          { name: 'Disabled', value: 'disabled' },
        ],
        default: '',
        description: 'Filter by survey state',
      },
    ],
  },

  // ----------------------------------
  //         nps:create
  // ----------------------------------
  {
    displayName: 'Name',
    name: 'name',
    type: 'string',
    required: true,
    displayOptions: {
      show: {
        resource: ['nps'],
        operation: ['create'],
      },
    },
    default: '',
    description: 'The name of the NPS survey',
  },
  {
    displayName: 'Question',
    name: 'question',
    type: 'string',
    required: true,
    displayOptions: {
      show: {
        resource: ['nps'],
        operation: ['create'],
      },
    },
    default: 'How likely are you to recommend us to a friend or colleague?',
    description: 'The NPS question text',
  },
  {
    displayName: 'Additional Fields',
    name: 'additionalFields',
    type: 'collection',
    placeholder: 'Add Field',
    displayOptions: {
      show: {
        resource: ['nps'],
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
        description: 'The application ID for this survey',
      },
      {
        displayName: 'Follow-Up Config (JSON)',
        name: 'followUp',
        type: 'json',
        default: '',
        description: 'Follow-up question configuration',
      },
      {
        displayName: 'Targeting (JSON)',
        name: 'targeting',
        type: 'json',
        default: '',
        description: 'Survey targeting rules',
      },
    ],
  },

  // ----------------------------------
  //         nps:update
  // ----------------------------------
  {
    displayName: 'Update Fields',
    name: 'updateFields',
    type: 'collection',
    placeholder: 'Add Field',
    displayOptions: {
      show: {
        resource: ['nps'],
        operation: ['update'],
      },
    },
    default: {},
    options: [
      {
        displayName: 'Follow-Up Config (JSON)',
        name: 'followUp',
        type: 'json',
        default: '',
        description: 'Follow-up question configuration',
      },
      {
        displayName: 'Name',
        name: 'name',
        type: 'string',
        default: '',
        description: 'The name of the NPS survey',
      },
      {
        displayName: 'Question',
        name: 'question',
        type: 'string',
        default: '',
        description: 'The NPS question text',
      },
      {
        displayName: 'State',
        name: 'state',
        type: 'options',
        options: [
          { name: 'Draft', value: 'draft' },
          { name: 'Staged', value: 'staged' },
          { name: 'Public', value: 'public' },
          { name: 'Disabled', value: 'disabled' },
        ],
        default: '',
        description: 'Survey state',
      },
      {
        displayName: 'Targeting (JSON)',
        name: 'targeting',
        type: 'json',
        default: '',
        description: 'Survey targeting rules',
      },
    ],
  },

  // ----------------------------------
  //         nps:getResponses
  // ----------------------------------
  {
    displayName: 'Return All',
    name: 'returnAll',
    type: 'boolean',
    displayOptions: {
      show: {
        resource: ['nps'],
        operation: ['getResponses'],
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
        resource: ['nps'],
        operation: ['getResponses'],
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
    displayName: 'Options',
    name: 'options',
    type: 'collection',
    placeholder: 'Add Option',
    displayOptions: {
      show: {
        resource: ['nps'],
        operation: ['getResponses'],
      },
    },
    default: {},
    options: [
      {
        displayName: 'Start Date',
        name: 'startDate',
        type: 'dateTime',
        default: '',
        description: 'Filter responses from this date',
      },
      {
        displayName: 'End Date',
        name: 'endDate',
        type: 'dateTime',
        default: '',
        description: 'Filter responses until this date',
      },
      {
        displayName: 'Score Type',
        name: 'scoreType',
        type: 'options',
        options: [
          { name: 'All', value: 'all' },
          { name: 'Promoters (9-10)', value: 'promoters' },
          { name: 'Passives (7-8)', value: 'passives' },
          { name: 'Detractors (0-6)', value: 'detractors' },
        ],
        default: 'all',
        description: 'Filter by NPS score type',
      },
    ],
  },

  // ----------------------------------
  //         nps:getAnalytics
  // ----------------------------------
  {
    displayName: 'Start Date',
    name: 'startDate',
    type: 'dateTime',
    required: true,
    displayOptions: {
      show: {
        resource: ['nps'],
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
        resource: ['nps'],
        operation: ['getAnalytics'],
      },
    },
    default: '',
    description: 'End date for analytics data',
  },

  // ----------------------------------
  //         nps:exportData
  // ----------------------------------
  {
    displayName: 'Format',
    name: 'format',
    type: 'options',
    displayOptions: {
      show: {
        resource: ['nps'],
        operation: ['exportData'],
      },
    },
    options: [
      { name: 'JSON', value: 'json' },
      { name: 'CSV', value: 'csv' },
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
        resource: ['nps'],
        operation: ['exportData'],
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
];
