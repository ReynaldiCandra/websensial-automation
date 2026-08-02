/**
 * DLT (Dedicated Long Code / Direct Link) Provider Adapter
 * 
 * Stub implementation for DLT SMS gateway integration
 * To be completed with specific DLT provider API details
 */

import {
  ProviderAdapter,
  ProviderConfig,
  Message,
  SendResult,
  ParsedMessage,
  Template,
} from './provider-interface'

export interface DLTConfig extends ProviderConfig {
  accountId: string
  token: string
  baseUrl?: string
}

export class DLTAdapter extends ProviderAdapter {
  declare config: DLTConfig

  constructor(config: DLTConfig) {
    super(config)
  }

  /**
   * Send message via DLT gateway
   */
  async send(message: Message): Promise<SendResult> {
    try {
      if (!this.validateConfig()) {
        return {
          success: false,
          status: 'failed',
          error: 'Invalid DLT configuration',
          timestamp: new Date(),
        }
      }

      // TODO: Implement DLT API call
      // Example structure (varies by DLT provider):
      // POST /api/send
      // {
      //   "accountId": "...",
      //   "recipients": ["62812345678"],
      //   "message": "...",
      //   "dlcs": "..." // DLT entity-template mapping
      // }

      const mockMessageId = `dlt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      return {
        success: true,
        messageId: message.id || mockMessageId,
        externalId: mockMessageId,
        status: 'sent',
        timestamp: new Date(),
      }
    } catch (error) {
      return {
        success: false,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
      }
    }
  }

  /**
   * Parse DLT webhook payload
   */
  parseWebhook(payload: unknown): ParsedMessage | null {
    try {
      // TODO: Implement DLT webhook parsing
      // Structure depends on specific DLT provider

      const data = payload as Record<string, any>

      if (!data.id || !data.from || !data.message) {
        return null
      }

      return {
        externalId: data.id,
        from: data.from,
        to: data.to || '',
        body: data.message,
        timestamp: new Date(data.timestamp),
        type: 'text',
        metadata: {
          provider: 'dlt',
          dlcId: data.dlcId,
        },
      }
    } catch {
      return null
    }
  }

  /**
   * Format template with variables
   */
  formatTemplate(template: Template, data: Record<string, string>): string {
    let body = template.body

    if (template.variables) {
      template.variables.forEach((variable, index) => {
        const placeholder = `{${index}}`
        body = body.replace(placeholder, data[variable] || '')
      })
    }

    return body
  }

  /**
   * Validate DLT configuration
   */
  validateConfig(): boolean {
    return !!(this.config.accountId && this.config.token)
  }

  /**
   * Get DLT provider health status
   */
  async getStatus(): Promise<{ status: 'ok' | 'error'; details?: string }> {
    try {
      if (!this.validateConfig()) {
        return {
          status: 'error',
          details: 'Invalid configuration',
        }
      }

      // TODO: Implement DLT health check API call

      return {
        status: 'ok',
        details: 'DLT adapter ready',
      }
    } catch (error) {
      return {
        status: 'error',
        details: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }
}

export default DLTAdapter
