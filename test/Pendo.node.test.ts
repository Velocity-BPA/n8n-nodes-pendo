/**
 * Copyright (c) 2026 Velocity BPA
 * Licensed under the Business Source License 1.1
 */

import { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { Pendo } from '../nodes/Pendo/Pendo.node';

// Mock n8n-workflow
jest.mock('n8n-workflow', () => ({
  ...jest.requireActual('n8n-workflow'),
  NodeApiError: class NodeApiError extends Error {
    constructor(node: any, error: any) { super(error.message || 'API Error'); }
  },
  NodeOperationError: class NodeOperationError extends Error {
    constructor(node: any, message: string) { super(message); }
  },
}));

describe('Pendo Node', () => {
  let node: Pendo;

  beforeAll(() => {
    node = new Pendo();
  });

  describe('Node Definition', () => {
    it('should have correct basic properties', () => {
      expect(node.description.displayName).toBe('Pendo');
      expect(node.description.name).toBe('pendo');
      expect(node.description.version).toBe(1);
      expect(node.description.inputs).toContain('main');
      expect(node.description.outputs).toContain('main');
    });

    it('should define 7 resources', () => {
      const resourceProp = node.description.properties.find(
        (p: any) => p.name === 'resource'
      );
      expect(resourceProp).toBeDefined();
      expect(resourceProp!.type).toBe('options');
      expect(resourceProp!.options).toHaveLength(7);
    });

    it('should have operation dropdowns for each resource', () => {
      const operations = node.description.properties.filter(
        (p: any) => p.name === 'operation'
      );
      expect(operations.length).toBe(7);
    });

    it('should require credentials', () => {
      expect(node.description.credentials).toBeDefined();
      expect(node.description.credentials!.length).toBeGreaterThan(0);
      expect(node.description.credentials![0].required).toBe(true);
    });

    it('should have parameters with proper displayOptions', () => {
      const params = node.description.properties.filter(
        (p: any) => p.displayOptions?.show?.resource
      );
      for (const param of params) {
        expect(param.displayOptions.show.resource).toBeDefined();
        expect(Array.isArray(param.displayOptions.show.resource)).toBe(true);
      }
    });
  });

  // Resource-specific tests
describe('Account Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({ 
        apiKey: 'test-key', 
        baseUrl: 'https://app.pendo.io/api/v1' 
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: { 
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn() 
      },
    };
  });

  describe('getAllAccounts', () => {
    it('should retrieve all accounts successfully', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        if (param === 'operation') return 'getAllAccounts';
        if (param === 'limit') return 100;
        if (param === 'offset') return 0;
        return undefined;
      });

      const mockResponse = { accounts: [{ id: '1', name: 'Test Account' }] };
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeAccountOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://app.pendo.io/api/v1/account?limit=100&offset=0',
        headers: {
          'X-Pendo-Integration-Key': 'test-key',
          'Content-Type': 'application/json',
        },
        json: true,
      });
      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
    });

    it('should handle getAllAccounts errors', async () => {
      mockExecuteFunctions.getNodeParameter.mockReturnValue('getAllAccounts');
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));
      mockExecuteFunctions.continueOnFail.mockReturnValue(true);

      const result = await executeAccountOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{ json: { error: 'API Error' }, pairedItem: { item: 0 } }]);
    });
  });

  describe('getAccount', () => {
    it('should get a specific account successfully', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        if (param === 'operation') return 'getAccount';
        if (param === 'accountId') return 'account123';
        return undefined;
      });

      const mockResponse = { id: 'account123', name: 'Test Account' };
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeAccountOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://app.pendo.io/api/v1/account/account123',
        headers: {
          'X-Pendo-Integration-Key': 'test-key',
          'Content-Type': 'application/json',
        },
        json: true,
      });
      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
    });
  });

  describe('createAccount', () => {
    it('should create an account successfully', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        if (param === 'operation') return 'createAccount';
        if (param === 'accountId') return 'new-account';
        if (param === 'metadata') return {
          metadataFields: [{ key: 'plan', value: 'premium' }]
        };
        return undefined;
      });

      const mockResponse = { id: 'new-account', created: true };
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeAccountOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'POST',
        url: 'https://app.pendo.io/api/v1/account',
        headers: {
          'X-Pendo-Integration-Key': 'test-key',
          'Content-Type': 'application/json',
        },
        body: {
          accountId: 'new-account',
          metadata: { plan: 'premium' }
        },
        json: true,
      });
      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
    });
  });

  describe('updateAccount', () => {
    it('should update an account successfully', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        if (param === 'operation') return 'updateAccount';
        if (param === 'accountId') return 'account123';
        if (param === 'metadata') return {
          metadataFields: [{ key: 'status', value: 'active' }]
        };
        return undefined;
      });

      const mockResponse = { id: 'account123', updated: true };
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeAccountOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'PUT',
        url: 'https://app.pendo.io/api/v1/account/account123',
        headers: {
          'X-Pendo-Integration-Key': 'test-key',
          'Content-Type': 'application/json',
        },
        body: {
          metadata: { status: 'active' }
        },
        json: true,
      });
      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
    });
  });

  describe('deleteAccount', () => {
    it('should delete an account successfully', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        if (param === 'operation') return 'deleteAccount';
        if (param === 'accountId') return 'account123';
        return undefined;
      });

      const mockResponse = { deleted: true };
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeAccountOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'DELETE',
        url: 'https://app.pendo.io/api/v1/account/account123',
        headers: {
          'X-Pendo-Integration-Key': 'test-key',
          'Content-Type': 'application/json',
        },
        json: true,
      });
      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
    });
  });
});

