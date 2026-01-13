/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
  IHookFunctions,
  IWebhookFunctions,
  IDataObject,
  INodeType,
  INodeTypeDescription,
  IWebhookResponseData,
} from 'n8n-workflow';

export class PendoTrigger implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Pendo Trigger',
    name: 'pendoTrigger',
    icon: 'file:pendo.svg',
    group: ['trigger'],
    version: 1,
    subtitle: '={{$parameter["event"]}}',
    description: 'Starts the workflow when Pendo events occur',
    defaults: {
      name: 'Pendo Trigger',
    },
    inputs: [],
    outputs: ['main'],
    credentials: [
      {
        name: 'pendoApi',
        required: true,
      },
    ],
    webhooks: [
      {
        name: 'default',
        httpMethod: 'POST',
        responseMode: 'onReceived',
        path: 'webhook',
      },
    ],
    properties: [
      {
        displayName: 'Event',
        name: 'event',
        type: 'options',
        noDataExpression: true,
        options: [
          {
            name: 'Guide Dismissed',
            value: 'guideDismissed',
            description: 'Triggered when a user dismisses a guide',
          },
          {
            name: 'Guide Shown',
            value: 'guideShown',
            description: 'Triggered when a guide is shown to a user',
          },
          {
            name: 'NPS Response',
            value: 'npsResponse',
            description: 'Triggered when a user submits an NPS response',
          },
          {
            name: 'Poll Response',
            value: 'pollResponse',
            description: 'Triggered when a user responds to a poll',
          },
        ],
        default: 'guideShown',
        required: true,
        description: 'The event to listen for',
      },
      {
        displayName: 'Additional Filters',
        name: 'additionalFilters',
        type: 'collection',
        placeholder: 'Add Filter',
        default: {},
        options: [
          {
            displayName: 'App ID',
            name: 'appId',
            type: 'string',
            default: '',
            description: 'Filter events by application ID',
          },
          {
            displayName: 'Guide ID',
            name: 'guideId',
            type: 'string',
            default: '',
            description: 'Filter events by guide ID (for guide events)',
          },
        ],
      },
    ],
  };

  webhookMethods = {
    default: {
      async checkExists(this: IHookFunctions): Promise<boolean> {
        const webhookData = this.getWorkflowStaticData('node');
        const webhookUrl = this.getNodeWebhookUrl('default');

        // Check if we already have a webhook registered
        if (webhookData.webhookId) {
          // In a real implementation, you would verify the webhook still exists
          // with Pendo's API. For now, we'll just check our stored data.
          return true;
        }

        // Pendo doesn't have a standard webhook registration API
        // This would typically require setting up webhooks through
        // Pendo's integration settings or using their Data Sync
        console.log(`Pendo webhook URL: ${webhookUrl}`);

        return false;
      },

      async create(this: IHookFunctions): Promise<boolean> {
        const webhookData = this.getWorkflowStaticData('node');
        const webhookUrl = this.getNodeWebhookUrl('default');
        const event = this.getNodeParameter('event') as string;

        // Store webhook info
        // Note: Pendo webhook setup is typically done through their UI
        // or requires enterprise-level access
        webhookData.webhookId = `pendo_${event}_${Date.now()}`;
        webhookData.webhookUrl = webhookUrl;
        webhookData.event = event;

        console.log(
          `Pendo webhook created for event: ${event}. ` +
            `Configure this URL in your Pendo settings: ${webhookUrl}`,
        );

        return true;
      },

      async delete(this: IHookFunctions): Promise<boolean> {
        const webhookData = this.getWorkflowStaticData('node');

        // Clean up stored data
        delete webhookData.webhookId;
        delete webhookData.webhookUrl;
        delete webhookData.event;

        return true;
      },
    },
  };

  async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
    const req = this.getRequestObject();
    const body = req.body as IDataObject;
    const event = this.getNodeParameter('event') as string;
    const additionalFilters = this.getNodeParameter('additionalFilters', {}) as IDataObject;

    // Validate the incoming webhook
    if (!body) {
      return {
        webhookResponse: {
          statusCode: 400,
          body: { error: 'No body provided' },
        },
      };
    }

    // Apply filters if configured
    if (additionalFilters.appId && body.appId !== additionalFilters.appId) {
      return {
        webhookResponse: {
          statusCode: 200,
          body: { status: 'filtered', reason: 'appId mismatch' },
        },
      };
    }

    if (additionalFilters.guideId && body.guideId !== additionalFilters.guideId) {
      return {
        webhookResponse: {
          statusCode: 200,
          body: { status: 'filtered', reason: 'guideId mismatch' },
        },
      };
    }

    // Parse the event data
    const eventData: IDataObject = {
      event,
      timestamp: new Date().toISOString(),
      ...body,
    };

    return {
      workflowData: [this.helpers.returnJsonArray([eventData])],
    };
  }
}
