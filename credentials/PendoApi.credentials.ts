import { ICredentialType, INodeProperties } from 'n8n-workflow';

export class PendoApi implements ICredentialType {
	name = 'pendoApi';
	displayName = 'Pendo API';
	documentationUrl = 'https://engageapi.pendo.io/';
	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description: 'The API key for Pendo integration. Generate this in Pendo under Settings > Integrations.',
		},
		{
			displayName: 'API Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'https://app.pendo.io/api/v1',
			required: true,
			description: 'Base URL for the Pendo API',
		},
	];
}