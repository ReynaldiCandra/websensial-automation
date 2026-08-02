/**
 * Rules Engine Types
 * Defines all types for lead automation rules
 */

export type RuleAction =
  | 'assign_to_agent'
  | 'send_template'
  | 'create_task'
  | 'add_tag'
  | 'update_status'
  | 'send_notification'
  | 'trigger_webhook'

export type RuleConditionOperator =
  | 'equals'
  | 'not_equals'
  | 'contains'
  | 'not_contains'
  | 'greater_than'
  | 'less_than'
  | 'starts_with'
  | 'ends_with'
  | 'in_array'
  | 'not_in_array'

export type RuleTriggerType =
  | 'message_received'
  | 'lead_created'
  | 'lead_updated'
  | 'status_changed'
  | 'scheduled'
  | 'webhook'

export interface RuleCondition {
  field: string
  operator: RuleConditionOperator
  value: string | number | string[] | boolean
  logicalOperator?: 'AND' | 'OR'
}

export interface RuleAction {
  type: RuleAction
  payload: Record<string, any>
  delay?: number // milliseconds
}

export interface Rule {
  id: string
  companyId: string
  name: string
  description?: string
  enabled: boolean
  trigger: RuleTriggerType
  conditions: RuleCondition[]
  actions: RuleAction[]
  priority: number // Higher = runs first
  createdAt: Date
  updatedAt: Date
}

export interface RuleExecutionContext {
  leadId: string
  companyId: string
  trigger: RuleTriggerType
  data: Record<string, any>
  executedRules: string[]
}

export interface RuleExecutionResult {
  ruleId: string
  success: boolean
  actionsExecuted: number
  error?: string
  executedAt: Date
}

export interface LeadScore {
  leadId: string
  score: number
  factors: {
    messageFrequency: number
    responseTime: number
    keywordMatches: number
    engagementLevel: number
  }
  level: 'cold' | 'warm' | 'hot'
  updatedAt: Date
}