describe('Visitor Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({ 
        apiKey: 'test-key', 
        baseUrl: 'https://app.pendo.io/api/v1' 
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: { 
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn() 
      },
    };
  });

  describe('getAllVisitors', () => {
    it('should retrieve all visitors successfully', async () => {
      const mockResponse = { visitors: [{ visitorId: 'test-visitor-1' }] };
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getAllVisitors')
        .mockReturnValueOnce('')
        .mockReturnValueOnce('')
        .mockReturnValueOnce('-createdAt')
        .mockReturnValueOnce(100)
        .mockReturnValueOnce(0);
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeVisitorOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://app.pendo.io/api/v1/visitor',
        headers: {
          'X-Pendo-Integration-Key': 'test-key',
          'Content-Type': 'application/json'
        },
        qs: { sort: '-createdAt', limit: 100, offset: 0 },
        json: true
      });
      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
    });
  });

  describe('getVisitor', () => {
    it('should get a specific visitor successfully', async () => {
      const mockResponse = { visitorId: 'test-visitor-1' };
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getVisitor')
        .mockReturnValueOnce('test-visitor-1');
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeVisitorOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://app.pendo.io/api/v1/visitor/test-visitor-1',
        headers: {
          'X-Pendo-Integration-Key': 'test-key',
          'Content-Type': 'application/json'
        },
        json: true
      });
      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
    });
  });

  describe('createVisitor', () => {
    it('should create a visitor successfully', async () => {
      const mockResponse = { visitorId: 'new-visitor' };
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('createVisitor')
        .mockReturnValueOnce('new-visitor')
        .mockReturnValueOnce('{"role": "admin"}');
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeVisitorOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'POST',
        url: 'https://app.pendo.io/api/v1/visitor',
        headers: {
          'X-Pendo-Integration-Key': 'test-key',
          'Content-Type': 'application/json'
        },
        body: {
          visitorId: 'new-visitor',
          metadata: { role: 'admin' }
        },
        json: true
      });
      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
    });
  });

  describe('updateVisitor', () => {
    it('should update a visitor successfully', async () => {
      const mockResponse = { visitorId: 'test-visitor-1' };
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('updateVisitor')
        .mockReturnValueOnce('test-visitor-1')
        .mockReturnValueOnce('{"role": "user"}');
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeVisitorOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'PUT',
        url: 'https://app.pendo.io/api/v1/visitor/test-visitor-1',
        headers: {
          'X-Pendo-Integration-Key': 'test-key',
          'Content-Type': 'application/json'
        },
        body: {
          metadata: { role: 'user' }
        },
        json: true
      });
      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
    });
  });

  describe('deleteVisitor', () => {
    it('should delete a visitor successfully', async () => {
      const mockResponse = { success: true };
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('deleteVisitor')
        .mockReturnValueOnce('test-visitor-1');
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeVisitorOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'DELETE',
        url: 'https://app.pendo.io/api/v1/visitor/test-visitor-1',
        headers: {
          'X-Pendo-Integration-Key': 'test-key',
          'Content-Type': 'application/json'
        },
        json: true
      });
      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
    });
  });

  describe('error handling', () => {
    it('should handle API errors when continueOnFail is true', async () => {
      const error = new Error('API Error');
      mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('getVisitor');
      mockExecuteFunctions.continueOnFail.mockReturnValue(true);
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(error);

      const result = await executeVisitorOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{ json: { error: 'API Error' }, pairedItem: { item: 0 } }]);
    });

    it('should throw error when continueOnFail is false', async () => {
      const error = new Error('API Error');
      mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('getVisitor');
      mockExecuteFunctions.continueOnFail.mockReturnValue(false);
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(error);

      await expect(
        executeVisitorOperations.call(mockExecuteFunctions, [{ json: {} }])
      ).rejects.toThrow('API Error');
    });
  });
});

