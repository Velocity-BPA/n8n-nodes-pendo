# n8n-nodes-pendo

> **[Velocity BPA Licensing Notice]**
>
> This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
>
> Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
>
> For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.

A comprehensive n8n community node for Pendo, the product adoption and digital experience platform. This node enables workflow automation for analytics aggregation, guide management, user/account management, segments, pages, features, NPS surveys, reports, webhooks, and feedback collection through Pendo's REST APIs.

![n8n](https://img.shields.io/badge/n8n-community%20node-orange)
![License](https://img.shields.io/badge/license-BSL--1.1-blue)
![Node Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)

## Features

- **Analytics Aggregation**: Run custom aggregation queries, time series analysis, page events, feature events, guide events, track events, poll events, visitor activity, and account activity summaries
- **Visitor Management**: Get, search, list, update, merge, and bulk delete visitors with metadata management, history, and guide interactions
- **Account Management**: Get, search, list, update, and delete accounts with metadata, visitors, history, and guide interactions
- **Guide Management**: Create, list, get, update, enable/disable, delete guides, retrieve analytics, and get guide steps
- **Segment Management**: Create, update, delete, clone segments, get members, size, and associated guides
- **Track Event Management**: Create, update, delete, search track events with analytics
- **Page Management**: Create, update, delete tagged pages with analytics and URL matching rules
- **Feature Management**: Create, update, delete tagged features with analytics and adoption data
- **NPS Surveys**: Create, update, delete NPS surveys, get responses, analytics, and export data
- **Reports**: Create, update, delete, run, export, and schedule custom reports
- **Webhooks**: Create, update, delete, test webhooks and get delivery history
- **Feedback API Integration**: Create, update, delete feedback requests, manage votes, comments, and status
- **Webhook Triggers**: React to guide events, poll responses, NPS responses, track events, visitor identification, and segment changes
- **Multi-Region Support**: Full support for US and EU datacenters

## Installation

### Community Nodes (Recommended)

1. Open your n8n instance
2. Go to **Settings** > **Community Nodes**
3. Click **Install**
4. Enter `n8n-nodes-pendo`
5. Click **Install**

### Manual Installation

```bash
# Navigate to your n8n installation directory
cd ~/.n8n

# Install the package
npm install n8n-nodes-pendo
```

### Development Installation

```bash
# Clone the repository
git clone https://github.com/Velocity-BPA/n8n-nodes-pendo.git
cd n8n-nodes-pendo

# Install dependencies
npm install

# Build the project
npm run build

# Create symlink to n8n custom nodes directory
mkdir -p ~/.n8n/custom
ln -s $(pwd) ~/.n8n/custom/n8n-nodes-pendo

# Restart n8n
n8n start
```

## Credentials Setup

### Creating Pendo API Credentials

1. Log in to your Pendo account
2. Go to **Settings** > **Integrations**
3. Create a new **Integration Key**
4. Copy the integration key

### Configuring in n8n

| Field | Description |
|-------|-------------|
| Integration Key | Your Pendo Integration Key (from Settings > Integrations) |
| Region | Select US or EU datacenter based on your Pendo subscription |
| Subdomain | Optional: Custom subdomain if applicable |

## Resources & Operations

### Aggregation
| Operation | Description |
|-----------|-------------|
| Run Aggregation | Execute a custom aggregation query with JSON pipeline |
| Get Page Events | Retrieve page view events within a date range |
| Get Feature Events | Retrieve feature click events within a date range |
| Get Guide Events | Retrieve guide interaction events within a date range |
| Get Track Events | Retrieve custom track events within a date range |
| Get Poll Events | Retrieve poll response events within a date range |
| Get Visitor Activity | Get activity summary for a specific visitor |
| Get Account Activity | Get activity summary for a specific account |
| Run Time Series | Execute a time-series aggregation query |

### Visitor
| Operation | Description |
|-----------|-------------|
| Get | Retrieve a visitor by ID |
| Get Many | List multiple visitors with optional filters |
| Search | Search visitors by metadata |
| Update | Update visitor metadata |
| Delete | Bulk delete visitors by ID |
| Get History | Get visitor event history |
| Get Guide History | Get visitor guide interaction history |
| Merge | Merge duplicate visitors |
| Get Accounts | Get accounts associated with a visitor |

### Account
| Operation | Description |
|-----------|-------------|
| Get | Retrieve an account by ID |
| Get Many | List multiple accounts with optional filters |
| Search | Search accounts by metadata |
| Update | Update account metadata |
| Delete | Delete an account |
| Bulk Delete | Batch delete multiple accounts |
| Get Visitors | Get visitors in an account |
| Get History | Get account event history |
| Get Guide History | Get account guide interaction history |

### Guide
| Operation | Description |
|-----------|-------------|
| Get | Retrieve a guide by ID |
| Get Many | List multiple guides with state/app filters |
| Create | Create a new guide |
| Update | Update guide settings (state, name, launch method) |
| Delete | Delete a guide |
| Enable | Enable a guide for display |
| Disable | Disable a guide |
| Get Steps | Get guide step definitions |
| Get By Segment | Get guides targeting a specific segment |
| Get Analytics | Retrieve guide performance analytics |

### Segment
| Operation | Description |
|-----------|-------------|
| Get | Retrieve a segment by ID |
| Get Many | List multiple segments |
| Create | Create a new segment with definition rules |
| Update | Update a segment definition |
| Delete | Delete a segment |
| Get Members | Get visitors/accounts in a segment |
| Get Size | Get segment member count |
| Clone | Duplicate a segment |
| Get Guides | Get guides using a segment |

### Track Event
| Operation | Description |
|-----------|-------------|
| Get | Retrieve a track event by ID |
| Get Many | List multiple track events |
| Create | Create a new track event definition |
| Update | Update a track event definition |
| Delete | Delete a track event |
| Get Analytics | Get track event metrics |
| Search | Search track events by criteria |

### Page
| Operation | Description |
|-----------|-------------|
| Get | Retrieve a page by ID |
| Get Many | List multiple pages |
| Create | Create a new page tag |
| Update | Update a page definition |
| Delete | Delete a page tag |
| Get Analytics | Get page view metrics |
| Get Rules | Get page matching rules |

### Feature
| Operation | Description |
|-----------|-------------|
| Get | Retrieve a feature by ID |
| Get Many | List multiple features |
| Create | Create a new feature tag |
| Update | Update a feature definition |
| Delete | Delete a feature tag |
| Get Analytics | Get feature click metrics |
| Get Adoption | Get feature adoption data |

### NPS
| Operation | Description |
|-----------|-------------|
| Get | Retrieve an NPS survey by ID |
| Get Many | List NPS surveys |
| Create | Create a new NPS survey |
| Update | Update an NPS survey |
| Delete | Delete an NPS survey |
| Get Responses | Get NPS responses for a survey |
| Get Analytics | Get NPS score trends |
| Export Data | Export NPS response data |

### Report
| Operation | Description |
|-----------|-------------|
| Get | Retrieve a report by ID |
| Get Many | List reports |
| Create | Create a custom report |
| Update | Update report configuration |
| Delete | Delete a report |
| Run | Execute report and get data |
| Export | Export report data |
| Schedule | Set up report schedule |

### Webhook
| Operation | Description |
|-----------|-------------|
| Get | Retrieve a webhook by ID |
| Get Many | List webhooks |
| Create | Create a webhook subscription |
| Update | Update a webhook |
| Delete | Delete a webhook |
| Test | Send test payload to webhook |
| Get Deliveries | Get webhook delivery history |

### Feedback
| Operation | Description |
|-----------|-------------|
| Get | Retrieve a feedback request by ID |
| Get Many | List feedback requests with status/priority filters |
| Create | Create a new feedback request |
| Update | Update a feedback request |
| Delete | Delete a feedback request |
| Get Votes | Retrieve votes on a feedback request |
| Add Vote | Add a vote to a feedback request |
| Remove Vote | Remove a vote from a feedback request |
| Get Comments | Get comments on a feedback request |
| Add Comment | Add a comment to a feedback request |
| Get Status | Get the status of a feedback request |

## Trigger Node

The Pendo Trigger node listens for webhook events from Pendo:

| Event | Description |
|-------|-------------|
| Guide Displayed | Triggered when a guide is displayed to a user |
| Guide Dismissed | Triggered when a user dismisses a guide |
| Guide Advanced | Triggered when a user advances in a guide |
| Poll Response | Triggered when a user responds to a poll |
| NPS Response | Triggered when a user submits an NPS response |
| Track Event | Triggered when a custom track event fires |
| Visitor Identified | Triggered when a new visitor is identified |
| Segment Entered | Triggered when a visitor enters a segment |
| Segment Exited | Triggered when a visitor exits a segment |

### Setting Up Webhooks

1. Add a Pendo Trigger node to your workflow
2. Copy the webhook URL displayed in n8n
3. Configure the webhook URL in your Pendo settings
4. Activate the workflow

## Usage Examples

### Running a Custom Aggregation

```json
{
  "pipeline": [
    {
      "source": {
        "pageEvents": {},
        "timeSeries": {
          "period": "dayRange",
          "first": "1704067200000",
          "count": -30
        }
      }
    },
    {
      "identified": "visitorId"
    },
    {
      "reduce": [
        { "count": { "count": "visitorId" } }
      ]
    }
  ]
}
```

### Creating a Segment

```json
{
  "name": "Active Users Last 30 Days",
  "definition": {
    "filter": {
      "type": "and",
      "filters": [
        {
          "type": "visitor",
          "lastVisitTime": {
            "gte": "now-30d"
          }
        }
      ]
    }
  }
}
```

### Updating Visitor Metadata

```json
{
  "visitorId": "user-123",
  "metadata": {
    "plan": "enterprise",
    "onboarding_complete": true,
    "last_feature_used": "dashboard"
  }
}
```

## Pendo Concepts

### Aggregation Pipeline
Pendo's aggregation API uses a pipeline-based query system similar to MongoDB. Each pipeline stage transforms the data:
- **source**: Defines the data source (pageEvents, featureEvents, etc.) and time range
- **identified**: Identifies records by a field
- **group**: Groups records by specified fields
- **reduce**: Applies aggregation functions (count, sum, average, etc.)
- **filter**: Filters records based on conditions
- **sort**: Sorts the results

### Time Series
Time series in Pendo uses epoch milliseconds and relative counts:
- `period`: dayRange, hourRange, or minuteRange
- `first`: Starting timestamp in epoch milliseconds
- `count`: Number of periods (negative for past, positive for future)

### Guide States
- **draft**: Guide is being developed
- **staged**: Guide is ready for testing
- **public**: Guide is live and visible to users
- **disabled**: Guide is turned off

## Error Handling

The node handles common Pendo API errors:

| Error Code | Description |
|------------|-------------|
| 400 | Bad Request / Invalid aggregation query |
| 401 | Unauthorized / Invalid integration key |
| 403 | Forbidden / Insufficient permissions |
| 404 | Resource not found |
| 429 | Rate limited - reduce request frequency |
| 500 | Server error - retry later |

## Rate Limiting

Pendo's aggregation API is not intended for bulk data export. Best practices:
- Break up aggregations by time ranges if hitting rate limits
- Use Data Sync for large data exports
- Implement exponential backoff for retries
- Cache results when possible

## Security Best Practices

1. **Secure Credentials**: Store your integration key securely in n8n credentials
2. **Least Privilege**: Use integration keys with minimal required permissions
3. **Audit Access**: Regularly review and rotate integration keys
4. **Validate Webhooks**: Verify webhook signatures when available
5. **Data Handling**: Be mindful of PII when processing visitor/account data

## Development

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Watch for changes
npm run dev

# Run linting
npm run lint

# Fix linting issues
npm run lint:fix

# Run tests
npm test

# Run tests with coverage
npm run test:coverage
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

For licensing inquiries:
**licensing@velobpa.com**

See [LICENSE](LICENSE), [COMMERCIAL_LICENSE.md](COMMERCIAL_LICENSE.md), and [LICENSING_FAQ.md](LICENSING_FAQ.md) for details.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure your code follows the existing style and includes appropriate tests.

## Support

- **Documentation**: [Pendo Developer Docs](https://developers.pendo.io/docs/)
- **Issues**: [GitHub Issues](https://github.com/Velocity-BPA/n8n-nodes-pendo/issues)
- **n8n Community**: [n8n Community Forum](https://community.n8n.io/)

## Acknowledgments

- [Pendo](https://pendo.io) for their product analytics platform
- [n8n](https://n8n.io) for the workflow automation platform
- The n8n community for their support and contributions
