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

    it('should define 6 resources', () => {
      const resourceProp = node.description.properties.find(
        (p: any) => p.name === 'resource'
      );
      expect(resourceProp).toBeDefined();
      expect(resourceProp!.type).toBe('options');
      expect(resourceProp!.options).toHaveLength(6);
    });

    it('should have operation dropdowns for each resource', () => {
      const operations = node.description.properties.filter(
        (p: any) => p.name === 'operation'
      );
      expect(operations.length).toBe(6);
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
describe('Visitors Resource', () => {
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

  describe('getVisitor', () => {
    it('should retrieve visitor information successfully', async () => {
      const mockResponse = { visitorId: 'visitor123', metadata: { name: 'John Doe' } };
      
      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        switch (paramName) {
          case 'operation': return 'getVisitor';
          case 'visitorId': return 'visitor123';
          default: return undefined;
        }
      });
      
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const items = [{ json: {} }];
      const result = await executeVisitorsOperations.call(mockExecuteFunctions, items);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://app.pendo.io/api/v1/visitor',
        headers: {
          'X-Pendo-Integration-Key': 'test-api-key',
          'Content-Type': 'application/json',
        },
        qs: { visitorId: 'visitor123' },
        json: true,
      });
    });

    it('should handle errors when retrieving visitor', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        switch (paramName) {
          case 'operation': return 'getVisitor';
          case 'visitorId': return 'visitor123';
          default: return undefined;
        }
      });
      
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Visitor not found'));
      mockExecuteFunctions.continueOnFail.mockReturnValue(true);

      const items = [{ json: {} }];
      const result = await executeVisitorsOperations.call(mockExecuteFunctions, items);

      expect(result).toHaveLength(1);
      expect(result[0].json.error).toBe('Visitor not found');
    });
  });

  describe('createVisitor', () => {
    it('should create a new visitor successfully', async () => {
      const mockResponse = { visitorId: 'visitor123', success: true };
      
      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        switch (paramName) {
          case 'operation': return 'createVisitor';
          case 'visitorId': return 'visitor123';
          case 'metadata': return {
            metadataFields: [
              { key: 'name', value: 'John Doe' },
              { key: 'email', value: 'john@example.com' }
            ]
          };
          default: return undefined;
        }
      });
      
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const items = [{ json: {} }];
      const result = await executeVisitorsOperations.call(mockExecuteFunctions, items);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'POST',
        url: 'https://app.pendo.io/api/v1/visitor',
        headers: {
          'X-Pendo-Integration-Key': 'test-api-key',
          'Content-Type': 'application/json',
        },
        body: {
          visitorId: 'visitor123',
          metadata: {
            name: 'John Doe',
            email: 'john@example.com'
          }
        },
        json: true,
      });
    });
  });

  describe('updateVisitor', () => {
    it('should update visitor successfully', async () => {
      const mockResponse = { visitorId: 'visitor123', updated: true };
      
      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        switch (paramName) {
          case 'operation': return 'updateVisitor';
          case 'visitorId': return 'visitor123';
          case 'metadata': return {
            metadataFields: [{ key: 'name', value: 'Jane Doe' }]
          };
          default: return undefined;
        }
      });
      
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const items = [{ json: {} }];
      const result = await executeVisitorsOperations.call(mockExecuteFunctions, items);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'PUT',
        url: 'https://app.pendo.io/api/v1/visitor',
        headers: {
          'X-Pendo-Integration-Key': 'test-api-key',
          'Content-Type': 'application/json',
        },
        body: {
          visitorId: 'visitor123',
          metadata: { name: 'Jane Doe' }
        },
        json: true,
      });
    });
  });

  describe('deleteVisitor', () => {
    it('should delete visitor successfully', async () => {
      const mockResponse = { success: true };
      
      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        switch (paramName) {
          case 'operation': return 'deleteVisitor';
          case 'visitorId': return 'visitor123';
          default: return undefined;
        }
      });
      
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const items = [{ json: {} }];
      const result = await executeVisitorsOperations.call(mockExecuteFunctions, items);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'DELETE',
        url: 'https://app.pendo.io/api/v1/visitor',
        headers: {
          'X-Pendo-Integration-Key': 'test-api-key',
          'Content-Type': 'application/json',
        },
        qs: { visitorId: 'visitor123' },
        json: true,
      });
    });
  });

  describe('getVisitorMetadata', () => {
    it('should get visitor metadata successfully', async () => {
      const mockResponse = { metadata: { name: 'John Doe', email: 'john@example.com' } };
      
      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        switch (paramName) {
          case 'operation': return 'getVisitorMetadata';
          case 'visitorId': return 'visitor123';
          default: return undefined;
        }
      });
      
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const items = [{ json: {} }];
      const result = await executeVisitorsOperations.call(mockExecuteFunctions, items);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://app.pendo.io/api/v1/visitor/metadata',
        headers: {
          'X-Pendo-Integration-Key': 'test-api-key',
          'Content-Type': 'application/json',
        },
        qs: { visitorId: 'visitor123' },
        json: true,
      });
    });
  });

  describe('updateVisitorMetadata', () => {
    it('should update visitor metadata successfully', async () => {
      const mockResponse = { success: true };
      
      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        switch (paramName) {
          case 'operation': return 'updateVisitorMetadata';
          case 'visitorId': return 'visitor123';
          case 'metadata': return {
            metadataFields: [{ key: 'role', value: 'admin' }]
          };
          default: return undefined;
        }
      });
      
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const items = [{ json: {} }];
      const result = await executeVisitorsOperations.call(mockExecuteFunctions, items);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'PUT',
        url: 'https://app.pendo.io/api/v1/visitor/metadata',
        headers: {
          'X-Pendo-Integration-Key': 'test-api-key',
          'Content-Type': 'application/json',
        },
        body: {
          visitorId: 'visitor123',
          metadata: { role: 'admin' }
        },
        json: true,
      });
    });
  });
});

