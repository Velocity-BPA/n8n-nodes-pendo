import { ICredentialType, INodeProperties } from 'n8n-workflow';

export class PendoApi implements ICredentialType {
	name = 'pendoApi';
	displayName = 'Pendo API';
	documentationUrl = 'https://developers.pendo.io/docs/?bash#authentication';
	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
			description: 'Integration key from Pendo admin interface under Integrations > Integration Keys',
		},
		{
			displayName: 'API Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'https://app.pendo.io/api/v1',
			required: true,
			description: 'Base URL for Pendo API endpoints',
		},
	];
}