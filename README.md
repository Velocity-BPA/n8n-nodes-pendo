# n8n-nodes-pendo

> **[Velocity BPA Licensing Notice]**
>
> This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
>
> Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
>
> For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.

This n8n community node provides seamless integration with Pendo's product analytics and user guidance platform. With 7 comprehensive resources, it enables product teams to automate user behavior tracking, guide management, and product analytics workflows directly within their n8n automations.

![n8n Community Node](https://img.shields.io/badge/n8n-Community%20Node-blue)
![License](https://img.shields.io/badge/license-BSL--1.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![Product Analytics](https://img.shields.io/badge/Product-Analytics-orange)
![User Guidance](https://img.shields.io/badge/User-Guidance-green)
![Pendo API](https://img.shields.io/badge/Pendo-API-purple)

## Features

- **Complete Account Management** - Create, update, retrieve, and delete user accounts with comprehensive metadata
- **Visitor Behavior Tracking** - Monitor and analyze individual visitor interactions and product usage patterns
- **Guide Orchestration** - Automate in-app guide creation, publishing, and targeting for user onboarding
- **Event Analytics** - Track custom events and user actions for detailed product analytics insights
- **Feature Usage Monitoring** - Analyze feature adoption and usage metrics across your product
- **Page Analytics** - Monitor page views, engagement, and user journey analytics
- **Segment Management** - Create and manage user segments for targeted experiences and analytics
- **Real-time Data Sync** - Seamlessly integrate Pendo data with your existing automation workflows

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
| API Key | Your Pendo API key from Settings > Integrations > Integration Keys | Yes |

## Resources & Operations

### 1. Account

| Operation | Description |
|-----------|-------------|
| Create | Create a new account with metadata and properties |
| Get | Retrieve account details by account ID |
| Update | Update existing account information and metadata |
| Delete | Remove an account from Pendo |
| List | Get all accounts with optional filtering |

### 2. Visitor

| Operation | Description |
|-----------|-------------|
| Create | Create a new visitor profile with user attributes |
| Get | Retrieve visitor information by visitor ID |
| Update | Update visitor properties and metadata |
| Delete | Remove a visitor from Pendo |
| List | Get all visitors with filtering options |
| Get Events | Retrieve events associated with a specific visitor |

### 3. Guide

| Operation | Description |
|-----------|-------------|
| Create | Create a new in-app guide with steps and targeting |
| Get | Retrieve guide details by guide ID |
| Update | Modify guide content, targeting, or settings |
| Delete | Remove a guide from Pendo |
| List | Get all guides with status and type filtering |
| Publish | Publish a guide to make it active |
| Unpublish | Deactivate a published guide |

### 4. Event

| Operation | Description |
|-----------|-------------|
| Track | Send custom events to Pendo for analytics |
| Get | Retrieve event details by event ID |
| List | Get events with date range and filtering |
| Aggregate | Get aggregated event data and metrics |

### 5. Feature

| Operation | Description |
|-----------|-------------|
| Create | Define a new feature for tracking |
| Get | Retrieve feature information and usage data |
| Update | Modify feature properties and settings |
| Delete | Remove a feature from tracking |
| List | Get all features with usage statistics |
| Get Usage | Retrieve detailed usage analytics for a feature |

### 6. Page

| Operation | Description |
|-----------|-------------|
| Create | Register a new page for tracking |
| Get | Retrieve page details and analytics |
| Update | Modify page properties and metadata |
| Delete | Remove a page from tracking |
| List | Get all tracked pages with analytics |
| Get Analytics | Retrieve detailed page analytics and metrics |

### 7. Segment

| Operation | Description |
|-----------|-------------|
| Create | Create a new user segment with criteria |
| Get | Retrieve segment details and member count |
| Update | Modify segment criteria and properties |
| Delete | Remove a segment from Pendo |
| List | Get all segments with statistics |
| Get Members | Retrieve users in a specific segment |

## Usage Examples

```javascript
// Create a new account with metadata
{
  "accountId": "acct_12345",
  "metadata": {
    "company": "Acme Corp",
    "plan": "enterprise",
    "mrr": 5000,
    "employees": 150
  }
}
```

```javascript
// Track a custom event for user analytics
{
  "visitorId": "user_67890",
  "accountId": "acct_12345",
  "event": "feature_used",
  "properties": {
    "feature_name": "advanced_reporting",
    "session_duration": 1200,
    "clicks": 5
  }
}
```

```javascript
// Create a targeted in-app guide
{
  "name": "Onboarding Guide - New Users",
  "steps": [
    {
      "type": "tooltip",
      "element": "#welcome-button",
      "content": "Welcome! Click here to get started."
    }
  ],
  "targeting": {
    "segment": "new_users",
    "url_rules": ["/dashboard"]
  }
}
```

```javascript
// Create a user segment for targeting
{
  "name": "High Value Customers",
  "criteria": {
    "account.metadata.mrr": {
      "operator": "gte",
      "value": 1000
    },
    "visitor.metadata.last_login": {
      "operator": "within_days",
      "value": 7
    }
  }
}
```

## Error Handling

| Error | Description | Solution |
|-------|-------------|----------|
| 401 Unauthorized | Invalid or missing API key | Verify API key in credentials configuration |
| 403 Forbidden | Insufficient permissions for operation | Check API key permissions in Pendo settings |
| 404 Not Found | Resource (account, visitor, guide) doesn't exist | Verify resource ID exists before operation |
| 429 Rate Limited | Too many API requests | Implement delays between requests or use bulk operations |
| 400 Bad Request | Invalid data format or missing required fields | Validate input data format and required fields |
| 500 Internal Server Error | Pendo service temporarily unavailable | Retry operation after delay or check Pendo status |

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
- **Pendo API Documentation**: [Pendo Developer Center](https://developers.pendo.io/)
- **Pendo Community**: [Pendo Product Community](https://community.pendo.io/)