describe('Accounts Resource', () => {
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

  describe('getAccount', () => {
    it('should retrieve account information successfully', async () => {
      const mockResponse = {
        accountId: 'test-account-123',
        metadata: { company: 'Test Company' }
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        if (paramName === 'operation') return 'getAccount';
        if (paramName === 'accountId') return 'test-account-123';
        return null;
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const items = [{ json: {} }];
      const result = await executeAccountsOperations.call(mockExecuteFunctions, items);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://app.pendo.io/api/v1/account',
        headers: {
          'X-Pendo-Integration-Key': 'test-api-key',
          'Content-Type': 'application/json',
        },
        qs: { accountId: 'test-account-123' },
        json: true,
      });
    });

    it('should handle errors when retrieving account', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        if (paramName === 'operation') return 'getAccount';
        if (paramName === 'accountId') return 'invalid-account';
        return null;
      });

      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Account not found'));
      mockExecuteFunctions.continueOnFail.mockReturnValue(true);

      const items = [{ json: {} }];
      const result = await executeAccountsOperations.call(mockExecuteFunctions, items);

      expect(result).toHaveLength(1);
      expect(result[0].json.error).toBe('Account not found');
    });
  });

  describe('createAccount', () => {
    it('should create a new account successfully', async () => {
      const mockResponse = {
        accountId: 'new-account-123',
        created: true
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        if (paramName === 'operation') return 'createAccount';
        if (paramName === 'accountId') return 'new-account-123';
        if (paramName === 'metadata') return {
          property: [
            { key: 'company', value: 'New Company' },
            { key: 'tier', value: 'premium' }
          ]
        };
        return null;
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const items = [{ json: {} }];
      const result = await executeAccountsOperations.call(mockExecuteFunctions, items);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'POST',
        url: 'https://app.pendo.io/api/v1/account',
        headers: {
          'X-Pendo-Integration-Key': 'test-api-key',
          'Content-Type': 'application/json',
        },
        body: {
          accountId: 'new-account-123',
          metadata: {
            company: 'New Company',
            tier: 'premium'
          }
        },
        json: true,
      });
    });
  });

  describe('updateAccount', () => {
    it('should update account successfully', async () => {
      const mockResponse = {
        accountId: 'test-account-123',
        updated: true
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        if (paramName === 'operation') return 'updateAccount';
        if (paramName === 'accountId') return 'test-account-123';
        if (paramName === 'metadata') return {
          property: [
            { key: 'company', value: 'Updated Company' }
          ]
        };
        return null;
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const items = [{ json: {} }];
      const result = await executeAccountsOperations.call(mockExecuteFunctions, items);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'PUT',
        url: 'https://app.pendo.io/api/v1/account',
        headers: {
          'X-Pendo-Integration-Key': 'test-api-key',
          'Content-Type': 'application/json',
        },
        body: {
          accountId: 'test-account-123',
          metadata: {
            company: 'Updated Company'
          }
        },
        json: true,
      });
    });
  });

  describe('deleteAccount', () => {
    it('should delete account successfully', async () => {
      const mockResponse = {
        accountId: 'test-account-123',
        deleted: true
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        if (paramName === 'operation') return 'deleteAccount';
        if (paramName === 'accountId') return 'test-account-123';
        return null;
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const items = [{ json: {} }];
      const result = await executeAccountsOperations.call(mockExecuteFunctions, items);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'DELETE',
        url: 'https://app.pendo.io/api/v1/account',
        headers: {
          'X-Pendo-Integration-Key': 'test-api-key',
          'Content-Type': 'application/json',
        },
        qs: { accountId: 'test-account-123' },
        json: true,
      });
    });
  });

  describe('getAccountMetadata', () => {
    it('should retrieve account metadata successfully', async () => {
      const mockResponse = {
        accountId: 'test-account-123',
        metadata: {
          company: 'Test Company',
          tier: 'premium'
        }
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        if (paramName === 'operation') return 'getAccountMetadata';
        if (paramName === 'accountId') return 'test-account-123';
        return null;
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const items = [{ json: {} }];
      const result = await executeAccountsOperations.call(mockExecuteFunctions, items);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://app.pendo.io/api/v1/account/metadata',
        headers: {
          'X-Pendo-Integration-Key': 'test-api-key',
          'Content-Type': 'application/json',
        },
        qs: { accountId: 'test-account-123' },
        json: true,
      });
    });
  });

  describe('updateAccountMetadata', () => {
    it('should update account metadata successfully', async () => {
      const mockResponse = {
        accountId: 'test-account-123',
        metadataUpdated: true
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        if (paramName === 'operation') return 'updateAccountMetadata';
        if (paramName === 'accountId') return 'test-account-123';
        if (paramName === 'metadata') return {
          property: [
            { key: 'company', value: 'Updated Company' },
            { key: 'tier', value: 'enterprise' }
          ]
        };
        return null;
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const items = [{ json: {} }];
      const result = await executeAccountsOperations.call(mockExecuteFunctions, items);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'PUT',
        url: 'https://app.pendo.io/api/v1/account/metadata',
        headers: {
          'X-Pendo-Integration-Key': 'test-api-key',
          'Content-Type': 'application/json',
        },
        body: {
          accountId: 'test-account-123',
          metadata: {
            company: 'Updated Company',
            tier: 'enterprise'
          }
        },
        json: true,
      });
    });
  });
});

