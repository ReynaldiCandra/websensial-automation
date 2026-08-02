/**
 * Provider Adapter Factory
 * 
 * Central registry for all provider adapters
 * Enables pluggable provider implementations
 */

import { ProviderAdapter, ProviderConfig, ProviderType } from './provider-interface'
import WhatsAppAdapter, { WhatsAppConfig } from './whatsapp'
import DLTAdapter, { DLTConfig } from './dlt'
import EmailAdapter, { EmailConfig } from './email'

export * from './provider-interface'
export { WhatsAppAdapter, DLTAdapter, EmailAdapter }

/**
 * Create provider adapter instance
 */
export function createProvider(type: ProviderType, config: ProviderConfig): ProviderAdapter {
  switch (type) {
    case 'whatsapp':
      return new WhatsAppAdapter(config as WhatsAppConfig)
    case 'dlt':
      return new DLTAdapter(config as DLTConfig)
    case 'email':
      return new EmailAdapter(config as EmailConfig)
    default:
      throw new Error(`Unknown provider type: ${type}`)
  }
}

/**
 * Get all available providers
 */
export const AVAILABLE_PROVIDERS: ProviderType[] = ['whatsapp', 'dlt', 'email']

/**
 * Provider registry for runtime discovery
 */
export const providerRegistry = {
  whatsapp: WhatsAppAdapter,
  dlt: DLTAdapter,
  email: EmailAdapter,
}
