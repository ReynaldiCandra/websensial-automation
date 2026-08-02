/**
 * WhatsApp Provider Adapter
 * 
 * Implements WhatsApp Business API integration
 * Handles message sending, webhook parsing, and template management
 */

import {
  ProviderAdapter,
  ProviderConfig,
  Message,
  SendResult,
  ParsedMessage,
  Template,
} from './provider-interface'

export interface WhatsAppConfig extends ProviderConfig {
  apiKey: string
  apiSecret: string
  businessAccountId: string
  phoneNumberId: string
  baseUrl?: string
  timeout?: number
}

export class WhatsAppAdapter extends ProviderAdapter {
  declare config: WhatsAppConfig

  constructor(config: WhatsAppConfig) {
    super(config)
  }

  /**
   * Send message via WhatsApp Business API
   */
  async send(message: Message): Promise<SendResult> {
    try {
      if (!this.validateConfig()) {
        return {
          success: false,
          status: 'failed',
          error: 'Invalid WhatsApp configuration',
          timestamp: new Date(),
        }
      }

      // Format phone number (add country code if missing)
      const recipientPhone = this.formatPhoneNumber(message.to)

      const payload = {
        messaging_product: 'whatsapp',
        to: recipientPhone,
        type: message.type === 'template' ? 'template' : 'text',
        ...(message.type === 'template'
          ? this.buildTemplatePayload(message)
          : { text: { body: message.body } }),
      }

      // In production, make actual API call:
      // const response = await fetch(`${this.config.baseUrl}/messages`, {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${this.config.apiKey}`,
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(payload),
      // })

      // Mock response for now
      const mockMessageId = `wha_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

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
   * Parse WhatsApp webhook payload
   */
  parseWebhook(payload: unknown): ParsedMessage | null {
    try {
      const data = payload as Record<string, any>

      if (!data.entry?.[0]?.changes?.[0]?.value?.messages?.[0]) {
        return null
      }

      const message = data.entry[0].changes[0].value.messages[0]
      const contact = data.entry[0].changes[0].value.contacts?.[0]

      return {
        externalId: message.id,
        from: message.from,
        to: data.entry[0].changes[0].value.metadata.phone_number_id,
        body: message.text?.body || '',
        timestamp: new Date(parseInt(message.timestamp) * 1000),
        type: 'text',
        metadata: {
          waMessageId: message.id,
          senderName: contact?.profile?.name || 'Unknown',
          waTimestamp: message.timestamp,
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
        const placeholder = `{{${index + 1}}}`
        body = body.replace(placeholder, data[variable] || '')
      })
    }

    return body
  }

  /**
   * Validate WhatsApp configuration
   */
  validateConfig(): boolean {
    return !!(
      this.config.apiKey &&
      this.config.apiSecret &&
      this.config.businessAccountId &&
      this.config.phoneNumberId
    )
  }

  /**
   * Get WhatsApp provider health status
   */
  async getStatus(): Promise<{ status: 'ok' | 'error'; details?: string }> {
    try {
      if (!this.validateConfig()) {
        return {
          status: 'error',
          details: 'Invalid configuration',
        }
      }

      // In production, make actual API call to verify credentials
      // For now, just validate config
      return {
        status: 'ok',
        details: 'WhatsApp adapter ready',
      }
    } catch (error) {
      return {
        status: 'error',
        details: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  /**
   * Private helper: Format phone number for WhatsApp API
   */
  private formatPhoneNumber(phone: string): string {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '')

    // Add country code if missing (default to +62 for Indonesia)
    if (cleaned.length === 10 || cleaned.length === 11) {
      return `62${cleaned.slice(1)}`
    }

    return cleaned
  }

  /**
   * Private helper: Build template payload
   */
  private buildTemplatePayload(message: Message) {
    if (!message.templateId || !message.templateParams) {
      return { text: { body: message.body } }
    }

    return {
      template: {
        name: message.templateId,
        language: {
          code: 'id', // Default to Indonesian
        },
        components: [
          {
            type: 'body',
            parameters: Object.values(message.templateParams).map((value) => ({
              type: 'text',
              text: value,
            })),
          },
        ],
      },
    }
  }
}

export default WhatsAppAdapter