describe('Guides Resource', () => {
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

  describe('getGuide operation', () => {
    it('should retrieve guide details successfully', async () => {
      const mockGuideData = { id: 'guide123', name: 'Test Guide', type: 'tooltip' };
      
      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        if (param === 'operation') return 'getGuide';
        if (param === 'guideId') return 'guide123';
        return undefined;
      });
      
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockGuideData);
      
      const items = [{ json: {} }];
      const result = await executeGuidesOperations.call(mockExecuteFunctions, items);
      
      expect(result).toEqual([{ json: mockGuideData, pairedItem: { item: 0 } }]);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://app.pendo.io/api/v1/guide',
        headers: {
          'X-Pendo-Integration-Key': 'test-api-key',
          'Content-Type': 'application/json',
        },
        qs: { guideId: 'guide123' },
        json: true,
      });
    });
  });

  describe('getAllGuides operation', () => {
    it('should list all guides with pagination', async () => {
      const mockGuidesData = { guides: [{ id: 'guide1' }, { id: 'guide2' }] };
      
      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string, index: number, defaultValue?: any) => {
        if (param === 'operation') return 'getAllGuides';
        if (param === 'limit') return defaultValue || 50;
        if (param === 'offset') return defaultValue || 0;
        return undefined;
      });
      
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockGuidesData);
      
      const items = [{ json: {} }];
      const result = await executeGuidesOperations.call(mockExecuteFunctions, items);
      
      expect(result).toEqual([{ json: mockGuidesData, pairedItem: { item: 0 } }]);
    });
  });

  describe('createGuide operation', () => {
    it('should create a new guide successfully', async () => {
      const mockCreatedGuide = { id: 'newguide123', name: 'New Guide', type: 'tooltip' };
      
      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        if (param === 'operation') return 'createGuide';
        if (param === 'name') return 'New Guide';
        if (param === 'type') return 'tooltip';
        if (param === 'content') return { step1: 'Welcome' };
        return undefined;
      });
      
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockCreatedGuide);
      
      const items = [{ json: {} }];
      const result = await executeGuidesOperations.call(mockExecuteFunctions, items);
      
      expect(result).toEqual([{ json: mockCreatedGuide, pairedItem: { item: 0 } }]);
    });
  });

  describe('updateGuide operation', () => {
    it('should update guide successfully', async () => {
      const mockUpdatedGuide = { id: 'guide123', name: 'Updated Guide' };
      
      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string, index: number, defaultValue?: any) => {
        if (param === 'operation') return 'updateGuide';
        if (param === 'guideId') return 'guide123';
        if (param === 'name') return 'Updated Guide';
        if (param === 'content') return defaultValue || '{}';
        return undefined;
      });
      
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockUpdatedGuide);
      
      const items = [{ json: {} }];
      const result = await executeGuidesOperations.call(mockExecuteFunctions, items);
      
      expect(result).toEqual([{ json: mockUpdatedGuide, pairedItem: { item: 0 } }]);
    });
  });

  describe('deleteGuide operation', () => {
    it('should delete guide successfully', async () => {
      const mockDeleteResponse = { success: true };
      
      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        if (param === 'operation') return 'deleteGuide';
        if (param === 'guideId') return 'guide123';
        return undefined;
      });
      
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockDeleteResponse);
      
      const items = [{ json: {} }];
      const result = await executeGuidesOperations.call(mockExecuteFunctions, items);
      
      expect(result).toEqual([{ json: mockDeleteResponse, pairedItem: { item: 0 } }]);
    });
  });

  describe('launchGuide operation', () => {
    it('should launch guide successfully', async () => {
      const mockLaunchResponse = { success: true, launched: true };
      
      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        if (param === 'operation') return 'launchGuide';
        if (param === 'guideId') return 'guide123';
        if (param === 'targetAudience') return { segment: 'new_users' };
        return undefined;
      });
      
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockLaunchResponse);
      
      const items = [{ json: {} }];
      const result = await executeGuidesOperations.call(mockExecuteFunctions, items);
      
      expect(result).toEqual([{ json: mockLaunchResponse, pairedItem: { item: 0 } }]);
    });
  });

  describe('pauseGuide operation', () => {
    it('should pause guide successfully', async () => {
      const mockPauseResponse = { success: true, paused: true };
      
      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        if (param === 'operation') return 'pauseGuide';
        if (param === 'guideId') return 'guide123';
        return undefined;
      });
      
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockPauseResponse);
      
      const items = [{ json: {} }];
      const result = await executeGuidesOperations.call(mockExecuteFunctions, items);
      
      expect(result).toEqual([{ json: mockPauseResponse, pairedItem: { item: 0 } }]);
    });
  });

  describe('error handling', () => {
    it('should handle API errors properly', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        if (param === 'operation') return 'getGuide';
        if (param === 'guideId') return 'invalid-guide';
        return undefined;
      });
      
      const mockError = new Error('Guide not found');
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(mockError);
      
      const items = [{ json: {} }];
      
      await expect(executeGuidesOperations.call(mockExecuteFunctions, items)).rejects.toThrow();
    });

    it('should continue on fail when configured', async () => {
      mockExecuteFunctions.continueOnFail.mockReturnValue(true);
      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        if (param === 'operation') return 'getGuide';
        if (param === 'guideId') return 'invalid-guide';
        return undefined;
      });
      
      const mockError = new Error('Guide not found');
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(mockError);
      
      const items = [{ json: {} }];
      const result = await executeGuidesOperations.call(mockExecuteFunctions, items);
      
      expect(result).toEqual([{ json: { error: 'Guide not found' }, pairedItem: { item: 0 } }]);
    });
  });
});

