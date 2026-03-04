# n8n-nodes-pendo

> **[Velocity BPA Licensing Notice]**
>
> This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
>
> Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
>
> For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.

This n8n community node integrates with Pendo's product analytics platform, providing access to 6 core resources including Visitors, Accounts, Guides, Segments, Events, and Features. Automate user behavior tracking, manage product guides, analyze feature adoption, and streamline your product analytics workflows directly within n8n.

![n8n Community Node](https://img.shields.io/badge/n8n-Community%20Node-blue)
![License](https://img.shields.io/badge/license-BSL--1.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![Pendo API](https://img.shields.io/badge/Pendo-API%20v1-orange)
![Product Analytics](https://img.shields.io/badge/Product-Analytics-purple)
![User Experience](https://img.shields.io/badge/User-Experience-green)

## Features

- **Visitor Management** - Track user behavior, retrieve visitor profiles, and analyze user journey data
- **Account Operations** - Manage customer accounts, update account metadata, and segment organizations
- **Guide Automation** - Create, update, and manage in-app guides and onboarding flows
- **Segmentation Control** - Build dynamic user segments based on behavior and attributes
- **Event Tracking** - Capture custom events and monitor feature usage patterns
- **Feature Analytics** - Track feature adoption, usage metrics, and performance insights
- **Real-time Data** - Access live product analytics data for immediate insights
- **Batch Operations** - Process multiple records efficiently with bulk operations support

## Installation

### Community Nodes (Recommended)

1. Open n8n
2. Go to **Settings** → **Community Nodes**
3. Click **Install a community node**
4. Enter `n8n-nodes-pendo`
5. Click **Install**

### Manual Installation

```bash
cd ~/.n8n
npm install n8n-nodes-pendo
```

### Development Installation

```bash
git clone https://github.com/Velocity-BPA/n8n-nodes-pendo.git
cd n8n-nodes-pendo
npm install
npm run build
mkdir -p ~/.n8n/custom
ln -s $(pwd) ~/.n8n/custom/n8n-nodes-pendo
n8n start
```

## Credentials Setup

| Field | Description | Required |
|-------|-------------|----------|
| API Key | Your Pendo API integration key from Pendo Settings > Integrations | Yes |
| Subscription ID | Your Pendo subscription identifier (found in account settings) | Yes |
| Environment | Target environment (production/staging) | No |

## Resources & Operations

### 1. Visitors

| Operation | Description |
|-----------|-------------|
| Get | Retrieve visitor profile and activity data |
| List | Fetch multiple visitors with filtering options |
| Update | Modify visitor metadata and custom attributes |
| Delete | Remove visitor data from Pendo |
| Get Events | Retrieve events associated with a visitor |

### 2. Accounts

| Operation | Description |
|-----------|-------------|
| Get | Fetch account details and associated metadata |
| List | Retrieve multiple accounts with pagination |
| Create | Add new account to Pendo tracking |
| Update | Modify account properties and segmentation data |
| Delete | Remove account from Pendo system |

### 3. Guides

| Operation | Description |
|-----------|-------------|
| Get | Retrieve guide configuration and performance data |
| List | Fetch all guides with filtering by status or type |
| Create | Build new in-app guides and onboarding flows |
| Update | Modify guide content, targeting, and behavior |
| Delete | Remove guides from the application |
| Activate | Enable guide for targeted users |
| Deactivate | Disable guide from appearing to users |

### 4. Segments

| Operation | Description |
|-----------|-------------|
| Get | Retrieve segment definition and member count |
| List | Fetch all segments with metadata |
| Create | Build new user or account segments |
| Update | Modify segment rules and criteria |
| Delete | Remove segments from Pendo |
| Get Members | Retrieve users or accounts in a segment |

### 5. Events

| Operation | Description |
|-----------|-------------|
| Get | Fetch event details and associated data |
| List | Retrieve events with time range and filtering |
| Create | Track custom events in Pendo |
| Query | Run analytics queries on event data |
| Aggregate | Get summarized event metrics and insights |

### 6. Features

| Operation | Description |
|-----------|-------------|
| Get | Retrieve feature usage data and analytics |
| List | Fetch all tracked features with metrics |
| Create | Add new feature tracking to Pendo |
| Update | Modify feature properties and grouping |
| Delete | Remove feature from tracking |
| Get Usage | Retrieve feature adoption and usage statistics |

## Usage Examples

```javascript
// Get visitor profile and recent activity
{
  "resource": "visitors",
  "operation": "get",
  "visitorId": "visitor_12345",
  "includeEvents": true,
  "eventLimit": 50
}
```

```javascript
// Create targeted guide for new users
{
  "resource": "guides",
  "operation": "create",
  "name": "Welcome Onboarding",
  "type": "walkthrough",
  "targeting": {
    "segment": "new_users",
    "pages": ["/dashboard"]
  },
  "steps": [
    {
      "title": "Welcome to the Dashboard",
      "content": "Let's show you around!"
    }
  ]
}
```

```javascript
// Track feature usage event
{
  "resource": "events",
  "operation": "create",
  "type": "feature_used",
  "visitorId": "visitor_67890",
  "accountId": "account_abc123",
  "properties": {
    "feature_name": "advanced_search",
    "usage_context": "product_catalog"
  }
}
```

```javascript
// Create dynamic user segment
{
  "resource": "segments",
  "operation": "create",
  "name": "Power Users",
  "type": "visitor",
  "rule": {
    "conditions": [
      {
        "field": "feature_usage_count",
        "operator": "greater_than",
        "value": 10
      },
      {
        "field": "last_login",
        "operator": "within_days",
        "value": 7
      }
    ]
  }
}
```

## Error Handling

| Error | Description | Solution |
|-------|-------------|----------|
| Invalid API Key | Authentication failed with provided API key | Verify API key in Pendo Settings > Integrations |
| Rate Limit Exceeded | Too many API requests in time window | Implement request throttling or retry logic |
| Resource Not Found | Requested visitor, account, or guide doesn't exist | Check resource ID and ensure it exists in Pendo |
| Invalid Segment Rules | Segment conditions contain invalid fields or operators | Review segment rule syntax and available fields |
| Guide Creation Failed | Guide configuration contains invalid properties | Validate guide structure and targeting rules |
| Insufficient Permissions | API key lacks required permissions for operation | Contact Pendo admin to update API key permissions |

## Development

```bash
npm install
npm run build
npm test
npm run lint
npm run dev
```

## Author

**Velocity BPA**
- Website: [velobpa.com](https://velobpa.com)
- GitHub: [Velocity-BPA](https://github.com/Velocity-BPA)

## Licensing

This n8n community node is licensed under the **Business Source License 1.1**.

### Free Use
Permitted for personal, educational, research, and internal business use.

### Commercial Use
Use of this node within any SaaS, PaaS, hosted platform, managed service, or paid automation offering requires a commercial license.

For licensing inquiries: **licensing@velobpa.com**

See [LICENSE](LICENSE), [COMMERCIAL_LICENSE.md](COMMERCIAL_LICENSE.md), and [LICENSING_FAQ.md](LICENSING_FAQ.md) for details.

## Contributing

Contributions are welcome! Please ensure:

1. Code follows existing style conventions
2. All tests pass (`npm test`)
3. Linting passes (`npm run lint`)
4. Documentation is updated for new features
5. Commit messages are descriptive

## Support

- **Issues**: [GitHub Issues](https://github.com/Velocity-BPA/n8n-nodes-pendo/issues)
- **Pendo API Documentation**: [Pendo Developer Hub](https://developers.pendo.io/)
- **Pendo Community**: [Pendo Community Forum](https://community.pendo.io/)