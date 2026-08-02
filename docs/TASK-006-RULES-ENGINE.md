# TASK-006: Rules Engine - Lead Automation

## Status: COMPLETE ✅

Complete Rules Engine for lead automation with scoring, conditions, and action execution.

---

## What's Implemented

### 1. Rules Engine Core (`lib/rules-engine/`)
- **types.ts** - All TypeScript interfaces and enums
- **engine.ts** - RulesEngine class with execution logic

#### Features:
- Rule condition evaluation (10 operators)
- Rule action execution (7 action types)
- Lead scoring algorithm
- Logical operators (AND/OR)
- Infinite loop prevention
- Priority-based rule execution

### 2. API Endpoints

#### GET /api/rules
Fetch all rules for a company
```bash
GET /api/rules?companyId=abc123
```

Response:
```json
[
  {
    "id": "rule_123",
    "name": "Auto-assign hot leads",
    "trigger": "lead_created",
    "conditions": [...],
    "actions": [...],
    "priority": 100,
    "enabled": true
  }
]
```

#### POST /api/rules
Create new automation rule
```bash
POST /api/rules
{
  "companyId": "abc123",
  "name": "Auto-assign hot leads",
  "trigger": "lead_created",
  "conditions": [
    {
      "field": "score",
      "operator": "greater_than",
      "value": 75
    }
  ],
  "actions": [
    {
      "type": "assign_to_agent",
      "payload": { "agentId": "agent_1" }
    }
  ],
  "priority": 100,
  "enabled": true
}
```

#### POST /api/rules/execute
Execute rules for a lead
```bash
POST /api/rules/execute
{
  "leadId": "lead_123",
  "companyId": "abc123",
  "trigger": "message_received",
  "data": {
    "messageBody": "I want to buy",
    "messageCount": 5
  }
}
```

Response:
```json
{
  "success": true,
  "executedRules": 2,
  "results": [
    {
      "ruleId": "rule_123",
      "success": true,
      "actionsExecuted": 1,
      "executedAt": "2025-08-02T12:00:00Z"
    }
  ]
}
```

#### POST /api/rules/score
Calculate and store lead score
```bash
POST /api/rules/score
{
  "leadId": "lead_123",
  "messageCount": 10,
  "responseTimeMs": 300000,
  "keywordMatches": 3,
  "daysSinceLastMessage": 1
}
```

Response:
```json
{
  "success": true,
  "leadId": "lead_123",
  "score": 78,
  "level": "hot",
  "factors": {
    "messageFrequency": 80,
    "responseTime": 92,
    "keywordMatches": 60,
    "engagementLevel": 95
  }
}
```

---

## Condition Operators

```
equals           - Exact match
not_equals       - Not equal
contains         - String contains
not_contains     - String doesn't contain
greater_than     - Numeric comparison
less_than        - Numeric comparison
starts_with      - String starts with
ends_with        - String ends with
in_array         - Value in array
not_in_array     - Value not in array
```

---

## Action Types

```
assign_to_agent      - Assign lead to specific agent
send_template        - Send WhatsApp template message
create_task          - Create task for follow-up
add_tag              - Add tag to lead
update_status        - Change lead status
send_notification    - Send internal notification
trigger_webhook      - Call external webhook
```

---

## Lead Scoring Algorithm

Scores based on 4 factors (0-100 each):

1. **Message Frequency** - How active is the lead?
   - Formula: (messageCount / 10) * 100
   
2. **Response Time** - How quickly do they respond?
   - Formula: 100 - (responseTimeMs / 3600000) * 10
   
3. **Keyword Matches** - How many purchase keywords mentioned?
   - Formula: (keywordMatches / 5) * 100
   
4. **Engagement Level** - How recent is last message?
   - Formula: 100 - (daysSinceLastMessage * 5)

**Final Score** = Average of all 4 factors

**Lead Levels:**
- Hot: >= 75 (ready to convert)
- Warm: 50-74 (nurturing)
- Cold: < 50 (new/inactive)

---

## Trigger Types

```
message_received     - New WhatsApp message
lead_created         - Lead just created
lead_updated         - Lead fields changed
status_changed       - Lead status changed
scheduled            - Scheduled/cron trigger
webhook              - External webhook trigger
```

---

## Logical Operators

Combine conditions with AND/OR:

```json
{
  "conditions": [
    {
      "field": "score",
      "operator": "greater_than",
      "value": 75
    },
    {
      "field": "status",
      "operator": "equals",
      "value": "new",
      "logicalOperator": "AND"
    }
  ]
}
```

---

## Database Schema

### automation_rules
```sql
{
  id: uuid PRIMARY KEY,
  company_id: uuid NOT NULL,
  name: text NOT NULL,
  description: text,
  trigger: text NOT NULL,
  conditions: jsonb DEFAULT [],
  actions: jsonb DEFAULT [],
  priority: integer DEFAULT 0,
  enabled: boolean DEFAULT true,
  created_at: timestamp,
  updated_at: timestamp
}
```

### rule_executions
```sql
{
  id: uuid PRIMARY KEY,
  lead_id: uuid NOT NULL,
  company_id: uuid NOT NULL,
  trigger: text NOT NULL,
  executed_rules: text[],
  results: jsonb,
  data_snapshot: jsonb,
  created_at: timestamp
}
```

### lead_scores
```sql
{
  id: uuid PRIMARY KEY,
  lead_id: uuid UNIQUE,
  score: integer (0-100),
  level: text ('cold', 'warm', 'hot'),
  factors: jsonb,
  updated_at: timestamp
}
```

---

## Usage Example

### Setup: Create a rule
```typescript
import axios from 'axios'

const rule = {
  companyId: 'company_123',
  name: 'Hot Lead Handler',
  trigger: 'lead_created',
  conditions: [
    {
      field: 'messageCount',
      operator: 'greater_than',
      value: 5
    },
    {
      field: 'keyword',
      operator: 'contains',
      value: 'buy',
      logicalOperator: 'AND'
    }
  ],
  actions: [
    {
      type: 'assign_to_agent',
      payload: { agentId: 'agent_premium' }
    },
    {
      type: 'send_template',
      payload: {
        templateId: 'welcome_hot_lead',
        params: { name: 'John' }
      }
    }
  ],
  priority: 100,
  enabled: true
}

const response = await axios.post('/api/rules', rule)
```

### Execute: When lead sends message
```typescript
await axios.post('/api/rules/execute', {
  leadId: 'lead_456',
  companyId: 'company_123',
  trigger: 'message_received',
  data: {
    messageBody: 'I want to buy your product',
    messageCount: 6
  }
})
```

### Score: Calculate lead value
```typescript
await axios.post('/api/rules/score', {
  leadId: 'lead_456',
  messageCount: 6,
  responseTimeMs: 250000,
  keywordMatches: 2,
  daysSinceLastMessage: 0
})
```

---

## Next Steps

- **TASK-007**: Dashboard UI for rule management
- **Integration**: Connect with actual agent assignment system
- **Analytics**: Rule performance tracking
- **A/B Testing**: Test different rules against lead conversion
- **Machine Learning**: Auto-suggest rules based on patterns

---

## References

- [Rule Engine Pattern](https://en.wikipedia.org/wiki/Business_rules_engine)
- [JSON-based Rules](https://github.com/zillow/react-jsonschema-form)