describe('Segments Resource', () => {
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

  test('getAllSegments should return list of segments', async () => {
    const mockResponse = {
      segments: [
        { id: '1', name: 'Test Segment 1', type: 'visitor' },
        { id: '2', name: 'Test Segment 2', type: 'account' }
      ],
      total: 2
    };

    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      if (param === 'operation') return 'getAllSegments';
      if (param === 'limit') return 100;
      if (param === 'offset') return 0;
      if (param === 'type') return 'visitor';
    });

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeSegmentsOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual(mockResponse);
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'GET',
      url: 'https://app.pendo.io/api/v1/segment?limit=100&offset=0&type=visitor',
      headers: {
        'X-Pendo-Integration-Key': 'test-api-key',
        'Content-Type': 'application/json',
      },
      json: true,
    });
  });

  test('getSegment should return segment details', async () => {
    const mockResponse = {
      id: '12345',
      name: 'Test Segment',
      type: 'visitor',
      definition: { rule: 'test' }
    };

    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      if (param === 'operation') return 'getSegment';
      if (param === 'segmentId') return '12345';
    });

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeSegmentsOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual(mockResponse);
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'GET',
      url: 'https://app.pendo.io/api/v1/segment/12345',
      headers: {
        'X-Pendo-Integration-Key': 'test-api-key',
        'Content-Type': 'application/json',
      },
      json: true,
    });
  });

  test('createSegment should create new segment', async () => {
    const mockResponse = {
      id: '12345',
      name: 'New Segment',
      type: 'visitor',
      definition: { rule: 'new' }
    };

    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      if (param === 'operation') return 'createSegment';
      if (param === 'name') return 'New Segment';
      if (param === 'definition') return '{"rule": "new"}';
      if (param === 'type') return 'visitor';
    });

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeSegmentsOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual(mockResponse);
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'POST',
      url: 'https://app.pendo.io/api/v1/segment',
      headers: {
        'X-Pendo-Integration-Key': 'test-api-key',
        'Content-Type': 'application/json',
      },
      json: true,
      body: {
        name: 'New Segment',
        definition: { rule: 'new' },
        type: 'visitor',
      },
    });
  });

  test('updateSegment should update segment definition', async () => {
    const mockResponse = {
      id: '12345',
      name: 'Updated Segment',
      definition: { rule: 'updated' }
    };

    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      if (param === 'operation') return 'updateSegment';
      if (param === 'segmentId') return '12345';
      if (param === 'definition') return '{"rule": "updated"}';
    });

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeSegmentsOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual(mockResponse);
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'PUT',
      url: 'https://app.pendo.io/api/v1/segment/12345',
      headers: {
        'X-Pendo-Integration-Key': 'test-api-key',
        'Content-Type': 'application/json',
      },
      json: true,
      body: {
        definition: { rule: 'updated' },
      },
    });
  });

  test('deleteSegment should delete segment', async () => {
    const mockResponse = { success: true };

    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      if (param === 'operation') return 'deleteSegment';
      if (param === 'segmentId') return '12345';
    });

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeSegmentsOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual(mockResponse);
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'DELETE',
      url: 'https://app.pendo.io/api/v1/segment/12345',
      headers: {
        'X-Pendo-Integration-Key': 'test-api-key',
        'Content-Type': 'application/json',
      },
      json: true,
    });
  });

  test('getSegmentVisitors should return visitors in segment', async () => {
    const mockResponse = {
      visitors: [
        { id: 'visitor1', accountId: 'account1' },
        { id: 'visitor2', accountId: 'account2' }
      ],
      total: 2
    };

    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      if (param === 'operation') return 'getSegmentVisitors';
      if (param === 'segmentId') return '12345';
      if (param === 'limit') return 50;
      if (param === 'offset') return 10;
    });

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeSegmentsOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual(mockResponse);
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'GET',
      url: 'https://app.pendo.io/api/v1/segment/12345/visitors?limit=50&offset=10',
      headers: {
        'X-Pendo-Integration-Key': 'test-api-key',
        'Content-Type': 'application/json',
      },
      json: true,
    });
  });

  test('getSegmentAccounts should return accounts in segment', async () => {
    const mockResponse = {
      accounts: [
        { id: 'account1', name: 'Account 1' },
        { id: 'account2', name: 'Account 2' }
      ],
      total: 2
    };

    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      if (param === 'operation') return 'getSegmentAccounts';
      if (param === 'segmentId') return '12345';
      if (param === 'limit') return 25;
      if (param === 'offset') return 5;
    });

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeSegmentsOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual(mockResponse);
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'GET',
      url: 'https://app.pendo.io/api/v1/segment/12345/accounts?limit=25&offset=5',
      headers: {
        'X-Pendo-Integration-Key': 'test-api-key',
        'Content-Type': 'application/json',
      },
      json: true,
    });
  });

  test('should handle API errors', async () => {
    const mockError = {
      httpCode: 404,
      message: 'Segment not found'
    };

    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      if (param === 'operation') return 'getSegment';
      if (param === 'segmentId') return 'invalid-id';
    });

    mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(mockError);

    await expect(executeSegmentsOperations.call(mockExecuteFunctions, [{ json: {} }])).rejects.toThrow();
  });

  test('should handle invalid JSON in definition', async () => {
    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      if (param === 'operation') return 'createSegment';
      if (param === 'name') return 'Test Segment';
      if (param === 'definition') return 'invalid json';
      if (param === 'type') return 'visitor';
    });

    await expect(executeSegmentsOperations.call(mockExecuteFunctions, [{ json: {} }])).rejects.toThrow('Invalid JSON in definition');
  });
});

