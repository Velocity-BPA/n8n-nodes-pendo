/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

import * as aggregation from './actions/aggregation';
import * as visitor from './actions/visitor';
import * as account from './actions/account';
import * as guide from './actions/guide';
import * as segment from './actions/segment';
import * as trackEvent from './actions/trackEvent';
import * as feedback from './actions/feedback';
import * as page from './actions/page/handlers';
import * as feature from './actions/feature/handlers';
import * as nps from './actions/nps/handlers';
import * as report from './actions/report/handlers';
import * as webhook from './actions/webhook/handlers';

// License notice - logged once per node load
const licenseNoticeLogged = false;
if (!licenseNoticeLogged) {
  console.warn(
    '[Velocity BPA Licensing Notice] This n8n node is licensed under the Business Source License 1.1 (BSL 1.1). ' +
      'Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA. ' +
      'For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.',
  );
}

export class Pendo implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Pendo',
    name: 'pendo',
    icon: 'file:pendo.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
    description:
      'Interact with Pendo for product analytics, guide management, and user feedback',
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
      // Resource selection
      {
        displayName: 'Resource',
        name: 'resource',
        type: 'options',
        noDataExpression: true,
        options: [
          {
            name: 'Account',
            value: 'account',
            description: 'Manage Pendo accounts',
          },
          {
            name: 'Aggregation',
            value: 'aggregation',
            description: 'Run analytics aggregation queries',
          },
          {
            name: 'Feature',
            value: 'feature',
            description: 'Manage tagged features',
          },
          {
            name: 'Feedback',
            value: 'feedback',
            description: 'Manage feedback requests',
          },
          {
            name: 'Guide',
            value: 'guide',
            description: 'Manage in-app guides',
          },
          {
            name: 'NPS',
            value: 'nps',
            description: 'Manage NPS surveys and responses',
          },
          {
            name: 'Page',
            value: 'page',
            description: 'Manage tagged pages',
          },
          {
            name: 'Report',
            value: 'report',
            description: 'Manage and run reports',
          },
          {
            name: 'Segment',
            value: 'segment',
            description: 'Manage user segments',
          },
          {
            name: 'Track Event',
            value: 'trackEvent',
            description: 'Manage track event definitions',
          },
          {
            name: 'Visitor',
            value: 'visitor',
            description: 'Manage Pendo visitors',
          },
          {
            name: 'Webhook',
            value: 'webhook',
            description: 'Manage webhook subscriptions',
          },
        ],
        default: 'aggregation',
      },

      // ==================== AGGREGATION OPERATIONS ====================
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['aggregation'],
          },
        },
        options: [
          {
            name: 'Get Account Activity',
            value: 'getAccountActivity',
            description: 'Get account activity summary',
            action: 'Get account activity',
          },
          {
            name: 'Get Feature Events',
            value: 'getFeatureEvents',
            description: 'Get feature click events',
            action: 'Get feature events',
          },
          {
            name: 'Get Guide Events',
            value: 'getGuideEvents',
            description: 'Get guide interaction events',
            action: 'Get guide events',
          },
          {
            name: 'Get Page Events',
            value: 'getPageEvents',
            description: 'Get page view events',
            action: 'Get page events',
          },
          {
            name: 'Get Poll Events',
            value: 'getPollEvents',
            description: 'Get poll response events',
            action: 'Get poll events',
          },
          {
            name: 'Get Track Events',
            value: 'getTrackEvents',
            description: 'Get custom track events',
            action: 'Get track events',
          },
          {
            name: 'Get Visitor Activity',
            value: 'getVisitorActivity',
            description: 'Get visitor activity summary',
            action: 'Get visitor activity',
          },
          {
            name: 'Run Aggregation',
            value: 'runAggregation',
            description: 'Execute a custom aggregation query',
            action: 'Run aggregation',
          },
          {
            name: 'Run Time Series',
            value: 'runTimeSeries',
            description: 'Run a time-series aggregation',
            action: 'Run time series',
          },
        ],
        default: 'runAggregation',
      },

      // Aggregation - Run Aggregation
      {
        displayName: 'Pipeline (JSON)',
        name: 'pipeline',
        type: 'json',
        displayOptions: {
          show: {
            resource: ['aggregation'],
            operation: ['runAggregation'],
          },
        },
        default: '[]',
        required: true,
        description: 'The aggregation pipeline as JSON array',
      },
      {
        displayName: 'Request ID',
        name: 'requestId',
        type: 'string',
        displayOptions: {
          show: {
            resource: ['aggregation'],
            operation: ['runAggregation'],
          },
        },
        default: '',
        description: 'Optional request ID for tracking',
      },

      // Aggregation - Date Range Fields
      {
        displayName: 'Start Date',
        name: 'startDate',
        type: 'dateTime',
        displayOptions: {
          show: {
            resource: ['aggregation'],
            operation: [
              'getPageEvents',
              'getFeatureEvents',
              'getGuideEvents',
              'getTrackEvents',
              'getVisitorActivity',
            ],
          },
        },
        default: '',
        required: true,
        description: 'Start date for the aggregation',
      },
      {
        displayName: 'End Date',
        name: 'endDate',
        type: 'dateTime',
        displayOptions: {
          show: {
            resource: ['aggregation'],
            operation: [
              'getPageEvents',
              'getFeatureEvents',
              'getGuideEvents',
              'getTrackEvents',
              'getVisitorActivity',
            ],
          },
        },
        default: '',
        required: true,
        description: 'End date for the aggregation',
      },

      // Aggregation - Visitor Activity
      {
        displayName: 'Visitor ID',
        name: 'visitorId',
        type: 'string',
        displayOptions: {
          show: {
            resource: ['aggregation'],
            operation: ['getVisitorActivity'],
          },
        },
        default: '',
        required: true,
        description: 'The visitor ID to get activity for',
      },

      // Aggregation - Additional Fields
      {
        displayName: 'Additional Fields',
        name: 'additionalFields',
        type: 'collection',
        placeholder: 'Add Field',
        default: {},
        displayOptions: {
          show: {
            resource: ['aggregation'],
            operation: ['getPageEvents', 'getFeatureEvents', 'getGuideEvents', 'getTrackEvents'],
          },
        },
        options: [
          {
            displayName: 'App ID',
            name: 'appId',
            type: 'string',
            default: '',
            description: 'Filter by application ID',
          },
          {
            displayName: 'Feature ID',
            name: 'featureId',
            type: 'string',
            default: '',
            displayOptions: {
              show: {
                '/operation': ['getFeatureEvents'],
              },
            },
            description: 'Filter by feature ID',
          },
          {
            displayName: 'Guide ID',
            name: 'guideId',
            type: 'string',
            default: '',
            displayOptions: {
              show: {
                '/operation': ['getGuideEvents'],
              },
            },
            description: 'Filter by guide ID',
          },
          {
            displayName: 'Page ID',
            name: 'pageId',
            type: 'string',
            default: '',
            displayOptions: {
              show: {
                '/operation': ['getPageEvents'],
              },
            },
            description: 'Filter by page ID',
          },
          {
            displayName: 'Track Type ID',
            name: 'trackTypeId',
            type: 'string',
            default: '',
            displayOptions: {
              show: {
                '/operation': ['getTrackEvents'],
              },
            },
            description: 'Filter by track type ID',
          },
        ],
      },

      // ==================== VISITOR OPERATIONS ====================
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['visitor'],
          },
        },
        options: [
          {
            name: 'Delete',
            value: 'delete',
            description: 'Delete visitors (bulk)',
            action: 'Delete visitors',
          },
          {
            name: 'Get',
            value: 'get',
            description: 'Get a visitor by ID',
            action: 'Get a visitor',
          },
          {
            name: 'Get Many',
            value: 'getMany',
            description: 'Get multiple visitors',
            action: 'Get many visitors',
          },
          {
            name: 'Update',
            value: 'update',
            description: 'Update visitor metadata',
            action: 'Update a visitor',
          },
        ],
        default: 'get',
      },

      // Visitor ID field
      {
        displayName: 'Visitor ID',
        name: 'visitorId',
        type: 'string',
        displayOptions: {
          show: {
            resource: ['visitor'],
            operation: ['get', 'update'],
          },
        },
        default: '',
        required: true,
        description: 'The visitor ID',
      },

      // Visitor IDs for delete
      {
        displayName: 'Visitor IDs',
        name: 'visitorIds',
        type: 'string',
        displayOptions: {
          show: {
            resource: ['visitor'],
            operation: ['delete'],
          },
        },
        default: '',
        required: true,
        description: 'Comma-separated list of visitor IDs to delete',
      },

      // Return All for Get Many
      {
        displayName: 'Return All',
        name: 'returnAll',
        type: 'boolean',
        displayOptions: {
          show: {
            resource: ['visitor'],
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
            resource: ['visitor'],
            operation: ['getMany'],
            returnAll: [false],
          },
        },
        typeOptions: {
          minValue: 1,
          maxValue: 1000,
        },
        default: 50,
        description: 'Max number of results to return',
      },

      // Visitor Additional Fields for Get Many
      {
        displayName: 'Additional Fields',
        name: 'additionalFields',
        type: 'collection',
        placeholder: 'Add Field',
        default: {},
        displayOptions: {
          show: {
            resource: ['visitor'],
            operation: ['getMany'],
          },
        },
        options: [
          {
            displayName: 'Account ID',
            name: 'accountId',
            type: 'string',
            default: '',
            description: 'Filter by account ID',
          },
          {
            displayName: 'Segment',
            name: 'segment',
            type: 'string',
            default: '',
            description: 'Filter by segment ID',
          },
        ],
      },

      // Visitor Update Fields
      {
        displayName: 'Update Fields',
        name: 'updateFields',
        type: 'collection',
        placeholder: 'Add Field',
        default: {},
        displayOptions: {
          show: {
            resource: ['visitor'],
            operation: ['update'],
          },
        },
        options: [
          {
            displayName: 'Account ID',
            name: 'accountId',
            type: 'string',
            default: '',
            description: 'The account ID to associate with the visitor',
          },
          {
            displayName: 'Metadata (JSON)',
            name: 'metadata',
            type: 'json',
            default: '{}',
            description: 'Custom metadata fields as JSON object',
          },
        ],
      },

      // ==================== ACCOUNT OPERATIONS ====================
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['account'],
          },
        },
        options: [
          {
            name: 'Delete',
            value: 'delete',
            description: 'Delete an account',
            action: 'Delete an account',
          },
          {
            name: 'Get',
            value: 'get',
            description: 'Get an account by ID',
            action: 'Get an account',
          },
          {
            name: 'Get Many',
            value: 'getMany',
            description: 'Get multiple accounts',
            action: 'Get many accounts',
          },
          {
            name: 'Update',
            value: 'update',
            description: 'Update account metadata',
            action: 'Update an account',
          },
        ],
        default: 'get',
      },

      // Account ID field
      {
        displayName: 'Account ID',
        name: 'accountId',
        type: 'string',
        displayOptions: {
          show: {
            resource: ['account'],
            operation: ['get', 'update', 'delete'],
          },
        },
        default: '',
        required: true,
        description: 'The account ID',
      },

      // Return All for Account Get Many
      {
        displayName: 'Return All',
        name: 'returnAll',
        type: 'boolean',
        displayOptions: {
          show: {
            resource: ['account'],
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
            resource: ['account'],
            operation: ['getMany'],
            returnAll: [false],
          },
        },
        typeOptions: {
          minValue: 1,
          maxValue: 1000,
        },
        default: 50,
        description: 'Max number of results to return',
      },

      // Account Additional Fields for Get Many
      {
        displayName: 'Additional Fields',
        name: 'additionalFields',
        type: 'collection',
        placeholder: 'Add Field',
        default: {},
        displayOptions: {
          show: {
            resource: ['account'],
            operation: ['getMany'],
          },
        },
        options: [
          {
            displayName: 'Segment',
            name: 'segment',
            type: 'string',
            default: '',
            description: 'Filter by segment ID',
          },
        ],
      },

      // Account Update Fields
      {
        displayName: 'Update Fields',
        name: 'updateFields',
        type: 'collection',
        placeholder: 'Add Field',
        default: {},
        displayOptions: {
          show: {
            resource: ['account'],
            operation: ['update'],
          },
        },
        options: [
          {
            displayName: 'Metadata (JSON)',
            name: 'metadata',
            type: 'json',
            default: '{}',
            description: 'Custom metadata fields as JSON object',
          },
        ],
      },

      // ==================== GUIDE OPERATIONS ====================
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['guide'],
          },
        },
        options: [
          {
            name: 'Get',
            value: 'get',
            description: 'Get a guide by ID',
            action: 'Get a guide',
          },
          {
            name: 'Get Analytics',
            value: 'getAnalytics',
            description: 'Get guide performance analytics',
            action: 'Get guide analytics',
          },
          {
            name: 'Get Many',
            value: 'getMany',
            description: 'Get multiple guides',
            action: 'Get many guides',
          },
          {
            name: 'Update',
            value: 'update',
            description: 'Update guide settings',
            action: 'Update a guide',
          },
        ],
        default: 'get',
      },

      // Guide ID field
      {
        displayName: 'Guide ID',
        name: 'guideId',
        type: 'string',
        displayOptions: {
          show: {
            resource: ['guide'],
            operation: ['get', 'update', 'getAnalytics'],
          },
        },
        default: '',
        required: true,
        description: 'The guide ID',
      },

      // Guide Analytics Date Range
      {
        displayName: 'Start Date',
        name: 'startDate',
        type: 'dateTime',
        displayOptions: {
          show: {
            resource: ['guide'],
            operation: ['getAnalytics'],
          },
        },
        default: '',
        required: true,
        description: 'Start date for analytics',
      },
      {
        displayName: 'End Date',
        name: 'endDate',
        type: 'dateTime',
        displayOptions: {
          show: {
            resource: ['guide'],
            operation: ['getAnalytics'],
          },
        },
        default: '',
        required: true,
        description: 'End date for analytics',
      },

      // Return All for Guide Get Many
      {
        displayName: 'Return All',
        name: 'returnAll',
        type: 'boolean',
        displayOptions: {
          show: {
            resource: ['guide'],
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
            resource: ['guide'],
            operation: ['getMany'],
            returnAll: [false],
          },
        },
        typeOptions: {
          minValue: 1,
          maxValue: 1000,
        },
        default: 50,
        description: 'Max number of results to return',
      },

      // Guide Additional Fields for Get Many
      {
        displayName: 'Additional Fields',
        name: 'additionalFields',
        type: 'collection',
        placeholder: 'Add Field',
        default: {},
        displayOptions: {
          show: {
            resource: ['guide'],
            operation: ['getMany'],
          },
        },
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
              { name: 'Disabled', value: 'disabled' },
              { name: 'Draft', value: 'draft' },
              { name: 'Public', value: 'public' },
              { name: 'Staged', value: 'staged' },
            ],
            default: 'public',
            description: 'Filter by guide state',
          },
        ],
      },

      // Guide Update Fields
      {
        displayName: 'Update Fields',
        name: 'updateFields',
        type: 'collection',
        placeholder: 'Add Field',
        default: {},
        displayOptions: {
          show: {
            resource: ['guide'],
            operation: ['update'],
          },
        },
        options: [
          {
            displayName: 'Launch Method',
            name: 'launchMethod',
            type: 'options',
            options: [
              { name: 'Auto', value: 'auto' },
              { name: 'Badge', value: 'badge' },
              { name: 'Dom', value: 'dom' },
              { name: 'Launcher', value: 'launcher' },
            ],
            default: 'auto',
            description: 'How the guide is launched',
          },
          {
            displayName: 'Name',
            name: 'name',
            type: 'string',
            default: '',
            description: 'The guide name',
          },
          {
            displayName: 'State',
            name: 'state',
            type: 'options',
            options: [
              { name: 'Disabled', value: 'disabled' },
              { name: 'Draft', value: 'draft' },
              { name: 'Public', value: 'public' },
              { name: 'Staged', value: 'staged' },
            ],
            default: 'draft',
            description: 'The guide state',
          },
        ],
      },

      // ==================== SEGMENT OPERATIONS ====================
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['segment'],
          },
        },
        options: [
          {
            name: 'Create',
            value: 'create',
            description: 'Create a new segment',
            action: 'Create a segment',
          },
          {
            name: 'Get',
            value: 'get',
            description: 'Get a segment by ID',
            action: 'Get a segment',
          },
          {
            name: 'Get Many',
            value: 'getMany',
            description: 'Get multiple segments',
            action: 'Get many segments',
          },
        ],
        default: 'get',
      },

      // Segment ID field
      {
        displayName: 'Segment ID',
        name: 'segmentId',
        type: 'string',
        displayOptions: {
          show: {
            resource: ['segment'],
            operation: ['get'],
          },
        },
        default: '',
        required: true,
        description: 'The segment ID',
      },

      // Segment Create fields
      {
        displayName: 'Name',
        name: 'name',
        type: 'string',
        displayOptions: {
          show: {
            resource: ['segment'],
            operation: ['create'],
          },
        },
        default: '',
        required: true,
        description: 'The segment name',
      },
      {
        displayName: 'Definition (JSON)',
        name: 'definition',
        type: 'json',
        displayOptions: {
          show: {
            resource: ['segment'],
            operation: ['create'],
          },
        },
        default: '{}',
        required: true,
        description: 'The segment definition rules as JSON',
      },

      // Return All for Segment Get Many
      {
        displayName: 'Return All',
        name: 'returnAll',
        type: 'boolean',
        displayOptions: {
          show: {
            resource: ['segment'],
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
            resource: ['segment'],
            operation: ['getMany'],
            returnAll: [false],
          },
        },
        typeOptions: {
          minValue: 1,
          maxValue: 1000,
        },
        default: 50,
        description: 'Max number of results to return',
      },

      // Segment Additional Fields
      {
        displayName: 'Additional Fields',
        name: 'additionalFields',
        type: 'collection',
        placeholder: 'Add Field',
        default: {},
        displayOptions: {
          show: {
            resource: ['segment'],
            operation: ['create', 'getMany'],
          },
        },
        options: [
          {
            displayName: 'App ID',
            name: 'appId',
            type: 'string',
            default: '',
            description: 'The application ID',
          },
          {
            displayName: 'Shared',
            name: 'shared',
            type: 'boolean',
            default: false,
            displayOptions: {
              show: {
                '/operation': ['create'],
              },
            },
            description: 'Whether the segment is shared',
          },
        ],
      },

      // ==================== TRACK EVENT OPERATIONS ====================
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['trackEvent'],
          },
        },
        options: [
          {
            name: 'Create',
            value: 'create',
            description: 'Create a new track event definition',
            action: 'Create a track event',
          },
          {
            name: 'Get',
            value: 'get',
            description: 'Get a track event by ID',
            action: 'Get a track event',
          },
          {
            name: 'Get Many',
            value: 'getMany',
            description: 'Get multiple track events',
            action: 'Get many track events',
          },
        ],
        default: 'get',
      },

      // Track Event ID field
      {
        displayName: 'Track Event ID',
        name: 'trackEventId',
        type: 'string',
        displayOptions: {
          show: {
            resource: ['trackEvent'],
            operation: ['get'],
          },
        },
        default: '',
        required: true,
        description: 'The track event ID',
      },

      // Track Event Create fields
      {
        displayName: 'Name',
        name: 'name',
        type: 'string',
        displayOptions: {
          show: {
            resource: ['trackEvent'],
            operation: ['create'],
          },
        },
        default: '',
        required: true,
        description: 'The track event name',
      },

      // Return All for Track Event Get Many
      {
        displayName: 'Return All',
        name: 'returnAll',
        type: 'boolean',
        displayOptions: {
          show: {
            resource: ['trackEvent'],
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
            resource: ['trackEvent'],
            operation: ['getMany'],
            returnAll: [false],
          },
        },
        typeOptions: {
          minValue: 1,
          maxValue: 1000,
        },
        default: 50,
        description: 'Max number of results to return',
      },

      // Track Event Additional Fields
      {
        displayName: 'Additional Fields',
        name: 'additionalFields',
        type: 'collection',
        placeholder: 'Add Field',
        default: {},
        displayOptions: {
          show: {
            resource: ['trackEvent'],
            operation: ['create', 'getMany'],
          },
        },
        options: [
          {
            displayName: 'App ID',
            name: 'appId',
            type: 'string',
            default: '',
            description: 'The application ID',
          },
          {
            displayName: 'Definition (JSON)',
            name: 'definition',
            type: 'json',
            default: '{}',
            displayOptions: {
              show: {
                '/operation': ['create'],
              },
            },
            description: 'The track event definition as JSON',
          },
          {
            displayName: 'Description',
            name: 'description',
            type: 'string',
            default: '',
            displayOptions: {
              show: {
                '/operation': ['create'],
              },
            },
            description: 'The track event description',
          },
          {
            displayName: 'Group',
            name: 'group',
            type: 'string',
            default: '',
            displayOptions: {
              show: {
                '/operation': ['create'],
              },
            },
            description: 'The track event group',
          },
        ],
      },

      // ==================== FEEDBACK OPERATIONS ====================
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['feedback'],
          },
        },
        options: [
          {
            name: 'Create',
            value: 'create',
            description: 'Create a new feedback request',
            action: 'Create a feedback request',
          },
          {
            name: 'Get',
            value: 'get',
            description: 'Get a feedback request by ID',
            action: 'Get a feedback request',
          },
          {
            name: 'Get Many',
            value: 'getMany',
            description: 'Get multiple feedback requests',
            action: 'Get many feedback requests',
          },
          {
            name: 'Get Votes',
            value: 'getVotes',
            description: 'Get votes on a feedback request',
            action: 'Get votes on a feedback request',
          },
          {
            name: 'Update',
            value: 'update',
            description: 'Update a feedback request',
            action: 'Update a feedback request',
          },
        ],
        default: 'get',
      },

      // Feedback Request ID
      {
        displayName: 'Request ID',
        name: 'requestId',
        type: 'string',
        displayOptions: {
          show: {
            resource: ['feedback'],
            operation: ['get', 'update', 'getVotes'],
          },
        },
        default: '',
        required: true,
        description: 'The feedback request ID',
      },

      // Feedback Create Title
      {
        displayName: 'Title',
        name: 'title',
        type: 'string',
        displayOptions: {
          show: {
            resource: ['feedback'],
            operation: ['create'],
          },
        },
        default: '',
        required: true,
        description: 'The feedback request title',
      },

      // Return All for Feedback Get Many
      {
        displayName: 'Return All',
        name: 'returnAll',
        type: 'boolean',
        displayOptions: {
          show: {
            resource: ['feedback'],
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
            resource: ['feedback'],
            operation: ['getMany'],
            returnAll: [false],
          },
        },
        typeOptions: {
          minValue: 1,
          maxValue: 1000,
        },
        default: 50,
        description: 'Max number of results to return',
      },

      // Feedback Create Additional Fields
      {
        displayName: 'Additional Fields',
        name: 'additionalFields',
        type: 'collection',
        placeholder: 'Add Field',
        default: {},
        displayOptions: {
          show: {
            resource: ['feedback'],
            operation: ['create', 'getMany'],
          },
        },
        options: [
          {
            displayName: 'Description',
            name: 'description',
            type: 'string',
            typeOptions: {
              rows: 4,
            },
            default: '',
            displayOptions: {
              show: {
                '/operation': ['create'],
              },
            },
            description: 'The feedback request description',
          },
          {
            displayName: 'External URL',
            name: 'externalUrl',
            type: 'string',
            default: '',
            displayOptions: {
              show: {
                '/operation': ['create'],
              },
            },
            description: 'External URL for the feedback request',
          },
          {
            displayName: 'Priority',
            name: 'priority',
            type: 'options',
            options: [
              { name: 'Critical', value: 'critical' },
              { name: 'High', value: 'high' },
              { name: 'Low', value: 'low' },
              { name: 'Medium', value: 'medium' },
            ],
            default: 'medium',
            description: 'The priority level',
          },
          {
            displayName: 'Product Area',
            name: 'productArea',
            type: 'string',
            default: '',
            description: 'The product area',
          },
          {
            displayName: 'Sort By',
            name: 'sortBy',
            type: 'options',
            options: [
              { name: 'Created', value: 'created' },
              { name: 'Title', value: 'title' },
              { name: 'Updated', value: 'updated' },
              { name: 'Votes', value: 'votes' },
            ],
            default: 'created',
            displayOptions: {
              show: {
                '/operation': ['getMany'],
              },
            },
            description: 'Sort results by',
          },
          {
            displayName: 'Status',
            name: 'status',
            type: 'options',
            options: [
              { name: 'Closed', value: 'closed' },
              { name: 'In Progress', value: 'in-progress' },
              { name: 'Open', value: 'open' },
              { name: 'Planned', value: 'planned' },
            ],
            default: 'open',
            description: 'The status',
          },
          {
            displayName: 'Tags',
            name: 'tags',
            type: 'string',
            default: '',
            displayOptions: {
              show: {
                '/operation': ['create'],
              },
            },
            description: 'Comma-separated list of tags',
          },
        ],
      },

      // Feedback Update Fields
      {
        displayName: 'Update Fields',
        name: 'updateFields',
        type: 'collection',
        placeholder: 'Add Field',
        default: {},
        displayOptions: {
          show: {
            resource: ['feedback'],
            operation: ['update'],
          },
        },
        options: [
          {
            displayName: 'Description',
            name: 'description',
            type: 'string',
            typeOptions: {
              rows: 4,
            },
            default: '',
            description: 'The feedback request description',
          },
          {
            displayName: 'Priority',
            name: 'priority',
            type: 'options',
            options: [
              { name: 'Critical', value: 'critical' },
              { name: 'High', value: 'high' },
              { name: 'Low', value: 'low' },
              { name: 'Medium', value: 'medium' },
            ],
            default: 'medium',
            description: 'The priority level',
          },
          {
            displayName: 'Product Area',
            name: 'productArea',
            type: 'string',
            default: '',
            description: 'The product area',
          },
          {
            displayName: 'Status',
            name: 'status',
            type: 'options',
            options: [
              { name: 'Closed', value: 'closed' },
              { name: 'In Progress', value: 'in-progress' },
              { name: 'Open', value: 'open' },
              { name: 'Planned', value: 'planned' },
            ],
            default: 'open',
            description: 'The status',
          },
          {
            displayName: 'Tags',
            name: 'tags',
            type: 'string',
            default: '',
            description: 'Comma-separated list of tags',
          },
          {
            displayName: 'Title',
            name: 'title',
            type: 'string',
            default: '',
            description: 'The feedback request title',
          },
        ],
      },

      // ==================== PAGE OPERATIONS ====================
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

      // Page - ID field
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

      // Page - getMany
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

      // Page - create
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

      // Page - update
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

      // Page - getAnalytics
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

      // ==================== FEATURE OPERATIONS ====================
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

      // Feature - ID field
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

      // Feature - getMany
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

      // Feature - create
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

      // Feature - update
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

      // Feature - getAnalytics / getAdoption
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

      // ==================== NPS OPERATIONS ====================
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

      // NPS - ID field
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

      // NPS - getMany
      {
        displayName: 'Return All',
        name: 'returnAll',
        type: 'boolean',
        displayOptions: {
          show: {
            resource: ['nps'],
            operation: ['getMany', 'getResponses'],
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
            operation: ['getMany', 'getResponses'],
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

      // NPS - create
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

      // NPS - update
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

      // NPS - getResponses options
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
            displayName: 'End Date',
            name: 'endDate',
            type: 'dateTime',
            default: '',
            description: 'Filter responses until this date',
          },
          {
            displayName: 'Start Date',
            name: 'startDate',
            type: 'dateTime',
            default: '',
            description: 'Filter responses from this date',
          },
        ],
      },

      // NPS - getAnalytics
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

      // NPS - exportData
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
            displayName: 'End Date',
            name: 'endDate',
            type: 'dateTime',
            default: '',
            description: 'Export data until this date',
          },
          {
            displayName: 'Start Date',
            name: 'startDate',
            type: 'dateTime',
            default: '',
            description: 'Export data from this date',
          },
        ],
      },

      // ==================== REPORT OPERATIONS ====================
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

      // Report - ID field
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

      // Report - getMany
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
              { name: 'Custom', value: 'custom' },
              { name: 'Funnel', value: 'funnel' },
              { name: 'Path', value: 'path' },
              { name: 'Retention', value: 'retention' },
            ],
            default: '',
            description: 'Filter by report type',
          },
        ],
      },

      // Report - create
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
          { name: 'Custom', value: 'custom' },
          { name: 'Funnel', value: 'funnel' },
          { name: 'Path', value: 'path' },
          { name: 'Retention', value: 'retention' },
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

      // Report - update
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

      // Report - run
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
                displayName: 'End Date',
                name: 'endDate',
                type: 'dateTime',
                default: '',
                description: 'End date for the report',
              },
              {
                displayName: 'Start Date',
                name: 'startDate',
                type: 'dateTime',
                default: '',
                description: 'Start date for the report',
              },
            ],
          },
        ],
        description: 'Date range for the report execution',
      },

      // Report - export
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
          { name: 'CSV', value: 'csv' },
          { name: 'JSON', value: 'json' },
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
            displayName: 'End Date',
            name: 'endDate',
            type: 'dateTime',
            default: '',
            description: 'Export data until this date',
          },
          {
            displayName: 'Start Date',
            name: 'startDate',
            type: 'dateTime',
            default: '',
            description: 'Export data from this date',
          },
        ],
      },

      // Report - schedule
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
                displayName: 'Enabled',
                name: 'enabled',
                type: 'boolean',
                default: true,
                description: 'Whether the schedule is active',
              },
              {
                displayName: 'Format',
                name: 'format',
                type: 'options',
                options: [
                  { name: 'CSV', value: 'csv' },
                  { name: 'PDF', value: 'pdf' },
                ],
                default: 'pdf',
                description: 'Report format for delivery',
              },
              {
                displayName: 'Frequency',
                name: 'frequency',
                type: 'options',
                options: [
                  { name: 'Daily', value: 'daily' },
                  { name: 'Monthly', value: 'monthly' },
                  { name: 'Weekly', value: 'weekly' },
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
            ],
          },
        ],
        description: 'Schedule configuration for the report',
      },

      // ==================== WEBHOOK OPERATIONS ====================
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

      // Webhook - ID field
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

      // Webhook - getMany
      {
        displayName: 'Return All',
        name: 'returnAll',
        type: 'boolean',
        displayOptions: {
          show: {
            resource: ['webhook'],
            operation: ['getMany', 'getDeliveries'],
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
            operation: ['getMany', 'getDeliveries'],
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

      // Webhook - create
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

      // Webhook - update
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

      // Webhook - getDeliveries filters
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
            displayName: 'End Date',
            name: 'endDate',
            type: 'dateTime',
            default: '',
            description: 'Filter deliveries until this date',
          },
          {
            displayName: 'Start Date',
            name: 'startDate',
            type: 'dateTime',
            default: '',
            description: 'Filter deliveries from this date',
          },
          {
            displayName: 'Status',
            name: 'status',
            type: 'options',
            options: [
              { name: 'All', value: '' },
              { name: 'Failed', value: 'failed' },
              { name: 'Success', value: 'success' },
            ],
            default: '',
            description: 'Filter by delivery status',
          },
        ],
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

    const resource = this.getNodeParameter('resource', 0) as string;
    const operation = this.getNodeParameter('operation', 0) as string;

    for (let i = 0; i < items.length; i++) {
      try {
        let result: INodeExecutionData[] = [];

        switch (resource) {
          case 'aggregation':
            switch (operation) {
              case 'runAggregation':
                result = await aggregation.runAggregation.call(this, i);
                break;
              case 'getPageEvents':
                result = await aggregation.getPageEvents.call(this, i);
                break;
              case 'getFeatureEvents':
                result = await aggregation.getFeatureEvents.call(this, i);
                break;
              case 'getGuideEvents':
                result = await aggregation.getGuideEvents.call(this, i);
                break;
              case 'getTrackEvents':
                result = await aggregation.getTrackEvents.call(this, i);
                break;
              case 'getVisitorActivity':
                result = await aggregation.getVisitorActivity.call(this, i);
                break;
              case 'getPollEvents':
                result = await aggregation.getPollEvents.call(this, i);
                break;
              case 'getAccountActivity':
                result = await aggregation.getAccountActivity.call(this, i);
                break;
              case 'runTimeSeries':
                result = await aggregation.runTimeSeries.call(this, i);
                break;
              default:
                throw new NodeOperationError(
                  this.getNode(),
                  `Unknown aggregation operation: ${operation}`,
                );
            }
            break;

          case 'visitor':
            switch (operation) {
              case 'get':
                result = await visitor.get.call(this, i);
                break;
              case 'getMany':
                result = await visitor.getMany.call(this, i);
                break;
              case 'update':
                result = await visitor.update.call(this, i);
                break;
              case 'delete':
                result = await visitor.deleteVisitor.call(this, i);
                break;
              case 'search':
                result = await visitor.search.call(this, i);
                break;
              case 'getHistory':
                result = await visitor.getHistory.call(this, i);
                break;
              case 'getGuideHistory':
                result = await visitor.getGuideHistory.call(this, i);
                break;
              case 'merge':
                result = await visitor.merge.call(this, i);
                break;
              case 'getAccounts':
                result = await visitor.getAccounts.call(this, i);
                break;
              default:
                throw new NodeOperationError(
                  this.getNode(),
                  `Unknown visitor operation: ${operation}`,
                );
            }
            break;

          case 'account':
            switch (operation) {
              case 'get':
                result = await account.get.call(this, i);
                break;
              case 'getMany':
                result = await account.getMany.call(this, i);
                break;
              case 'update':
                result = await account.update.call(this, i);
                break;
              case 'delete':
                result = await account.deleteAccount.call(this, i);
                break;
              case 'search':
                result = await account.search.call(this, i);
                break;
              case 'bulkDelete':
                result = await account.bulkDelete.call(this, i);
                break;
              case 'getVisitors':
                result = await account.getVisitors.call(this, i);
                break;
              case 'getHistory':
                result = await account.getHistory.call(this, i);
                break;
              case 'getGuideHistory':
                result = await account.getGuideHistory.call(this, i);
                break;
              default:
                throw new NodeOperationError(
                  this.getNode(),
                  `Unknown account operation: ${operation}`,
                );
            }
            break;

          case 'guide':
            switch (operation) {
              case 'get':
                result = await guide.get.call(this, i);
                break;
              case 'getMany':
                result = await guide.getMany.call(this, i);
                break;
              case 'update':
                result = await guide.update.call(this, i);
                break;
              case 'getAnalytics':
                result = await guide.getAnalytics.call(this, i);
                break;
              case 'create':
                result = await guide.create.call(this, i);
                break;
              case 'delete':
                result = await guide.deleteGuide.call(this, i);
                break;
              case 'enable':
                result = await guide.enable.call(this, i);
                break;
              case 'disable':
                result = await guide.disable.call(this, i);
                break;
              case 'getSteps':
                result = await guide.getSteps.call(this, i);
                break;
              case 'getBySegment':
                result = await guide.getBySegment.call(this, i);
                break;
              default:
                throw new NodeOperationError(
                  this.getNode(),
                  `Unknown guide operation: ${operation}`,
                );
            }
            break;

          case 'segment':
            switch (operation) {
              case 'get':
                result = await segment.get.call(this, i);
                break;
              case 'getMany':
                result = await segment.getMany.call(this, i);
                break;
              case 'create':
                result = await segment.create.call(this, i);
                break;
              case 'update':
                result = await segment.update.call(this, i);
                break;
              case 'delete':
                result = await segment.deleteSegment.call(this, i);
                break;
              case 'getMembers':
                result = await segment.getMembers.call(this, i);
                break;
              case 'getSize':
                result = await segment.getSize.call(this, i);
                break;
              case 'clone':
                result = await segment.clone.call(this, i);
                break;
              case 'getGuides':
                result = await segment.getGuides.call(this, i);
                break;
              default:
                throw new NodeOperationError(
                  this.getNode(),
                  `Unknown segment operation: ${operation}`,
                );
            }
            break;

          case 'trackEvent':
            switch (operation) {
              case 'get':
                result = await trackEvent.get.call(this, i);
                break;
              case 'getMany':
                result = await trackEvent.getMany.call(this, i);
                break;
              case 'create':
                result = await trackEvent.create.call(this, i);
                break;
              case 'update':
                result = await trackEvent.update.call(this, i);
                break;
              case 'delete':
                result = await trackEvent.deleteTrackEvent.call(this, i);
                break;
              case 'getAnalytics':
                result = await trackEvent.getAnalytics.call(this, i);
                break;
              case 'search':
                result = await trackEvent.search.call(this, i);
                break;
              default:
                throw new NodeOperationError(
                  this.getNode(),
                  `Unknown track event operation: ${operation}`,
                );
            }
            break;

          case 'feedback':
            switch (operation) {
              case 'get':
                result = await feedback.get.call(this, i);
                break;
              case 'getMany':
                result = await feedback.getMany.call(this, i);
                break;
              case 'create':
                result = await feedback.create.call(this, i);
                break;
              case 'update':
                result = await feedback.update.call(this, i);
                break;
              case 'getVotes':
                result = await feedback.getVotes.call(this, i);
                break;
              case 'delete':
                result = await feedback.deleteRequest.call(this, i);
                break;
              case 'addVote':
                result = await feedback.addVote.call(this, i);
                break;
              case 'removeVote':
                result = await feedback.removeVote.call(this, i);
                break;
              case 'getComments':
                result = await feedback.getComments.call(this, i);
                break;
              case 'addComment':
                result = await feedback.addComment.call(this, i);
                break;
              case 'getStatus':
                result = await feedback.getStatus.call(this, i);
                break;
              default:
                throw new NodeOperationError(
                  this.getNode(),
                  `Unknown feedback operation: ${operation}`,
                );
            }
            break;

          case 'page':
            switch (operation) {
              case 'get':
                result = await page.get.call(this, i);
                break;
              case 'getMany':
                result = await page.getMany.call(this, i);
                break;
              case 'create':
                result = await page.create.call(this, i);
                break;
              case 'update':
                result = await page.update.call(this, i);
                break;
              case 'delete':
                result = await page.deletePage.call(this, i);
                break;
              case 'getAnalytics':
                result = await page.getAnalytics.call(this, i);
                break;
              case 'getRules':
                result = await page.getRules.call(this, i);
                break;
              default:
                throw new NodeOperationError(
                  this.getNode(),
                  `Unknown page operation: ${operation}`,
                );
            }
            break;

          case 'feature':
            switch (operation) {
              case 'get':
                result = await feature.get.call(this, i);
                break;
              case 'getMany':
                result = await feature.getMany.call(this, i);
                break;
              case 'create':
                result = await feature.create.call(this, i);
                break;
              case 'update':
                result = await feature.update.call(this, i);
                break;
              case 'delete':
                result = await feature.deleteFeature.call(this, i);
                break;
              case 'getAnalytics':
                result = await feature.getAnalytics.call(this, i);
                break;
              case 'getAdoption':
                result = await feature.getAdoption.call(this, i);
                break;
              default:
                throw new NodeOperationError(
                  this.getNode(),
                  `Unknown feature operation: ${operation}`,
                );
            }
            break;

          case 'nps':
            switch (operation) {
              case 'get':
                result = await nps.get.call(this, i);
                break;
              case 'getMany':
                result = await nps.getMany.call(this, i);
                break;
              case 'create':
                result = await nps.create.call(this, i);
                break;
              case 'update':
                result = await nps.update.call(this, i);
                break;
              case 'delete':
                result = await nps.deleteNps.call(this, i);
                break;
              case 'getResponses':
                result = await nps.getResponses.call(this, i);
                break;
              case 'getAnalytics':
                result = await nps.getAnalytics.call(this, i);
                break;
              case 'exportData':
                result = await nps.exportData.call(this, i);
                break;
              default:
                throw new NodeOperationError(
                  this.getNode(),
                  `Unknown NPS operation: ${operation}`,
                );
            }
            break;

          case 'report':
            switch (operation) {
              case 'get':
                result = await report.get.call(this, i);
                break;
              case 'getMany':
                result = await report.getMany.call(this, i);
                break;
              case 'create':
                result = await report.create.call(this, i);
                break;
              case 'update':
                result = await report.update.call(this, i);
                break;
              case 'delete':
                result = await report.deleteReport.call(this, i);
                break;
              case 'run':
                result = await report.run.call(this, i);
                break;
              case 'export':
                result = await report.exportReport.call(this, i);
                break;
              case 'schedule':
                result = await report.schedule.call(this, i);
                break;
              default:
                throw new NodeOperationError(
                  this.getNode(),
                  `Unknown report operation: ${operation}`,
                );
            }
            break;

          case 'webhook':
            switch (operation) {
              case 'get':
                result = await webhook.get.call(this, i);
                break;
              case 'getMany':
                result = await webhook.getMany.call(this, i);
                break;
              case 'create':
                result = await webhook.create.call(this, i);
                break;
              case 'update':
                result = await webhook.update.call(this, i);
                break;
              case 'delete':
                result = await webhook.deleteWebhook.call(this, i);
                break;
              case 'test':
                result = await webhook.test.call(this, i);
                break;
              case 'getDeliveries':
                result = await webhook.getDeliveries.call(this, i);
                break;
              default:
                throw new NodeOperationError(
                  this.getNode(),
                  `Unknown webhook operation: ${operation}`,
                );
            }
            break;

          default:
            throw new NodeOperationError(this.getNode(), `Unknown resource: ${resource}`);
        }

        returnData.push(...result);
      } catch (error) {
        if (this.continueOnFail()) {
          returnData.push({
            json: {
              error: (error as Error).message,
            },
            pairedItem: { item: i },
          });
          continue;
        }
        throw error;
      }
    }

    return [returnData];
  }
}