describe('Guide Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({ apiKey: 'test-key', baseUrl: 'https://app.pendo.io/api/v1' }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: { httpRequest: jest.fn(), requestWithAuthentication: jest.fn() },
    };
  });

  test('getAllGuides operation success', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('getAllGuides')
      .mockReturnValueOnce('name')
      .mockReturnValueOnce(50)
      .mockReturnValueOnce(10);
    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue([{ id: 'guide1', name: 'Test Guide' }]);

    const result = await executeGuideOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual([{ id: 'guide1', name: 'Test Guide' }]);
  });

  test('getGuide operation success', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('getGuide')
      .mockReturnValueOnce('guide123');
    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({ id: 'guide123', name: 'Test Guide' });

    const result = await executeGuideOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual({ id: 'guide123', name: 'Test Guide' });
  });

  test('createGuide operation success', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('createGuide')
      .mockReturnValueOnce('New Guide')
      .mockReturnValueOnce('manual')
      .mockReturnValueOnce('[]');
    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({ id: 'guide456', name: 'New Guide' });

    const result = await executeGuideOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual({ id: 'guide456', name: 'New Guide' });
  });

  test('updateGuide operation success', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('updateGuide')
      .mockReturnValueOnce('guide123')
      .mockReturnValueOnce('Updated Guide')
      .mockReturnValueOnce('automatic')
      .mockReturnValueOnce('[]');
    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({ id: 'guide123', name: 'Updated Guide' });

    const result = await executeGuideOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual({ id: 'guide123', name: 'Updated Guide' });
  });

  test('deleteGuide operation success', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('deleteGuide')
      .mockReturnValueOnce('guide123');
    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({ success: true });

    const result = await executeGuideOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual({ success: true });
  });

  test('error handling with continueOnFail', async () => {
    mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('getGuide').mockReturnValueOnce('invalid');
    mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));
    mockExecuteFunctions.continueOnFail.mockReturnValue(true);

    const result = await executeGuideOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual({ error: 'API Error' });
  });
});

describe('Event Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({ apiKey: 'test-key', baseUrl: 'https://app.pendo.io/api/v1' }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: { httpRequest: jest.fn(), requestWithAuthentication: jest.fn() },
    };
  });

  describe('getEvents operation', () => {
    it('should retrieve aggregated event data', async () => {
      const mockResponse = { events: [{ id: '1', name: 'test-event' }] };
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getEvents')
        .mockReturnValueOnce('{"mimeType": "application/json"}')
        .mockReturnValueOnce('{"requestId": "123"}');
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeEventOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://app.pendo.io/api/v1/aggregation',
        headers: {
          'X-Pendo-Integration-Key': 'test-key',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          response: { mimeType: 'application/json' },
          request: { requestId: '123' },
        }),
        json: true,
      });
      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
    });

    it('should handle errors in getEvents', async () => {
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getEvents')
        .mockReturnValueOnce('{}')
        .mockReturnValueOnce('{}');
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));
      mockExecuteFunctions.continueOnFail.mockReturnValue(true);

      const result = await executeEventOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{ json: { error: 'API Error' }, pairedItem: { item: 0 } }]);
    });
  });

  describe('createEventQuery operation', () => {
    it('should create event aggregation query', async () => {
      const mockResponse = { queryId: '123', status: 'created' };
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('createEventQuery')
        .mockReturnValueOnce('{"mimeType": "application/json"}')
        .mockReturnValueOnce('{"requestId": "123"}')
        .mockReturnValueOnce('{"eventType": "click"}');
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeEventOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'POST',
        url: 'https://app.pendo.io/api/v1/aggregation',
        headers: {
          'X-Pendo-Integration-Key': 'test-key',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          response: { mimeType: 'application/json' },
          request: { requestId: '123' },
          filter: { eventType: 'click' },
        }),
        json: true,
      });
      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
    });

    it('should handle errors in createEventQuery', async () => {
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('createEventQuery')
        .mockReturnValueOnce('{}')
        .mockReturnValueOnce('{}')
        .mockReturnValueOnce('{}');
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Query Error'));
      mockExecuteFunctions.continueOnFail.mockReturnValue(false);

      await expect(executeEventOperations.call(mockExecuteFunctions, [{ json: {} }])).rejects.toThrow('Query Error');
    });
  });
});

