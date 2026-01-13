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

export const webhookOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['webhook'],
      },
    },
    options: [
      {
        name: 'Create',
        value: 'create',
        description: 'Create a webhook subscription',
        action: 'Create a webhook',
      },
      {
        name: 'Delete',
        value: 'delete',
        description: 'Delete a webhook',
        action: 'Delete a webhook',
      },
      {
        name: 'Get',
        value: 'get',
        description: 'Get a webhook by ID',
        action: 'Get a webhook',
      },
      {
        name: 'Get Deliveries',
        value: 'getDeliveries',
        description: 'Get webhook delivery history',
        action: 'Get webhook deliveries',
      },
      {
        name: 'Get Many',
        value: 'getMany',
        description: 'Get many webhooks',
        action: 'Get many webhooks',
      },
      {
        name: 'Test',
        value: 'test',
        description: 'Send test payload to webhook',
        action: 'Test a webhook',
      },
      {
        name: 'Update',
        value: 'update',
        description: 'Update a webhook',
        action: 'Update a webhook',
      },
    ],
    default: 'getMany',
  },
];

export const webhookFields: INodeProperties[] = [
  // ----------------------------------
  //         webhook:get
  // ----------------------------------
  {
    displayName: 'Webhook ID',
    name: 'webhookId',
    type: 'string',
    required: true,
    displayOptions: {
      show: {
        resource: ['webhook'],
        operation: ['get', 'delete', 'update', 'test', 'getDeliveries'],
      },
    },
    default: '',
    description: 'The ID of the webhook',
  },

  // ----------------------------------
  //         webhook:getMany
  // ----------------------------------
  {
    displayName: 'Return All',
    name: 'returnAll',
    type: 'boolean',
    displayOptions: {
      show: {
        resource: ['webhook'],
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
        resource: ['webhook'],
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

  // ----------------------------------
  //         webhook:create
  // ----------------------------------
  {
    displayName: 'URL',
    name: 'url',
    type: 'string',
    required: true,
    displayOptions: {
      show: {
        resource: ['webhook'],
        operation: ['create'],
      },
    },
    default: '',
    placeholder: 'https://example.com/webhook',
    description: 'The webhook endpoint URL',
  },
  {
    displayName: 'Events',
    name: 'events',
    type: 'multiOptions',
    required: true,
    displayOptions: {
      show: {
        resource: ['webhook'],
        operation: ['create'],
      },
    },
    options: [
      { name: 'Guide Advanced', value: 'guide.advanced' },
      { name: 'Guide Dismissed', value: 'guide.dismissed' },
      { name: 'Guide Displayed', value: 'guide.displayed' },
      { name: 'NPS Response', value: 'nps.response' },
      { name: 'Poll Response', value: 'poll.response' },
      { name: 'Segment Entered', value: 'segment.entered' },
      { name: 'Segment Exited', value: 'segment.exited' },
      { name: 'Track Event', value: 'track.event' },
      { name: 'Visitor Identified', value: 'visitor.identified' },
    ],
    default: [],
    description: 'Events to subscribe to',
  },
  {
    displayName: 'Additional Fields',
    name: 'additionalFields',
    type: 'collection',
    placeholder: 'Add Field',
    displayOptions: {
      show: {
        resource: ['webhook'],
        operation: ['create'],
      },
    },
    default: {},
    options: [
      {
        displayName: 'Name',
        name: 'name',
        type: 'string',
        default: '',
        description: 'A friendly name for the webhook',
      },
      {
        displayName: 'Secret',
        name: 'secret',
        type: 'string',
        typeOptions: {
          password: true,
        },
        default: '',
        description: 'Signing secret for webhook verification',
      },
    ],
  },

  // ----------------------------------
  //         webhook:update
  // ----------------------------------
  {
    displayName: 'Update Fields',
    name: 'updateFields',
    type: 'collection',
    placeholder: 'Add Field',
    displayOptions: {
      show: {
        resource: ['webhook'],
        operation: ['update'],
      },
    },
    default: {},
    options: [
      {
        displayName: 'Enabled',
        name: 'enabled',
        type: 'boolean',
        default: true,
        description: 'Whether the webhook is active',
      },
      {
        displayName: 'Events',
        name: 'events',
        type: 'multiOptions',
        options: [
          { name: 'Guide Advanced', value: 'guide.advanced' },
          { name: 'Guide Dismissed', value: 'guide.dismissed' },
          { name: 'Guide Displayed', value: 'guide.displayed' },
          { name: 'NPS Response', value: 'nps.response' },
          { name: 'Poll Response', value: 'poll.response' },
          { name: 'Segment Entered', value: 'segment.entered' },
          { name: 'Segment Exited', value: 'segment.exited' },
          { name: 'Track Event', value: 'track.event' },
          { name: 'Visitor Identified', value: 'visitor.identified' },
        ],
        default: [],
        description: 'Events to subscribe to',
      },
      {
        displayName: 'Name',
        name: 'name',
        type: 'string',
        default: '',
        description: 'A friendly name for the webhook',
      },
      {
        displayName: 'Secret',
        name: 'secret',
        type: 'string',
        typeOptions: {
          password: true,
        },
        default: '',
        description: 'Signing secret for webhook verification',
      },
      {
        displayName: 'URL',
        name: 'url',
        type: 'string',
        default: '',
        description: 'The webhook endpoint URL',
      },
    ],
  },

  // ----------------------------------
  //         webhook:getDeliveries
  // ----------------------------------
  {
    displayName: 'Return All',
    name: 'returnAll',
    type: 'boolean',
    displayOptions: {
      show: {
        resource: ['webhook'],
        operation: ['getDeliveries'],
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
        resource: ['webhook'],
        operation: ['getDeliveries'],
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
        resource: ['webhook'],
        operation: ['getDeliveries'],
      },
    },
    default: {},
    options: [
      {
        displayName: 'Status',
        name: 'status',
        type: 'options',
        options: [
          { name: 'All', value: '' },
          { name: 'Success', value: 'success' },
          { name: 'Failed', value: 'failed' },
        ],
        default: '',
        description: 'Filter by delivery status',
      },
      {
        displayName: 'Start Date',
        name: 'startDate',
        type: 'dateTime',
        default: '',
        description: 'Filter deliveries from this date',
      },
      {
        displayName: 'End Date',
        name: 'endDate',
        type: 'dateTime',
        default: '',
        description: 'Filter deliveries until this date',
      },
    ],
  },
];
