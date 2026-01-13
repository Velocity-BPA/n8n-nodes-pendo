/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
  IAuthenticateGeneric,
  ICredentialTestRequest,
  ICredentialType,
  INodeProperties,
} from 'n8n-workflow';

export class PendoApi implements ICredentialType {
  name = 'pendoApi';
  displayName = 'Pendo API';
  documentationUrl = 'https://developers.pendo.io/docs/';

  properties: INodeProperties[] = [
    {
      displayName: 'Integration Key',
      name: 'integrationKey',
      type: 'string',
      typeOptions: {
        password: true,
      },
      default: '',
      required: true,
      description: 'The Pendo Integration Key from Settings > Integrations',
    },
    {
      displayName: 'Region',
      name: 'region',
      type: 'options',
      options: [
        {
          name: 'US',
          value: 'US',
        },
        {
          name: 'EU',
          value: 'EU',
        },
      ],
      default: 'US',
      required: true,
      description: 'The Pendo datacenter region',
    },
    {
      displayName: 'Subdomain',
      name: 'subdomain',
      type: 'string',
      default: '',
      description: 'Custom subdomain if applicable (leave empty for standard installation)',
    },
  ];

  authenticate: IAuthenticateGeneric = {
    type: 'generic',
    properties: {
      headers: {
        'x-pendo-integration-key': '={{$credentials.integrationKey}}',
        'Content-Type': 'application/json',
      },
    },
  };

  test: ICredentialTestRequest = {
    request: {
      baseURL:
        '={{$credentials.region === "EU" ? "https://app.eu.pendo.io/api/v1" : "https://app.pendo.io/api/v1"}}',
      url: '/metadata/schema/account',
      method: 'GET',
    },
  };
}