describe('Events Resource', () => {
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

  test('getEvents should retrieve event data with filters', async () => {
    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      switch (param) {
        case 'operation': return 'getEvents';
        case 'period': return '7d';
        case 'first': return 1640995200;
        case 'last': return 1641081600;
        case 'event': return 'custom_event';
        default: return '';
      }
    });

    const mockResponse = {
      events: [
        { id: 'event1', name: 'custom_event', count: 100 }
      ]
    };

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeEventsOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'GET',
      url: 'https://app.pendo.io/api/v1/aggregation?period=7d&first=1640995200&last=1641081600&event=custom_event',
      headers: {
        'X-Pendo-Integration-Key': 'test-api-key',
        'Content-Type': 'application/json',
      },
      json: true,
    });

    expect(result).toEqual([{
      json: mockResponse,
      pairedItem: { item: 0 },
    }]);
  });

  test('createEvent should track a custom event', async () => {
    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      switch (param) {
        case 'operation': return 'createEvent';
        case 'visitorId': return 'visitor123';
        case 'accountId': return 'account456';
        case 'eventName': return 'button_click';
        case 'properties': return '{"page": "homepage", "button": "signup"}';
        default: return '';
      }
    });

    const mockResponse = { success: true, eventId: 'evt_123' };
    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeEventsOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'POST',
      url: 'https://app.pendo.io/api/v1/track',
      headers: {
        'X-Pendo-Integration-Key': 'test-api-key',
        'Content-Type': 'application/json',
      },
      body: {
        visitorId: 'visitor123',
        accountId: 'account456',
        event: 'button_click',
        properties: { page: 'homepage', button: 'signup' },
      },
      json: true,
    });

    expect(result).toEqual([{
      json: mockResponse,
      pairedItem: { item: 0 },
    }]);
  });

  test('getEvent should retrieve specific event details', async () => {
    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      switch (param) {
        case 'operation': return 'getEvent';
        case 'eventId': return 'evt_123';
        default: return '';
      }
    });

    const mockResponse = {
      id: 'evt_123',
      name: 'button_click',
      properties: { page: 'homepage' },
      timestamp: 1640995200
    };

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeEventsOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'GET',
      url: 'https://app.pendo.io/api/v1/event/evt_123',
      headers: {
        'X-Pendo-Integration-Key': 'test-api-key',
        'Content-Type': 'application/json',
      },
      json: true,
    });

    expect(result).toEqual([{
      json: mockResponse,
      pairedItem: { item: 0 },
    }]);
  });

  test('getAllEvents should list tracked events with pagination', async () => {
    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      switch (param) {
        case 'operation': return 'getAllEvents';
        case 'limit': return 50;
        case 'offset': return 10;
        case 'period': return '30d';
        default: return '';
      }
    });

    const mockResponse = {
      events: [
        { id: 'evt_1', name: 'event1' },
        { id: 'evt_2', name: 'event2' }
      ],
      total: 100
    };

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeEventsOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'GET',
      url: 'https://app.pendo.io/api/v1/event?limit=50&offset=10&period=30d',
      headers: {
        'X-Pendo-Integration-Key': 'test-api-key',
        'Content-Type': 'application/json',
      },
      json: true,
    });

    expect(result).toEqual([{
      json: mockResponse,
      pairedItem: { item: 0 },
    }]);
  });

  test('getEventAggregation should get aggregated event analytics', async () => {
    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      switch (param) {
        case 'operation': return 'getEventAggregation';
        case 'period': return '7d';
        case 'groupBy': return 'day';
        case 'filters': return '{"event": "signup"}';
        case 'limit': return 100;
        default: return '';
      }
    });

    const mockResponse = {
      aggregations: [
        { date: '2022-01-01', count: 25 },
        { date: '2022-01-02', count: 30 }
      ]
    };

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeEventsOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'GET',
      url: 'https://app.pendo.io/api/v1/aggregation/events?limit=100&period=7d&groupBy=day&event=signup',
      headers: {
        'X-Pendo-Integration-Key': 'test-api-key',
        'Content-Type': 'application/json',
      },
      json: true,
    });

    expect(result).toEqual([{
      json: mockResponse,
      pairedItem: { item: 0 },
    }]);
  });

  test('should handle API errors', async () => {
    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      switch (param) {
        case 'operation': return 'getEvents';
        default: return '';
      }
    });

    const apiError = new Error('API Error: Invalid request');
    mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(apiError);

    await expect(executeEventsOperations.call(mockExecuteFunctions, [{ json: {} }])).rejects.toThrow();
  });

  test('should continue on fail when configured', async () => {
    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      switch (param) {
        case 'operation': return 'getEvents';
        default: return '';
      }
    });

    mockExecuteFunctions.continueOnFail.mockReturnValue(true);
    const apiError = new Error('API Error: Invalid request');
    mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(apiError);

    const result = await executeEventsOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toEqual([{
      json: { error: 'API Error: Invalid request' },
      pairedItem: { item: 0 },
    }]);
  });
});