describe('Feature Resource', () => {
	let mockExecuteFunctions: any;

	beforeEach(() => {
		mockExecuteFunctions = {
			getNodeParameter: jest.fn(),
			getCredentials: jest.fn().mockResolvedValue({
				apiKey: 'test-key',
				baseUrl: 'https://app.pendo.io/api/v1',
			}),
			getInputData: jest.fn().mockReturnValue([{ json: {} }]),
			getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
			continueOnFail: jest.fn().mockReturnValue(false),
			helpers: {
				httpRequest: jest.fn(),
				requestWithAuthentication: jest.fn(),
			},
		};
	});

	describe('getAllFeatures', () => {
		it('should retrieve all features successfully', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('getAllFeatures')
				.mockReturnValueOnce('name')
				.mockReturnValueOnce(50)
				.mockReturnValueOnce(0);

			const mockResponse = { features: [{ id: '1', name: 'Test Feature' }] };
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const result = await executeFeatureOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
			expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
				method: 'GET',
				url: 'https://app.pendo.io/api/v1/feature?sort=name&limit=50&offset=0',
				headers: {
					'X-Pendo-Integration-Key': 'test-key',
					'Content-Type': 'application/json',
				},
				json: true,
			});
		});

		it('should handle errors when retrieving features', async () => {
			mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('getAllFeatures');
			mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));
			mockExecuteFunctions.continueOnFail.mockReturnValue(true);

			const result = await executeFeatureOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(result).toEqual([{ json: { error: 'API Error' }, pairedItem: { item: 0 } }]);
		});
	});

	describe('getFeature', () => {
		it('should get a specific feature successfully', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('getFeature')
				.mockReturnValueOnce('feature123');

			const mockResponse = { id: 'feature123', name: 'Test Feature' };
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const result = await executeFeatureOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
		});
	});

	describe('createFeature', () => {
		it('should create a feature successfully', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('createFeature')
				.mockReturnValueOnce('New Feature')
				.mockReturnValueOnce('#button.save');

			const mockResponse = { id: 'new123', name: 'New Feature' };
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const result = await executeFeatureOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
		});
	});

	describe('updateFeature', () => {
		it('should update a feature successfully', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('updateFeature')
				.mockReturnValueOnce('feature123')
				.mockReturnValueOnce('Updated Feature')
				.mockReturnValueOnce('#button.updated');

			const mockResponse = { id: 'feature123', name: 'Updated Feature' };
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const result = await executeFeatureOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
		});
	});

	describe('deleteFeature', () => {
		it('should delete a feature successfully', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('deleteFeature')
				.mockReturnValueOnce('feature123');

			const mockResponse = { success: true };
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const result = await executeFeatureOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
		});
	});
});

describe('Page Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        apiKey: 'test-api-key',
        baseUrl: 'https://app.pendo.io/api/v1',
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: {
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn(),
      },
    };
  });

  describe('getAllPages', () => {
    it('should retrieve all pages successfully', async () => {
      const mockResponse = { pages: [{ id: '1', name: 'Test Page' }] };
      mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('getAllPages');
      mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('name');
      mockExecuteFunctions.getNodeParameter.mockReturnValueOnce(100);
      mockExecuteFunctions.getNodeParameter.mockReturnValueOnce(0);
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const items = [{ json: {} }];
      const result = await executePageOperations.call(mockExecuteFunctions, items);

      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
    });

    it('should handle errors when retrieving all pages', async () => {
      mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('getAllPages');
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));
      mockExecuteFunctions.continueOnFail.mockReturnValue(true);

      const items = [{ json: {} }];
      const result = await executePageOperations.call(mockExecuteFunctions, items);

      expect(result[0].json.error).toBe('API Error');
    });
  });

  describe('getPage', () => {
    it('should retrieve a specific page successfully', async () => {
      const mockResponse = { id: '123', name: 'Test Page' };
      mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('getPage');
      mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('123');
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const items = [{ json: {} }];
      const result = await executePageOperations.call(mockExecuteFunctions, items);

      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
    });
  });

  describe('createPage', () => {
    it('should create a page successfully', async () => {
      const mockResponse = { id: '123', name: 'New Page' };
      mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('createPage');
      mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('New Page');
      mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('/new-page');
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const items = [{ json: {} }];
      const result = await executePageOperations.call(mockExecuteFunctions, items);

      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
    });
  });

  describe('updatePage', () => {
    it('should update a page successfully', async () => {
      const mockResponse = { id: '123', name: 'Updated Page' };
      mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('updatePage');
      mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('123');
      mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('Updated Page');
      mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('/updated-page');
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const items = [{ json: {} }];
      const result = await executePageOperations.call(mockExecuteFunctions, items);

      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
    });
  });

  describe('deletePage', () => {
    it('should delete a page successfully', async () => {
      const mockResponse = { success: true };
      mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('deletePage');
      mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('123');
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const items = [{ json: {} }];
      const result = await executePageOperations.call(mockExecuteFunctions, items);

      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
    });
  });
});

