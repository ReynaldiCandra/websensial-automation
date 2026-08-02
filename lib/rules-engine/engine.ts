/**
 * Rules Engine
 * Core engine for executing lead automation rules
 */

import {
  Rule,
  RuleExecutionContext,
  RuleExecutionResult,
  RuleCondition,
  RuleConditionOperator,
  LeadScore,
} from './types'

export class RulesEngine {
  private rules: Map<string, Rule> = new Map()
  private executionStack: Set<string> = new Set()

  /**
   * Register a rule
   */
  registerRule(rule: Rule): void {
    this.rules.set(rule.id, rule)
  }

  /**
   * Execute rules for a given context
   */
  async execute(context: RuleExecutionContext): Promise<RuleExecutionResult[]> {
    const results: RuleExecutionResult[] = []

    // Get applicable rules (sorted by priority)
    const applicableRules = Array.from(this.rules.values())
      .filter((r) => r.companyId === context.companyId && r.enabled && r.trigger === context.trigger)
      .sort((a, b) => b.priority - a.priority)

    for (const rule of applicableRules) {
      // Prevent infinite loops
      if (this.executionStack.has(rule.id)) {
        continue
      }

      // Check conditions
      if (!this.evaluateConditions(rule.conditions, context.data)) {
        continue
      }

      this.executionStack.add(rule.id)
      context.executedRules.push(rule.id)

      try {
        // Execute actions
        let actionsExecuted = 0
        for (const action of rule.actions) {
          if (action.delay) {
            await new Promise((resolve) => setTimeout(resolve, action.delay))
          }
          await this.executeAction(action, context)
          actionsExecuted++
        }

        results.push({
          ruleId: rule.id,
          success: true,
          actionsExecuted,
          executedAt: new Date(),
        })
      } catch (error) {
        results.push({
          ruleId: rule.id,
          success: false,
          actionsExecuted: 0,
          error: error instanceof Error ? error.message : 'Unknown error',
          executedAt: new Date(),
        })
      } finally {
        this.executionStack.delete(rule.id)
      }
    }

    return results
  }

  /**
   * Evaluate rule conditions
   */
  private evaluateConditions(conditions: RuleCondition[], data: Record<string, any>): boolean {
    if (conditions.length === 0) return true

    let result = this.evaluateCondition(conditions[0], data)

    for (let i = 1; i < conditions.length; i++) {
      const operator = conditions[i - 1].logicalOperator || 'AND'
      const nextCondition = this.evaluateCondition(conditions[i], data)

      if (operator === 'AND') {
        result = result && nextCondition
      } else {
        result = result || nextCondition
      }
    }

    return result
  }

  /**
   * Evaluate single condition
   */
  private evaluateCondition(condition: RuleCondition, data: Record<string, any>): boolean {
    const value = data[condition.field]

    switch (condition.operator) {
      case 'equals':
        return value === condition.value
      case 'not_equals':
        return value !== condition.value
      case 'contains':
        return String(value).includes(String(condition.value))
      case 'not_contains':
        return !String(value).includes(String(condition.value))
      case 'greater_than':
        return Number(value) > Number(condition.value)
      case 'less_than':
        return Number(value) < Number(condition.value)
      case 'starts_with':
        return String(value).startsWith(String(condition.value))
      case 'ends_with':
        return String(value).endsWith(String(condition.value))
      case 'in_array':
        return (condition.value as Array<any>).includes(value)
      case 'not_in_array':
        return !(condition.value as Array<any>).includes(value)
      default:
        return false
    }
  }

  /**
   * Execute action
   */
  private async executeAction(action: any, context: RuleExecutionContext): Promise<void> {
    switch (action.type) {
      case 'assign_to_agent':
        await this.assignToAgent(context.leadId, action.payload.agentId)
        break
      case 'send_template':
        await this.sendTemplate(context.leadId, action.payload.templateId, action.payload.params)
        break
      case 'create_task':
        await this.createTask(context.leadId, action.payload.title, action.payload.description)
        break
      case 'add_tag':
        await this.addTag(context.leadId, action.payload.tag)
        break
      case 'update_status':
        await this.updateStatus(context.leadId, action.payload.status)
        break
      case 'send_notification':
        await this.sendNotification(context.leadId, action.payload.message)
        break
      case 'trigger_webhook':
        await this.triggerWebhook(action.payload.url, { leadId: context.leadId, ...action.payload })
        break
    }
  }

  /**
   * Action implementations (stubs - implement with actual logic)
   */
  private async assignToAgent(leadId: string, agentId: string): Promise<void> {
    console.log(`[RulesEngine] Assigning lead ${leadId} to agent ${agentId}`)
    // TODO: Implement actual assignment via database
  }

  private async sendTemplate(leadId: string, templateId: string, params?: Record<string, any>): Promise<void> {
    console.log(`[RulesEngine] Sending template ${templateId} to lead ${leadId}`, params)
    // TODO: Implement via WhatsApp adapter
  }

  private async createTask(leadId: string, title: string, description?: string): Promise<void> {
    console.log(`[RulesEngine] Creating task for lead ${leadId}: ${title}`)
    // TODO: Implement task creation
  }

  private async addTag(leadId: string, tag: string): Promise<void> {
    console.log(`[RulesEngine] Adding tag "${tag}" to lead ${leadId}`)
    // TODO: Implement tag addition
  }

  private async updateStatus(leadId: string, status: string): Promise<void> {
    console.log(`[RulesEngine] Updating lead ${leadId} status to ${status}`)
    // TODO: Implement status update
  }

  private async sendNotification(leadId: string, message: string): Promise<void> {
    console.log(`[RulesEngine] Sending notification to lead ${leadId}: ${message}`)
    // TODO: Implement notification
  }

  private async triggerWebhook(url: string, payload: Record<string, any>): Promise<void> {
    console.log(`[RulesEngine] Triggering webhook: ${url}`)
    try {
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    } catch (error) {
      console.error(`[RulesEngine] Webhook failed:`, error)
    }
  }

  /**
   * Calculate lead score
   */
  calculateLeadScore(data: {
    messageCount: number
    responseTimeMs: number
    keywordMatches: number
    daysSinceLastMessage: number
  }): LeadScore {
    const { messageCount, responseTimeMs, keywordMatches, daysSinceLastMessage } = data

    // Scoring factors (0-100)
    const messageFrequency = Math.min((messageCount / 10) * 100, 100)
    const responseTime = Math.max(0, 100 - (responseTimeMs / 3600000) * 10) // Penalize slow responses
    const keywordScore = Math.min((keywordMatches / 5) * 100, 100)
    const engagementLevel = Math.max(0, 100 - daysSinceLastMessage * 5)

    const totalScore = (messageFrequency + responseTime + keywordScore + engagementLevel) / 4

    return {
      leadId: '', // Set by caller
      score: Math.round(totalScore),
      factors: {
        messageFrequency: Math.round(messageFrequency),
        responseTime: Math.round(responseTime),
        keywordMatches: Math.round(keywordScore),
        engagementLevel: Math.round(engagementLevel),
      },
      level: totalScore >= 75 ? 'hot' : totalScore >= 50 ? 'warm' : 'cold',
      updatedAt: new Date(),
    }
  }
}

export default new RulesEngine()
