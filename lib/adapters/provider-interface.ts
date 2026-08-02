/**
 * Provider Adapter Interface
 * 
 * Abstract interface for all message providers (WhatsApp, DLT, Email, etc.)
 * Enables pluggable provider implementations with consistent API
 */

export interface Message {
  id?: string
  to: string
  body: string
  type?: 'text' | 'template' | 'image' | 'document'
  templateId?: string
  templateParams?: Record<string, string>
  metadata?: Record<string, any>
}

export interface SendResult {
  success: boolean
  messageId?: string
  externalId?: string
  status: 'queued' | 'sent' | 'failed'
  error?: string
  timestamp: Date
}

export interface ParsedMessage {
  externalId: string
  from: string
  to: string
  body: string
  timestamp: Date
  type: 'text' | 'template' | 'image' | 'document'
  metadata?: Record<string, any>
}

export interface Template {
  id: string
  name: string
  body: string
  variables?: string[]
}

export interface ProviderConfig {
  apiKey?: string
  apiSecret?: string
  baseUrl?: string
  timeout?: number
  retries?: number
  [key: string]: any
}

/**
 * Abstract base class for provider adapters
 * All providers must implement these methods
 */
export abstract class ProviderAdapter {
  config: ProviderConfig

  constructor(config: ProviderConfig) {
    this.config = config
  }

  /**
   * Send a message through the provider
   */
  abstract send(message: Message): Promise<SendResult>

  /**
   * Parse webhook payload from provider
   */
  abstract parseWebhook(payload: unknown): ParsedMessage | null

  /**
   * Format a template with variables
   */
  abstract formatTemplate(template: Template, data: Record<string, string>): string

  /**
   * Validate provider configuration
   */
  abstract validateConfig(): boolean

  /**
   * Get provider health status
   */
  abstract getStatus(): Promise<{ status: 'ok' | 'error'; details?: string }>
}

/**
 * Provider factory for creating adapter instances
 */
export type ProviderType = 'whatsapp' | 'dlt' | 'email'

export interface ProviderFactory {
  create(type: ProviderType, config: ProviderConfig): ProviderAdapter
}