describe('Segment Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({ 
        apiKey: 'test-key', 
        baseUrl: 'https://app.pendo.io/api/v1' 
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: { 
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn() 
      },
    };
  });

  describe('getAllSegments', () => {
    it('should retrieve all segments successfully', async () => {
      const mockSegments = [{ id: '1', name: 'Test Segment' }];
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getAllSegments')
        .mockReturnValueOnce('')
        .mockReturnValueOnce(100)
        .mockReturnValueOnce(0);
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockSegments);

      const result = await executeSegmentOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{ json: mockSegments, pairedItem: { item: 0 } }]);
    });

    it('should handle getAllSegments error', async () => {
      mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('getAllSegments');
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));
      mockExecuteFunctions.continueOnFail.mockReturnValue(true);

      const result = await executeSegmentOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{ json: { error: 'API Error' }, pairedItem: { item: 0 } }]);
    });
  });

  describe('getSegment', () => {
    it('should get a specific segment successfully', async () => {
      const mockSegment = { id: '1', name: 'Test Segment' };
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getSegment')
        .mockReturnValueOnce('1');
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockSegment);

      const result = await executeSegmentOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{ json: mockSegment, pairedItem: { item: 0 } }]);
    });

    it('should handle getSegment error', async () => {
      mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('getSegment');
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Segment not found'));
      mockExecuteFunctions.continueOnFail.mockReturnValue(true);

      const result = await executeSegmentOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{ json: { error: 'Segment not found' }, pairedItem: { item: 0 } }]);
    });
  });

  describe('createSegment', () => {
    it('should create a new segment successfully', async () => {
      const mockSegment = { id: '1', name: 'New Segment' };
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('createSegment')
        .mockReturnValueOnce('New Segment')
        .mockReturnValueOnce({ rules: [] });
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockSegment);

      const result = await executeSegmentOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{ json: mockSegment, pairedItem: { item: 0 } }]);
    });

    it('should handle createSegment error', async () => {
      mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('createSegment');
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Creation failed'));
      mockExecuteFunctions.continueOnFail.mockReturnValue(true);

      const result = await executeSegmentOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{ json: { error: 'Creation failed' }, pairedItem: { item: 0 } }]);
    });
  });

  describe('updateSegment', () => {
    it('should update a segment successfully', async () => {
      const mockSegment = { id: '1', name: 'Updated Segment' };
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('updateSegment')
        .mockReturnValueOnce('1')
        .mockReturnValueOnce('Updated Segment')
        .mockReturnValueOnce({ rules: [] });
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockSegment);

      const result = await executeSegmentOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{ json: mockSegment, pairedItem: { item: 0 } }]);
    });

    it('should handle updateSegment error', async () => {
      mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('updateSegment');
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Update failed'));
      mockExecuteFunctions.continueOnFail.mockReturnValue(true);

      const result = await executeSegmentOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{ json: { error: 'Update failed' }, pairedItem: { item: 0 } }]);
    });
  });

  describe('deleteSegment', () => {
    it('should delete a segment successfully', async () => {
      const mockResponse = { success: true };
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('deleteSegment')
        .mockReturnValueOnce('1');
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeSegmentOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
    });

    it('should handle deleteSegment error', async () => {
      mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('deleteSegment');
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Deletion failed'));
      mockExecuteFunctions.continueOnFail.mockReturnValue(true);

      const result = await executeSegmentOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{ json: { error: 'Deletion failed' }, pairedItem: { item: 0 } }]);
    });
  });
});
});