describe('Features Resource', () => {
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

  test('getAllFeatures should retrieve all features successfully', async () => {
    const mockResponse = {
      features: [
        { id: '1', name: 'Feature 1', selector: '.feature-1' },
        { id: '2', name: 'Feature 2', selector: '.feature-2' },
      ],
    };

    mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
      switch (paramName) {
        case 'operation':
          return 'getAllFeatures';
        case 'limit':
          return 50;
        case 'offset':
          return 0;
        default:
          return undefined;
      }
    });

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeFeaturesOperations.call(
      mockExecuteFunctions,
      [{ json: {} }],
    );

    expect(result).toEqual([
      { json: mockResponse, pairedItem: { item: 0 } },
    ]);
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'GET',
      url: 'https://app.pendo.io/api/v1/feature',
      headers: {
        'X-Pendo-Integration-Key': 'test-api-key',
        'Content-Type': 'application/json',
      },
      qs: {
        limit: 50,
        offset: 0,
      },
      json: true,
    });
  });

  test('getFeature should retrieve specific feature successfully', async () => {
    const mockResponse = {
      id: 'feature-123',
      name: 'Test Feature',
      selector: '.test-feature',
      usageStats: { clicks: 150, users: 45 },
    };

    mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
      switch (paramName) {
        case 'operation':
          return 'getFeature';
        case 'featureId':
          return 'feature-123';
        default:
          return undefined;
      }
    });

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeFeaturesOperations.call(
      mockExecuteFunctions,
      [{ json: {} }],
    );

    expect(result).toEqual([
      { json: mockResponse, pairedItem: { item: 0 } },
    ]);
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'GET',
      url: 'https://app.pendo.io/api/v1/feature/feature-123',
      headers: {
        'X-Pendo-Integration-Key': 'test-api-key',
        'Content-Type': 'application/json',
      },
      json: true,
    });
  });

  test('getFeatureEvents should retrieve feature events successfully', async () => {
    const mockResponse = {
      events: [
        { type: 'click', timestamp: 1635724800, userId: 'user-1' },
        { type: 'view', timestamp: 1635724900, userId: 'user-2' },
      ],
    };

    mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
      switch (paramName) {
        case 'operation':
          return 'getFeatureEvents';
        case 'featureId':
          return 'feature-123';
        case 'period':
          return '30d';
        default:
          return undefined;
      }
    });

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeFeaturesOperations.call(
      mockExecuteFunctions,
      [{ json: {} }],
    );

    expect(result).toEqual([
      { json: mockResponse, pairedItem: { item: 0 } },
    ]);
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'GET',
      url: 'https://app.pendo.io/api/v1/feature/feature-123/events',
      headers: {
        'X-Pendo-Integration-Key': 'test-api-key',
        'Content-Type': 'application/json',
      },
      qs: {
        period: '30d',
      },
      json: true,
    });
  });

  test('createFeature should create new feature successfully', async () => {
    const mockResponse = {
      id: 'feature-456',
      name: 'New Feature',
      selector: '.new-feature',
      description: 'A new feature for tracking',
    };

    mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
      switch (paramName) {
        case 'operation':
          return 'createFeature';
        case 'name':
          return 'New Feature';
        case 'selector':
          return '.new-feature';
        case 'description':
          return 'A new feature for tracking';
        default:
          return undefined;
      }
    });

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeFeaturesOperations.call(
      mockExecuteFunctions,
      [{ json: {} }],
    );

    expect(result).toEqual([
      { json: mockResponse, pairedItem: { item: 0 } },
    ]);
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'POST',
      url: 'https://app.pendo.io/api/v1/feature',
      headers: {
        'X-Pendo-Integration-Key': 'test-api-key',
        'Content-Type': 'application/json',
      },
      body: {
        name: 'New Feature',
        selector: '.new-feature',
        description: 'A new feature for tracking',
      },
      json: true,
    });
  });

  test('updateFeature should update feature successfully', async () => {
    const mockResponse = {
      id: 'feature-123',
      name: 'Updated Feature Name',
      selector: '.test-feature',
      description: 'Updated description',
    };

    mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
      switch (paramName) {
        case 'operation':
          return 'updateFeature';
        case 'featureId':
          return 'feature-123';
        case 'name':
          return 'Updated Feature Name';
        case 'description':
          return 'Updated description';
        default:
          return '';
      }
    });

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeFeaturesOperations.call(
      mockExecuteFunctions,
      [{ json: {} }],
    );

    expect(result).toEqual([
      { json: mockResponse, pairedItem: { item: 0 } },
    ]);
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'PUT',
      url: 'https://app.pendo.io/api/v1/feature/feature-123',
      headers: {
        'X-Pendo-Integration-Key': 'test-api-key',
        'Content-Type': 'application/json',
      },
      body: {
        name: 'Updated Feature Name',
        description: 'Updated description',
      },
      json: true,
    });
  });

  test('should handle API errors gracefully', async () => {
    mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
      if (paramName === 'operation') return 'getFeature';
      if (paramName === 'featureId') return 'invalid-id';
      return undefined;
    });

    const apiError = new Error('Feature not found');
    apiError.cause = {
      response: {
        status: 404,
        data: { message: 'Feature not found' },
      },
    };

    mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(apiError);

    await expect(
      executeFeaturesOperations.call(mockExecuteFunctions, [{ json: {} }]),
    ).rejects.toThrow();
  });

  test('should continue on fail when configured', async () => {
    mockExecuteFunctions.continueOnFail.mockReturnValue(true);
    mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
      if (paramName === 'operation') return 'getFeature';
      if (paramName === 'featureId') return 'invalid-id';
      return undefined;
    });

    const apiError = new Error('Feature not found');
    mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(apiError);

    const result = await executeFeaturesOperations.call(
      mockExecuteFunctions,
      [{ json: {} }],
    );

    expect(result).toEqual([
      { json: { error: 'Feature not found' }, pairedItem: { item: 0 } },
    ]);
  });
});
});
