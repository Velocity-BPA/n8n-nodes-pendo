/**
 * Copyright (c) 2026 Velocity BPA
 * 
 * Licensed under the Business Source License 1.1 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     https://github.com/VelocityBPA/n8n-nodes-pendo/blob/main/LICENSE
 * 
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  NodeOperationError,
  NodeApiError,
} from 'n8n-workflow';

export class Pendo implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Pendo',
    name: 'pendo',
    icon: 'file:pendo.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
    description: 'Interact with the Pendo API',
    defaults: {
      name: 'Pendo',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'pendoApi',
        required: true,
      },
    ],
    properties: [
      // Resource selector
      {
        displayName: 'Resource',
        name: 'resource',
        type: 'options',
        noDataExpression: true,
        options: [
          {
            name: 'Visitors',
            value: 'visitors',
          },
          {
            name: 'Accounts',
            value: 'accounts',
          },
          {
            name: 'Guides',
            value: 'guides',
          },
          {
            name: 'Segments',
            value: 'segments',
          },
          {
            name: 'Events',
            value: 'events',
          },
          {
            name: 'Features',
            value: 'features',
          }
        ],
        default: 'visitors',
      },
      // Operation dropdowns per resource
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['visitors'],
    },
  },
  options: [
    {
      name: 'Get Visitor',
      value: 'getVisitor',
      description: 'Retrieve visitor information',
      action: 'Get visitor information',
    },
    {
      name: 'Create Visitor',
      value: 'createVisitor',
      description: 'Create a new visitor record',
      action: 'Create a new visitor record',
    },
    {
      name: 'Update Visitor',
      value: 'updateVisitor',
      description: 'Update visitor metadata and attributes',
      action: 'Update visitor metadata and attributes',
    },
    {
      name: 'Delete Visitor',
      value: 'deleteVisitor',
      description: 'Delete a visitor record',
      action: 'Delete a visitor record',
    },
    {
      name: 'Get Visitor Metadata',
      value: 'getVisitorMetadata',
      description: 'Get visitor metadata fields',
      action: 'Get visitor metadata fields',
    },
    {
      name: 'Update Visitor Metadata',
      value: 'updateVisitorMetadata',
      description: 'Update visitor metadata',
      action: 'Update visitor metadata',
    },
  ],
  default: 'getVisitor',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['accounts'],
    },
  },
  options: [
    {
      name: 'Get Account',
      value: 'getAccount',
      description: 'Retrieve account information',
      action: 'Get account',
    },
    {
      name: 'Create Account',
      value: 'createAccount',
      description: 'Create a new account record',
      action: 'Create account',
    },
    {
      name: 'Update Account',
      value: 'updateAccount',
      description: 'Update account metadata and attributes',
      action: 'Update account',
    },
    {
      name: 'Delete Account',
      value: 'deleteAccount',
      description: 'Delete an account record',
      action: 'Delete account',
    },
    {
      name: 'Get Account Metadata',
      value: 'getAccountMetadata',
      description: 'Get account metadata fields',
      action: 'Get account metadata',
    },
    {
      name: 'Update Account Metadata',
      value: 'updateAccountMetadata',
      description: 'Update account metadata',
      action: 'Update account metadata',
    },
  ],
  default: 'getAccount',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['guides'],
    },
  },
  options: [
    {
      name: 'Get Guide',
      value: 'getGuide',
      description: 'Retrieve guide details',
      action: 'Get a guide',
    },
    {
      name: 'Get All Guides',
      value: 'getAllGuides',
      description: 'List all guides',
      action: 'Get all guides',
    },
    {
      name: 'Create Guide',
      value: 'createGuide',
      description: 'Create a new guide',
      action: 'Create a guide',
    },
    {
      name: 'Update Guide',
      value: 'updateGuide',
      description: 'Update guide content and settings',
      action: 'Update a guide',
    },
    {
      name: 'Delete Guide',
      value: 'deleteGuide',
      description: 'Delete a guide',
      action: 'Delete a guide',
    },
    {
      name: 'Launch Guide',
      value: 'launchGuide',
      description: 'Launch a guide to target audience',
      action: 'Launch a guide',
    },
    {
      name: 'Pause Guide',
      value: 'pauseGuide',
      description: 'Pause an active guide',
      action: 'Pause a guide',
    },
  ],
  default: 'getGuide',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['segments'],
    },
  },
  options: [
    {
      name: 'Get All Segments',
      value: 'getAllSegments',
      description: 'List all segments',
      action: 'Get all segments',
    },
    {
      name: 'Get Segment',
      value: 'getSegment',
      description: 'Retrieve segment details',
      action: 'Get segment',
    },
    {
      name: 'Create Segment',
      value: 'createSegment',
      description: 'Create a new segment',
      action: 'Create segment',
    },
    {
      name: 'Update Segment',
      value: 'updateSegment',
      description: 'Update segment definition',
      action: 'Update segment',
    },
    {
      name: 'Delete Segment',
      value: 'deleteSegment',
      description: 'Delete a segment',
      action: 'Delete segment',
    },
    {
      name: 'Get Segment Visitors',
      value: 'getSegmentVisitors',
      description: 'Get visitors in segment',
      action: 'Get segment visitors',
    },
    {
      name: 'Get Segment Accounts',
      value: 'getSegmentAccounts',
      description: 'Get accounts in segment',
      action: 'Get segment accounts',
    },
  ],
  default: 'getAllSegments',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['events'],
    },
  },
  options: [
    {
      name: 'Get Events',
      value: 'getEvents',
      description: 'Retrieve event data with filters',
      action: 'Get events',
    },
    {
      name: 'Create Event',
      value: 'createEvent',
      description: 'Track a custom event',
      action: 'Create event',
    },
    {
      name: 'Get Event',
      value: 'getEvent',
      description: 'Get specific event details',
      action: 'Get event',
    },
    {
      name: 'Get All Events',
      value: 'getAllEvents',
      description: 'List tracked events',
      action: 'Get all events',
    },
    {
      name: 'Get Event Aggregation',
      value: 'getEventAggregation',
      description: 'Get aggregated event analytics',
      action: 'Get event aggregation',
    },
  ],
  default: 'getEvents',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['features'],
    },
  },
  options: [
    {
      name: 'Get All Features',
      value: 'getAllFeatures',
      description: 'List all tracked features',
      action: 'Get all features',
    },
    {
      name: 'Get Feature',
      value: 'getFeature',
      description: 'Get feature details and usage stats',
      action: 'Get feature',
    },
    {
      name: 'Get Feature Events',
      value: 'getFeatureEvents',
      description: 'Get events for specific feature',
      action: 'Get feature events',
    },
    {
      name: 'Create Feature',
      value: 'createFeature',
      description: 'Create a new feature for tracking',
      action: 'Create feature',
    },
    {
      name: 'Update Feature',
      value: 'updateFeature',
      description: 'Update feature configuration',
      action: 'Update feature',
    },
  ],
  default: 'getAllFeatures',
},
      // Parameter definitions
{
  displayName: 'Visitor ID',
  name: 'visitorId',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['visitors'],
      operation: ['getVisitor'],
    },
  },
  default: '',
  description: 'The unique identifier of the visitor',
},
{
  displayName: 'Visitor ID',
  name: 'visitorId',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['visitors'],
      operation: ['createVisitor'],
    },
  },
  default: '',
  description: 'The unique identifier for the new visitor',
},
{
  displayName: 'Metadata',
  name: 'metadata',
  type: 'fixedCollection',
  required: false,
  displayOptions: {
    show: {
      resource: ['visitors'],
      operation: ['createVisitor'],
    },
  },
  default: {},
  description: 'Visitor metadata and attributes',
  typeOptions: {
    multipleValues: true,
  },
  options: [
    {
      name: 'metadataFields',
      displayName: 'Metadata Field',
      values: [
        {
          displayName: 'Key',
          name: 'key',
          type: 'string',
          default: '',
          description: 'The metadata field key',
        },
        {
          displayName: 'Value',
          name: 'value',
          type: 'string',
          default: '',
          description: 'The metadata field value',
        },
      ],
    },
  ],
},
{
  displayName: 'Visitor ID',
  name: 'visitorId',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['visitors'],
      operation: ['updateVisitor'],
    },
  },
  default: '',
  description: 'The unique identifier of the visitor to update',
},
{
  displayName: 'Metadata',
  name: 'metadata',
  type: 'fixedCollection',
  required: false,
  displayOptions: {
    show: {
      resource: ['visitors'],
      operation: ['updateVisitor'],
    },
  },
  default: {},
  description: 'Updated visitor metadata and attributes',
  typeOptions: {
    multipleValues: true,
  },
  options: [
    {
      name: 'metadataFields',
      displayName: 'Metadata Field',
      values: [
        {
          displayName: 'Key',
          name: 'key',
          type: 'string',
          default: '',
          description: 'The metadata field key',
        },
        {
          displayName: 'Value',
          name: 'value',
          type: 'string',
          default: '',
          description: 'The metadata field value',
        },
      ],
    },
  ],
},
{
  displayName: 'Visitor ID',
  name: 'visitorId',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['visitors'],
      operation: ['deleteVisitor'],
    },
  },
  default: '',
  description: 'The unique identifier of the visitor to delete',
},
{
  displayName: 'Visitor ID',
  name: 'visitorId',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['visitors'],
      operation: ['getVisitorMetadata'],
    },
  },
  default: '',
  description: 'The unique identifier of the visitor',
},
{
  displayName: 'Visitor ID',
  name: 'visitorId',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['visitors'],
      operation: ['updateVisitorMetadata'],
    },
  },
  default: '',
  description: 'The unique identifier of the visitor',
},
{
  displayName: 'Metadata',
  name: 'metadata',
  type: 'fixedCollection',
  required: true,
  displayOptions: {
    show: {
      resource: ['visitors'],
      operation: ['updateVisitorMetadata'],
    },
  },
  default: {},
  description: 'Updated visitor metadata',
  typeOptions: {
    multipleValues: true,
  },
  options: [
    {
      name: 'metadataFields',
      displayName: 'Metadata Field',
      values: [
        {
          displayName: 'Key',
          name: 'key',
          type: 'string',
          default: '',
          description: 'The metadata field key',
        },
        {
          displayName: 'Value',
          name: 'value',
          type: 'string',
          default: '',
          description: 'The metadata field value',
        },
      ],
    },
  ],
},
{
  displayName: 'Account ID',
  name: 'accountId',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['accounts'],
      operation: ['getAccount'],
    },
  },
  default: '',
  description: 'The unique identifier of the account',
},
{
  displayName: 'Account ID',
  name: 'accountId',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['accounts'],
      operation: ['createAccount'],
    },
  },
  default: '',
  description: 'The unique identifier for the new account',
},
{
  displayName: 'Metadata',
  name: 'metadata',
  type: 'fixedCollection',
  typeOptions: {
    multipleValues: true,
  },
  displayOptions: {
    show: {
      resource: ['accounts'],
      operation: ['createAccount'],
    },
  },
  default: {},
  options: [
    {
      name: 'property',
      displayName: 'Property',
      values: [
        {
          displayName: 'Key',
          name: 'key',
          type: 'string',
          default: '',
          description: 'Metadata key',
        },
        {
          displayName: 'Value',
          name: 'value',
          type: 'string',
          default: '',
          description: 'Metadata value',
        },
      ],
    },
  ],
  description: 'Account metadata properties',
},
{
  displayName: 'Account ID',
  name: 'accountId',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['accounts'],
      operation: ['updateAccount'],
    },
  },
  default: '',
  description: 'The unique identifier of the account to update',
},
{
  displayName: 'Metadata',
  name: 'metadata',
  type: 'fixedCollection',
  typeOptions: {
    multipleValues: true,
  },
  displayOptions: {
    show: {
      resource: ['accounts'],
      operation: ['updateAccount'],
    },
  },
  default: {},
  options: [
    {
      name: 'property',
      displayName: 'Property',
      values: [
        {
          displayName: 'Key',
          name: 'key',
          type: 'string',
          default: '',
          description: 'Metadata key',
        },
        {
          displayName: 'Value',
          name: 'value',
          type: 'string',
          default: '',
          description: 'Metadata value',
        },
      ],
    },
  ],
  description: 'Account metadata properties to update',
},
{
  displayName: 'Account ID',
  name: 'accountId',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['accounts'],
      operation: ['deleteAccount'],
    },
  },
  default: '',
  description: 'The unique identifier of the account to delete',
},
{
  displayName: 'Account ID',
  name: 'accountId',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['accounts'],
      operation: ['getAccountMetadata'],
    },
  },
  default: '',
  description: 'The unique identifier of the account',
},
{
  displayName: 'Account ID',
  name: 'accountId',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['accounts'],
      operation: ['updateAccountMetadata'],
    },
  },
  default: '',
  description: 'The unique identifier of the account',
},
{
  displayName: 'Metadata',
  name: 'metadata',
  type: 'fixedCollection',
  typeOptions: {
    multipleValues: true,
  },
  displayOptions: {
    show: {
      resource: ['accounts'],
      operation: ['updateAccountMetadata'],
    },
  },
  default: {},
  options: [
    {
      name: 'property',
      displayName: 'Property',
      values: [
        {
          displayName: 'Key',
          name: 'key',
          type: 'string',
          default: '',
          description: 'Metadata key',
        },
        {
          displayName: 'Value',
          name: 'value',
          type: 'string',
          default: '',
          description: 'Metadata value',
        },
      ],
    },
  ],
  description: 'Account metadata properties to update',
},
{
  displayName: 'Guide ID',
  name: 'guideId',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['guides'],
      operation: ['getGuide'],
    },
  },
  default: '',
  description: 'The ID of the guide to retrieve',
},
{
  displayName: 'Limit',
  name: 'limit',
  type: 'number',
  required: false,
  displayOptions: {
    show: {
      resource: ['guides'],
      operation: ['getAllGuides'],
    },
  },
  default: 50,
  description: 'Maximum number of guides to return',
},
{
  displayName: 'Offset',
  name: 'offset',
  type: 'number',
  required: false,
  displayOptions: {
    show: {
      resource: ['guides'],
      operation: ['getAllGuides'],
    },
  },
  default: 0,
  description: 'Number of guides to skip',
},
{
  displayName: 'Name',
  name: 'name',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['guides'],
      operation: ['createGuide'],
    },
  },
  default: '',
  description: 'The name of the guide',
},
{
  displayName: 'Type',
  name: 'type',
  type: 'options',
  required: true,
  displayOptions: {
    show: {
      resource: ['guides'],
      operation: ['createGuide'],
    },
  },
  options: [
    {
      name: 'Tooltip',
      value: 'tooltip',
    },
    {
      name: 'Lightbox',
      value: 'lightbox',
    },
    {
      name: 'Banner',
      value: 'banner',
    },
  ],
  default: 'tooltip',
  description: 'The type of guide',
},
{
  displayName: 'Content',
  name: 'content',
  type: 'json',
  required: true,
  displayOptions: {
    show: {
      resource: ['guides'],
      operation: ['createGuide'],
    },
  },
  default: '{}',
  description: 'The content configuration of the guide',
},
{
  displayName: 'Guide ID',
  name: 'guideId',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['guides'],
      operation: ['updateGuide'],
    },
  },
  default: '',
  description: 'The ID of the guide to update',
},
{
  displayName: 'Name',
  name: 'name',
  type: 'string',
  required: false,
  displayOptions: {
    show: {
      resource: ['guides'],
      operation: ['updateGuide'],
    },
  },
  default: '',
  description: 'The updated name of the guide',
},
{
  displayName: 'Content',
  name: 'content',
  type: 'json',
  required: false,
  displayOptions: {
    show: {
      resource: ['guides'],
      operation: ['updateGuide'],
    },
  },
  default: '{}',
  description: 'The updated content configuration of the guide',
},
{
  displayName: 'Guide ID',
  name: 'guideId',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['guides'],
      operation: ['deleteGuide'],
    },
  },
  default: '',
  description: 'The ID of the guide to delete',
},
{
  displayName: 'Guide ID',
  name: 'guideId',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['guides'],
      operation: ['launchGuide'],
    },
  },
  default: '',
  description: 'The ID of the guide to launch',
},
{
  displayName: 'Target Audience',
  name: 'targetAudience',
  type: 'json',
  required: true,
  displayOptions: {
    show: {
      resource: ['guides'],
      operation: ['launchGuide'],
    },
  },
  default: '{}',
  description: 'The target audience configuration for the guide',
},
{
  displayName: 'Guide ID',
  name: 'guideId',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['guides'],
      operation: ['pauseGuide'],
    },
  },
  default: '',
  description: 'The ID of the guide to pause',
},
{
  displayName: 'Segment ID',
  name: 'segmentId',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['segments'],
      operation: ['getSegment', 'updateSegment', 'deleteSegment', 'getSegmentVisitors', 'getSegmentAccounts'],
    },
  },
  default: '',
  description: 'The unique identifier of the segment',
},
{
  displayName: 'Limit',
  name: 'limit',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['segments'],
      operation: ['getAllSegments', 'getSegmentVisitors', 'getSegmentAccounts'],
    },
  },
  default: 100,
  description: 'Maximum number of results to return',
},
{
  displayName: 'Offset',
  name: 'offset',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['segments'],
      operation: ['getAllSegments', 'getSegmentVisitors', 'getSegmentAccounts'],
    },
  },
  default: 0,
  description: 'Number of results to skip',
},
{
  displayName: 'Type',
  name: 'type',
  type: 'options',
  displayOptions: {
    show: {
      resource: ['segments'],
      operation: ['getAllSegments', 'createSegment'],
    },
  },
  options: [
    {
      name: 'Visitor',
      value: 'visitor',
    },
    {
      name: 'Account',
      value: 'account',
    },
  ],
  default: 'visitor',
  description: 'Type of segment',
},
{
  displayName: 'Name',
  name: 'name',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['segments'],
      operation: ['createSegment'],
    },
  },
  default: '',
  description: 'Name of the segment',
},
{
  displayName: 'Definition',
  name: 'definition',
  type: 'json',
  required: true,
  displayOptions: {
    show: {
      resource: ['segments'],
      operation: ['createSegment', 'updateSegment'],
    },
  },
  default: '{}',
  description: 'Segment definition as JSON object',
},
{
  displayName: 'Period',
  name: 'period',
  type: 'string',
  required: false,
  displayOptions: {
    show: {
      resource: ['events'],
      operation: ['getEvents'],
    },
  },
  default: '',
  description: 'Time period for event data retrieval',
},
{
  displayName: 'First',
  name: 'first',
  type: 'number',
  required: false,
  displayOptions: {
    show: {
      resource: ['events'],
      operation: ['getEvents'],
    },
  },
  default: 0,
  description: 'Unix timestamp for the start of the time range',
},
{
  displayName: 'Last',
  name: 'last',
  type: 'number',
  required: false,
  displayOptions: {
    show: {
      resource: ['events'],
      operation: ['getEvents'],
    },
  },
  default: 0,
  description: 'Unix timestamp for the end of the time range',
},
{
  displayName: 'Event',
  name: 'event',
  type: 'string',
  required: false,
  displayOptions: {
    show: {
      resource: ['events'],
      operation: ['getEvents'],
    },
  },
  default: '',
  description: 'Specific event name to filter by',
},
{
  displayName: 'Visitor ID',
  name: 'visitorId',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['events'],
      operation: ['createEvent'],
    },
  },
  default: '',
  description: 'Unique identifier for the visitor',
},
{
  displayName: 'Account ID',
  name: 'accountId',
  type: 'string',
  required: false,
  displayOptions: {
    show: {
      resource: ['events'],
      operation: ['createEvent'],
    },
  },
  default: '',
  description: 'Account identifier associated with the event',
},
{
  displayName: 'Event Name',
  name: 'eventName',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['events'],
      operation: ['createEvent'],
    },
  },
  default: '',
  description: 'Name of the custom event to track',
},
{
  displayName: 'Properties',
  name: 'properties',
  type: 'json',
  required: false,
  displayOptions: {
    show: {
      resource: ['events'],
      operation: ['createEvent'],
    },
  },
  default: '{}',
  description: 'Additional properties for the event as JSON object',
},
{
  displayName: 'Event ID',
  name: 'eventId',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['events'],
      operation: ['getEvent'],
    },
  },
  default: '',
  description: 'Unique identifier of the event to retrieve',
},
{
  displayName: 'Limit',
  name: 'limit',
  type: 'number',
  required: false,
  displayOptions: {
    show: {
      resource: ['events'],
      operation: ['getAllEvents', 'getEventAggregation'],
    },
  },
  default: 100,
  description: 'Maximum number of events to return',
},
{
  displayName: 'Offset',
  name: 'offset',
  type: 'number',
  required: false,
  displayOptions: {
    show: {
      resource: ['events'],
      operation: ['getAllEvents'],
    },
  },
  default: 0,
  description: 'Number of events to skip for pagination',
},
{
  displayName: 'Period',
  name: 'period',
  type: 'string',
  required: false,
  displayOptions: {
    show: {
      resource: ['events'],
      operation: ['getAllEvents', 'getEventAggregation'],
    },
  },
  default: '',
  description: 'Time period for event listing',
},
{
  displayName: 'Group By',
  name: 'groupBy',
  type: 'string',
  required: false,
  displayOptions: {
    show: {
      resource: ['events'],
      operation: ['getEventAggregation'],
    },
  },
  default: '',
  description: 'Field to group aggregation results by',
},
{
  displayName: 'Filters',
  name: 'filters',
  type: 'json',
  required: false,
  displayOptions: {
    show: {
      resource: ['events'],
      operation: ['getEventAggregation'],
    },
  },
  default: '{}',
  description: 'Additional filters for aggregation as JSON object',
},
{
  displayName: 'Limit',
  name: 'limit',
  type: 'number',
  required: false,
  displayOptions: {
    show: {
      resource: ['features'],
      operation: ['getAllFeatures'],
    },
  },
  default: 50,
  description: 'Maximum number of features to return',
},
{
  displayName: 'Offset',
  name: 'offset',
  type: 'number',
  required: false,
  displayOptions: {
    show: {
      resource: ['features'],
      operation: ['getAllFeatures'],
    },
  },
  default: 0,
  description: 'Number of features to skip',
},
{
  displayName: 'Feature ID',
  name: 'featureId',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['features'],
      operation: ['getFeature'],
    },
  },
  default: '',
  description: 'The ID of the feature to retrieve',
},
{
  displayName: 'Feature ID',
  name: 'featureId',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['features'],
      operation: ['getFeatureEvents'],
    },
  },
  default: '',
  description: 'The ID of the feature to get events for',
},
{
  displayName: 'Period',
  name: 'period',
  type: 'string',
  required: false,
  displayOptions: {
    show: {
      resource: ['features'],
      operation: ['getFeatureEvents'],
    },
  },
  default: '7d',
  description: 'Time period for events (e.g., 7d, 30d, 90d)',
},
{
  displayName: 'Name',
  name: 'name',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['features'],
      operation: ['createFeature'],
    },
  },
  default: '',
  description: 'The name of the feature',
},
{
  displayName: 'Selector',
  name: 'selector',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['features'],
      operation: ['createFeature'],
    },
  },
  default: '',
  description: 'CSS selector for the feature element',
},
{
  displayName: 'Description',
  name: 'description',
  type: 'string',
  required: false,
  displayOptions: {
    show: {
      resource: ['features'],
      operation: ['createFeature'],
    },
  },
  default: '',
  description: 'Description of the feature',
},
{
  displayName: 'Feature ID',
  name: 'featureId',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['features'],
      operation: ['updateFeature'],
    },
  },
  default: '',
  description: 'The ID of the feature to update',
},
{
  displayName: 'Name',
  name: 'name',
  type: 'string',
  required: false,
  displayOptions: {
    show: {
      resource: ['features'],
      operation: ['updateFeature'],
    },
  },
  default: '',
  description: 'The new name of the feature',
},
{
  displayName: 'Description',
  name: 'description',
  type: 'string',
  required: false,
  displayOptions: {
    show: {
      resource: ['features'],
      operation: ['updateFeature'],
    },
  },
  default: '',
  description: 'The new description of the feature',
},
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const resource = this.getNodeParameter('resource', 0) as string;

    switch (resource) {
      case 'visitors':
        return [await executeVisitorsOperations.call(this, items)];
      case 'accounts':
        return [await executeAccountsOperations.call(this, items)];
      case 'guides':
        return [await executeGuidesOperations.call(this, items)];
      case 'segments':
        return [await executeSegmentsOperations.call(this, items)];
      case 'events':
        return [await executeEventsOperations.call(this, items)];
      case 'features':
        return [await executeFeaturesOperations.call(this, items)];
      default:
        throw new NodeOperationError(this.getNode(), `The resource "${resource}" is not supported`);
    }
  }
}

// ============================================================
// Resource Handler Functions
// ============================================================

async function executeVisitorsOperations(
  this: IExecuteFunctions,
  items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
  const returnData: INodeExecutionData[] = [];
  const operation = this.getNodeParameter('operation', 0) as string;
  const credentials = await this.getCredentials('pendoApi') as any;

  for (let i = 0; i < items.length; i++) {
    try {
      let result: any;

      switch (operation) {
        case 'getVisitor': {
          const visitorId = this.getNodeParameter('visitorId', i) as string;
          
          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/visitor`,
            headers: {
              'X-Pendo-Integration-Key': credentials.apiKey,
              'Content-Type': 'application/json',
            },
            qs: {
              visitorId,
            },
            json: true,
          };
          
          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'createVisitor': {
          const visitorId = this.getNodeParameter('visitorId', i) as string;
          const metadata = this.getNodeParameter('metadata', i) as any;
          
          const body: any = {
            visitorId,
          };

          if (metadata?.metadataFields) {
            const metadataObj: any = {};
            metadata.metadataFields.forEach((field: any) => {
              metadataObj[field.key] = field.value;
            });
            body.metadata = metadataObj;
          }

          const options: any = {
            method: 'POST',
            url: `${credentials.baseUrl}/visitor`,
            headers: {
              'X-Pendo-Integration-Key': credentials.apiKey,
              'Content-Type': 'application/json',
            },
            body,
            json: true,
          };
          
          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'updateVisitor': {
          const visitorId = this.getNodeParameter('visitorId', i) as string;
          const metadata = this.getNodeParameter('metadata', i) as any;
          
          const body: any = {
            visitorId,
          };

          if (metadata?.metadataFields) {
            const metadataObj: any = {};
            metadata.metadataFields.forEach((field: any) => {
              metadataObj[field.key] = field.value;
            });
            body.metadata = metadataObj;
          }

          const options: any = {
            method: 'PUT',
            url: `${credentials.baseUrl}/visitor`,
            headers: {
              'X-Pendo-Integration-Key': credentials.apiKey,
              'Content-Type': 'application/json',
            },
            body,
            json: true,
          };
          
          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'deleteVisitor': {
          const visitorId = this.getNodeParameter('visitorId', i) as string;
          
          const options: any = {
            method: 'DELETE',
            url: `${credentials.baseUrl}/visitor`,
            headers: {
              'X-Pendo-Integration-Key': credentials.apiKey,
              'Content-Type': 'application/json',
            },
            qs: {
              visitorId,
            },
            json: true,
          };
          
          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getVisitorMetadata': {
          const visitorId = this.getNodeParameter('visitorId', i) as string;
          
          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/visitor/metadata`,
            headers: {
              'X-Pendo-Integration-Key': credentials.apiKey,
              'Content-Type': 'application/json',
            },
            qs: {
              visitorId,
            },
            json: true,
          };
          
          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'updateVisitorMetadata': {
          const visitorId = this.getNodeParameter('visitorId', i) as string;
          const metadata = this.getNodeParameter('metadata', i) as any;
          
          const body: any = {
            visitorId,
          };

          if (metadata?.metadataFields) {
            const metadataObj: any = {};
            metadata.metadataFields.forEach((field: any) => {
              metadataObj[field.key] = field.value;
            });
            body.metadata = metadataObj;
          }

          const options: any = {
            method: 'PUT',
            url: `${credentials.baseUrl}/visitor/metadata`,
            headers: {
              'X-Pendo-Integration-Key': credentials.apiKey,
              'Content-Type': 'application/json',
            },
            body,
            json: true,
          };
          
          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        default:
          throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
      }

      returnData.push({
        json: result,
        pairedItem: { item: i },
      });

    } catch (error: any) {
      if (this.continueOnFail()) {
        returnData.push({
          json: { error: error.message },
          pairedItem: { item: i },
        });
      } else {
        throw new NodeApiError(this.getNode(), error);
      }
    }
  }

  return returnData;
}

async function executeAccountsOperations(
  this: IExecuteFunctions,
  items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
  const returnData: INodeExecutionData[] = [];
  const operation = this.getNodeParameter('operation', 0) as string;
  const credentials = await this.getCredentials('pendoApi') as any;

  for (let i = 0; i < items.length; i++) {
    try {
      let result: any;
      
      switch (operation) {
        case 'getAccount': {
          const accountId = this.getNodeParameter('accountId', i) as string;
          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/account`,
            headers: {
              'X-Pendo-Integration-Key': credentials.apiKey,
              'Content-Type': 'application/json',
            },
            qs: {
              accountId,
            },
            json: true,
          };
          result = await this.helpers.httpRequest(options) as any;
          break;
        }
        
        case 'createAccount': {
          const accountId = this.getNodeParameter('accountId', i) as string;
          const metadata = this.getNodeParameter('metadata', i) as any;
          
          const metadataObj: any = {};
          if (metadata && metadata.property) {
            for (const prop of metadata.property) {
              metadataObj[prop.key] = prop.value;
            }
          }

          const options: any = {
            method: 'POST',
            url: `${credentials.baseUrl}/account`,
            headers: {
              'X-Pendo-Integration-Key': credentials.apiKey,
              'Content-Type': 'application/json',
            },
            body: {
              accountId,
              metadata: metadataObj,
            },
            json: true,
          };
          result = await this.helpers.httpRequest(options) as any;
          break;
        }
        
        case 'updateAccount': {
          const accountId = this.getNodeParameter('accountId', i) as string;
          const metadata = this.getNodeParameter('metadata', i) as any;
          
          const metadataObj: any = {};
          if (metadata && metadata.property) {
            for (const prop of metadata.property) {
              metadataObj[prop.key] = prop.value;
            }
          }

          const options: any = {
            method: 'PUT',
            url: `${credentials.baseUrl}/account`,
            headers: {
              'X-Pendo-Integration-Key': credentials.apiKey,
              'Content-Type': 'application/json',
            },
            body: {
              accountId,
              metadata: metadataObj,
            },
            json: true,
          };
          result = await this.helpers.httpRequest(options) as any;
          break;
        }
        
        case 'deleteAccount': {
          const accountId = this.getNodeParameter('accountId', i) as string;
          const options: any = {
            method: 'DELETE',
            url: `${credentials.baseUrl}/account`,
            headers: {
              'X-Pendo-Integration-Key': credentials.apiKey,
              'Content-Type': 'application/json',
            },
            qs: {
              accountId,
            },
            json: true,
          };
          result = await this.helpers.httpRequest(options) as any;
          break;
        }
        
        case 'getAccountMetadata': {
          const accountId = this.getNodeParameter('accountId', i) as string;
          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/account/metadata`,
            headers: {
              'X-Pendo-Integration-Key': credentials.apiKey,
              'Content-Type': 'application/json',
            },
            qs: {
              accountId,
            },
            json: true,
          };
          result = await this.helpers.httpRequest(options) as any;
          break;
        }
        
        case 'updateAccountMetadata': {
          const accountId = this.getNodeParameter('accountId', i) as string;
          const metadata = this.getNodeParameter('metadata', i) as any;
          
          const metadataObj: any = {};
          if (metadata && metadata.property) {
            for (const prop of metadata.property) {
              metadataObj[prop.key] = prop.value;
            }
          }

          const options: any = {
            method: 'PUT',
            url: `${credentials.baseUrl}/account/metadata`,
            headers: {
              'X-Pendo-Integration-Key': credentials.apiKey,
              'Content-Type': 'application/json',
            },
            body: {
              accountId,
              metadata: metadataObj,
            },
            json: true,
          };
          result = await this.helpers.httpRequest(options) as any;
          break;
        }
        
        default:
          throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
      }
      
      returnData.push({ json: result, pairedItem: { item: i } });
    } catch (error: any) {
      if (this.continueOnFail()) {
        returnData.push({ json: { error: error.message }, pairedItem: { item: i } });
      } else {
        throw new NodeApiError(this.getNode(), error);
      }
    }
  }
  
  return returnData;
}

async function executeGuidesOperations(
  this: IExecuteFunctions,
  items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
  const returnData: INodeExecutionData[] = [];
  const operation = this.getNodeParameter('operation', 0) as string;
  const credentials = await this.getCredentials('pendoApi') as any;

  for (let i = 0; i < items.length; i++) {
    try {
      let result: any;
      const baseUrl = credentials.baseUrl || 'https://app.pendo.io/api/v1';
      
      switch (operation) {
        case 'getGuide': {
          const guideId = this.getNodeParameter('guideId', i) as string;
          
          const options: any = {
            method: 'GET',
            url: `${baseUrl}/guide`,
            headers: {
              'X-Pendo-Integration-Key': credentials.apiKey,
              'Content-Type': 'application/json',
            },
            qs: {
              guideId: guideId,
            },
            json: true,
          };
          
          result = await this.helpers.httpRequest(options) as any;
          break;
        }
        
        case 'getAllGuides': {
          const limit = this.getNodeParameter('limit', i, 50) as number;
          const offset = this.getNodeParameter('offset', i, 0) as number;
          
          const options: any = {
            method: 'GET',
            url: `${baseUrl}/guide`,
            headers: {
              'X-Pendo-Integration-Key': credentials.apiKey,
              'Content-Type': 'application/json',
            },
            qs: {
              limit: limit,
              offset: offset,
            },
            json: true,
          };
          
          result = await this.helpers.httpRequest(options) as any;
          break;
        }
        
        case 'createGuide': {
          const name = this.getNodeParameter('name', i) as string;
          const type = this.getNodeParameter('type', i) as string;
          const content = this.getNodeParameter('content', i) as any;
          
          let parsedContent: any;
          try {
            parsedContent = typeof content === 'string' ? JSON.parse(content) : content;
          } catch (error: any) {
            throw new NodeOperationError(this.getNode(), 'Invalid JSON in content parameter');
          }
          
          const options: any = {
            method: 'POST',
            url: `${baseUrl}/guide`,
            headers: {
              'X-Pendo-Integration-Key': credentials.apiKey,
              'Content-Type': 'application/json',
            },
            body: {
              name: name,
              type: type,
              content: parsedContent,
            },
            json: true,
          };
          
          result = await this.helpers.httpRequest(options) as any;
          break;
        }
        
        case 'updateGuide': {
          const guideId = this.getNodeParameter('guideId', i) as string;
          const name = this.getNodeParameter('name', i, '') as string;
          const content = this.getNodeParameter('content', i, '{}') as any;
          
          let parsedContent: any;
          try {
            parsedContent = typeof content === 'string' ? JSON.parse(content) : content;
          } catch (error: any) {
            throw new NodeOperationError(this.getNode(), 'Invalid JSON in content parameter');
          }
          
          const body: any = {};
          if (name) body.name = name;
          if (Object.keys(parsedContent).length > 0) body.content = parsedContent;
          
          const options: any = {
            method: 'PUT',
            url: `${baseUrl}/guide/${guideId}`,
            headers: {
              'X-Pendo-Integration-Key': credentials.apiKey,
              'Content-Type': 'application/json',
            },
            body: body,
            json: true,
          };
          
          result = await this.helpers.httpRequest(options) as any;
          break;
        }
        
        case 'deleteGuide': {
          const guideId = this.getNodeParameter('guideId', i) as string;
          
          const options: any = {
            method: 'DELETE',
            url: `${baseUrl}/guide/${guideId}`,
            headers: {
              'X-Pendo-Integration-Key': credentials.apiKey,
              'Content-Type': 'application/json',
            },
            json: true,
          };
          
          result = await this.helpers.httpRequest(options) as any;
          break;
        }
        
        case 'launchGuide': {
          const guideId = this.getNodeParameter('guideId', i) as string;
          const targetAudience = this.getNodeParameter('targetAudience', i) as any;
          
          let parsedTargetAudience: any;
          try {
            parsedTargetAudience = typeof targetAudience === 'string' ? JSON.parse(targetAudience) : targetAudience;
          } catch (error: any) {
            throw new NodeOperationError(this.getNode(), 'Invalid JSON in targetAudience parameter');
          }
          
          const options: any = {
            method: 'POST',
            url: `${baseUrl}/guide/${guideId}/launch`,
            headers: {
              'X-Pendo-Integration-Key': credentials.apiKey,
              'Content-Type': 'application/json',
            },
            body: {
              targetAudience: parsedTargetAudience,
            },
            json: true,
          };
          
          result = await this.helpers.httpRequest(options) as any;
          break;
        }
        
        case 'pauseGuide': {
          const guideId = this.getNodeParameter('guideId', i) as string;
          
          const options: any = {
            method: 'POST',
            url: `${baseUrl}/guide/${guideId}/pause`,
            headers: {
              'X-Pendo-Integration-Key': credentials.apiKey,
              'Content-Type': 'application/json',
            },
            json: true,
          };
          
          result = await this.helpers.httpRequest(options) as any;
          break;
        }
        
        default:
          throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
      }
      
      returnData.push({ json: result, pairedItem: { item: i } });
      
    } catch (error: any) {
      if (this.continueOnFail()) {
        returnData.push({ 
          json: { error: error.message }, 
          pairedItem: { item: i } 
        });
      } else {
        if (error instanceof NodeApiError || error instanceof NodeOperationError) {
          throw error;
        }
        throw new NodeApiError(this.getNode(), error);
      }
    }
  }
  
  return returnData;
}

async function executeSegmentsOperations(
  this: IExecuteFunctions,
  items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
  const returnData: INodeExecutionData[] = [];
  const operation = this.getNodeParameter('operation', 0) as string;
  const credentials = await this.getCredentials('pendoApi') as any;

  for (let i = 0; i < items.length; i++) {
    try {
      let result: any;

      const baseOptions: any = {
        headers: {
          'X-Pendo-Integration-Key': credentials.apiKey,
          'Content-Type': 'application/json',
        },
        json: true,
      };

      switch (operation) {
        case 'getAllSegments': {
          const limit = this.getNodeParameter('limit', i, 100) as number;
          const offset = this.getNodeParameter('offset', i, 0) as number;
          const type = this.getNodeParameter('type', i, '') as string;

          let url = `${credentials.baseUrl}/segment?limit=${limit}&offset=${offset}`;
          if (type) {
            url += `&type=${type}`;
          }

          const options: any = {
            ...baseOptions,
            method: 'GET',
            url,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getSegment': {
          const segmentId = this.getNodeParameter('segmentId', i) as string;

          const options: any = {
            ...baseOptions,
            method: 'GET',
            url: `${credentials.baseUrl}/segment/${segmentId}`,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'createSegment': {
          const name = this.getNodeParameter('name', i) as string;
          const definition = this.getNodeParameter('definition', i) as string;
          const type = this.getNodeParameter('type', i) as string;

          let parsedDefinition: any;
          try {
            parsedDefinition = typeof definition === 'string' ? JSON.parse(definition) : definition;
          } catch (error: any) {
            throw new NodeOperationError(this.getNode(), `Invalid JSON in definition: ${error.message}`, { itemIndex: i });
          }

          const options: any = {
            ...baseOptions,
            method: 'POST',
            url: `${credentials.baseUrl}/segment`,
            body: {
              name,
              definition: parsedDefinition,
              type,
            },
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'updateSegment': {
          const segmentId = this.getNodeParameter('segmentId', i) as string;
          const definition = this.getNodeParameter('definition', i) as string;

          let parsedDefinition: any;
          try {
            parsedDefinition = typeof definition === 'string' ? JSON.parse(definition) : definition;
          } catch (error: any) {
            throw new NodeOperationError(this.getNode(), `Invalid JSON in definition: ${error.message}`, { itemIndex: i });
          }

          const options: any = {
            ...baseOptions,
            method: 'PUT',
            url: `${credentials.baseUrl}/segment/${segmentId}`,
            body: {
              definition: parsedDefinition,
            },
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'deleteSegment': {
          const segmentId = this.getNodeParameter('segmentId', i) as string;

          const options: any = {
            ...baseOptions,
            method: 'DELETE',
            url: `${credentials.baseUrl}/segment/${segmentId}`,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getSegmentVisitors': {
          const segmentId = this.getNodeParameter('segmentId', i) as string;
          const limit = this.getNodeParameter('limit', i, 100) as number;
          const offset = this.getNodeParameter('offset', i, 0) as number;

          const options: any = {
            ...baseOptions,
            method: 'GET',
            url: `${credentials.baseUrl}/segment/${segmentId}/visitors?limit=${limit}&offset=${offset}`,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getSegmentAccounts': {
          const segmentId = this.getNodeParameter('segmentId', i) as string;
          const limit = this.getNodeParameter('limit', i, 100) as number;
          const offset = this.getNodeParameter('offset', i, 0) as number;

          const options: any = {
            ...baseOptions,
            method: 'GET',
            url: `${credentials.baseUrl}/segment/${segmentId}/accounts?limit=${limit}&offset=${offset}`,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        default:
          throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`, { itemIndex: i });
      }

      returnData.push({ json: result, pairedItem: { item: i } });

    } catch (error: any) {
      if (this.continueOnFail()) {
        returnData.push({ 
          json: { error: error.message }, 
          pairedItem: { item: i } 
        });
      } else {
        if (error.httpCode) {
          throw new NodeApiError(this.getNode(), error, { itemIndex: i });
        }
        throw new NodeOperationError(this.getNode(), error.message, { itemIndex: i });
      }
    }
  }

  return returnData;
}

async function executeEventsOperations(
  this: IExecuteFunctions,
  items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
  const returnData: INodeExecutionData[] = [];
  const operation = this.getNodeParameter('operation', 0) as string;
  const credentials = await this.getCredentials('pendoApi') as any;

  for (let i = 0; i < items.length; i++) {
    try {
      let result: any;

      switch (operation) {
        case 'getEvents': {
          const period = this.getNodeParameter('period', i, '') as string;
          const first = this.getNodeParameter('first', i, 0) as number;
          const last = this.getNodeParameter('last', i, 0) as number;
          const event = this.getNodeParameter('event', i, '') as string;

          const queryParams: any = {};
          if (period) queryParams.period = period;
          if (first) queryParams.first = first;
          if (last) queryParams.last = last;
          if (event) queryParams.event = event;

          const queryString = new URLSearchParams(queryParams).toString();
          const url = `${credentials.baseUrl || 'https://app.pendo.io/api/v1'}/aggregation${queryString ? '?' + queryString : ''}`;

          const options: any = {
            method: 'GET',
            url,
            headers: {
              'X-Pendo-Integration-Key': credentials.apiKey,
              'Content-Type': 'application/json',
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'createEvent': {
          const visitorId = this.getNodeParameter('visitorId', i) as string;
          const accountId = this.getNodeParameter('accountId', i, '') as string;
          const eventName = this.getNodeParameter('eventName', i) as string;
          const propertiesParam = this.getNodeParameter('properties', i, '{}') as string;

          let properties: any = {};
          try {
            properties = typeof propertiesParam === 'string' ? JSON.parse(propertiesParam) : propertiesParam;
          } catch (error: any) {
            throw new NodeOperationError(this.getNode(), 'Invalid JSON in properties parameter');
          }

          const body: any = {
            visitorId,
            event: eventName,
            properties,
          };

          if (accountId) {
            body.accountId = accountId;
          }

          const options: any = {
            method: 'POST',
            url: `${credentials.baseUrl || 'https://app.pendo.io/api/v1'}/track`,
            headers: {
              'X-Pendo-Integration-Key': credentials.apiKey,
              'Content-Type': 'application/json',
            },
            body,
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getEvent': {
          const eventId = this.getNodeParameter('eventId', i) as string;

          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl || 'https://app.pendo.io/api/v1'}/event/${eventId}`,
            headers: {
              'X-Pendo-Integration-Key': credentials.apiKey,
              'Content-Type': 'application/json',
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getAllEvents': {
          const limit = this.getNodeParameter('limit', i, 100) as number;
          const offset = this.getNodeParameter('offset', i, 0) as number;
          const period = this.getNodeParameter('period', i, '') as string;

          const queryParams: any = {
            limit: limit.toString(),
            offset: offset.toString(),
          };
          if (period) queryParams.period = period;

          const queryString = new URLSearchParams(queryParams).toString();
          const url = `${credentials.baseUrl || 'https://app.pendo.io/api/v1'}/event?${queryString}`;

          const options: any = {
            method: 'GET',
            url,
            headers: {
              'X-Pendo-Integration-Key': credentials.apiKey,
              'Content-Type': 'application/json',
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getEventAggregation': {
          const period = this.getNodeParameter('period', i, '') as string;
          const groupBy = this.getNodeParameter('groupBy', i, '') as string;
          const filtersParam = this.getNodeParameter('filters', i, '{}') as string;
          const limit = this.getNodeParameter('limit', i, 100) as number;

          let filters: any = {};
          try {
            filters = typeof filtersParam === 'string' ? JSON.parse(filtersParam) : filtersParam;
          } catch (error: any) {
            throw new NodeOperationError(this.getNode(), 'Invalid JSON in filters parameter');
          }

          const queryParams: any = {
            limit: limit.toString(),
          };
          if (period) queryParams.period = period;
          if (groupBy) queryParams.groupBy = groupBy;
          
          // Add filters to query params
          Object.keys(filters).forEach(key => {
            queryParams[key] = filters[key];
          });

          const queryString = new URLSearchParams(queryParams).toString();
          const url = `${credentials.baseUrl || 'https://app.pendo.io/api/v1'}/aggregation/events?${queryString}`;

          const options: any = {
            method: 'GET',
            url,
            headers: {
              'X-Pendo-Integration-Key': credentials.apiKey,
              'Content-Type': 'application/json',
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        default:
          throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
      }

      returnData.push({
        json: result,
        pairedItem: { item: i },
      });

    } catch (error: any) {
      if (this.continueOnFail()) {
        returnData.push({
          json: { error: error.message },
          pairedItem: { item: i },
        });
      } else {
        throw new NodeApiError(this.getNode(), error);
      }
    }
  }

  return returnData;
}

async function executeFeaturesOperations(
  this: IExecuteFunctions,
  items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
  const returnData: INodeExecutionData[] = [];
  const operation = this.getNodeParameter('operation', 0) as string;
  const credentials = await this.getCredentials('pendoApi') as any;

  for (let i = 0; i < items.length; i++) {
    try {
      let result: any;

      switch (operation) {
        case 'getAllFeatures': {
          const limit = this.getNodeParameter('limit', i, 50) as number;
          const offset = this.getNodeParameter('offset', i, 0) as number;

          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/feature`,
            headers: {
              'X-Pendo-Integration-Key': credentials.apiKey,
              'Content-Type': 'application/json',
            },
            qs: {
              limit,
              offset,
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getFeature': {
          const featureId = this.getNodeParameter('featureId', i) as string;

          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/feature/${featureId}`,
            headers: {
              'X-Pendo-Integration-Key': credentials.apiKey,
              'Content-Type': 'application/json',
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getFeatureEvents': {
          const featureId = this.getNodeParameter('featureId', i) as string;
          const period = this.getNodeParameter('period', i, '7d') as string;

          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/feature/${featureId}/events`,
            headers: {
              'X-Pendo-Integration-Key': credentials.apiKey,
              'Content-Type': 'application/json',
            },
            qs: {
              period,
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'createFeature': {
          const name = this.getNodeParameter('name', i) as string;
          const selector = this.getNodeParameter('selector', i) as string;
          const description = this.getNodeParameter('description', i, '') as string;

          const body: any = {
            name,
            selector,
          };

          if (description) {
            body.description = description;
          }

          const options: any = {
            method: 'POST',
            url: `${credentials.baseUrl}/feature`,
            headers: {
              'X-Pendo-Integration-Key': credentials.apiKey,
              'Content-Type': 'application/json',
            },
            body,
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'updateFeature': {
          const featureId = this.getNodeParameter('featureId', i) as string;
          const name = this.getNodeParameter('name', i, '') as string;
          const description = this.getNodeParameter('description', i, '') as string;

          const body: any = {};

          if (name) {
            body.name = name;
          }

          if (description) {
            body.description = description;
          }

          const options: any = {
            method: 'PUT',
            url: `${credentials.baseUrl}/feature/${featureId}`,
            headers: {
              'X-Pendo-Integration-Key': credentials.apiKey,
              'Content-Type': 'application/json',
            },
            body,
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        default:
          throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
      }

      returnData.push({ json: result, pairedItem: { item: i } });
    } catch (error: any) {
      if (this.continueOnFail()) {
        returnData.push({ json: { error: error.message }, pairedItem: { item: i } });
      } else {
        if (error.cause && error.cause.response) {
          const statusCode = error.cause.response.status;
          const errorMessage = error.cause.response.data?.message || error.message;
          throw new NodeApiError(this.getNode(), error.cause.response, {
            message: `Pendo API error: ${errorMessage}`,
            httpCode: statusCode,
          });
        }
        throw new NodeOperationError(this.getNode(), error.message);
      }
    }
  }

  return returnData;
}
