/**
 * WhatsApp Adapter Configuration Helper
 * Loads and validates WhatsApp credentials from environment
 */

import { WhatsAppAdapter, WhatsAppConfig } from './whatsapp'

export function getWhatsAppConfig(): WhatsAppConfig {
  const config: WhatsAppConfig = {
    name: 'whatsapp',
    displayName: 'WhatsApp Business',
    apiKey: process.env.WHATSAPP_API_KEY || '',
    apiSecret: process.env.WHATSAPP_API_SECRET || '',
    businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || '',
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
    baseUrl: process.env.WHATSAPP_API_URL || 'https://graph.instagram.com/v18.0',
    timeout: 30000,
  }

  validateConfig(config)
  return config
}

export function validateConfig(config: WhatsAppConfig): void {
  const required = ['apiKey', 'apiSecret', 'businessAccountId', 'phoneNumberId']
  const missing = required.filter((field) => !config[field as keyof WhatsAppConfig])

  if (missing.length > 0) {
    console.warn(
      `[WhatsApp] Missing configuration: ${missing.join(', ')}. WhatsApp adapter will not be functional.`
    )
  }
}

export function initializeWhatsAppAdapter(): WhatsAppAdapter {
  const config = getWhatsAppConfig()
  return new WhatsAppAdapter(config)
}

export default {
  getWhatsAppConfig,
  validateConfig,
  initializeWhatsAppAdapter,
}
