import { db } from '../config/db';
import { decryptConfigObject } from '../utils/encrypt';

export interface WhatsAppConfig {
  wabaId?: string;
  phoneId?: string;
  accessToken?: string;
  connected?: boolean;
}

export interface SendMessageResult {
  success: boolean;
  messageId?: string;
  error?: string;
  details?: any;
}

/**
 * Normalizes phone numbers for WhatsApp Cloud API (E.164 format without '+')
 * e.g., "+91 98765-43210" -> "919876543210"
 * "9876543210" (10 digits) -> "919876543210" (India default if no CC provided)
 */
export function normalizeWhatsAppNumber(phone: string): string {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    return `91${digits}`;
  }
  return digits;
}

/**
 * Retrieves decrypted WhatsApp integration credentials for an organization
 */
export async function getWhatsAppConfig(orgId: string): Promise<WhatsAppConfig | null> {
  try {
    const res = await db.query(
      `SELECT config, connected FROM organization_integrations WHERE organization_id = $1 AND id = 'int-whatsapp'`,
      [orgId]
    );

    if (res.rows.length > 0) {
      const row = res.rows[0];
      let decrypted: any = {};
      if (row.config) {
        try {
          decrypted = decryptConfigObject(row.config);
        } catch {
          decrypted = row.config;
        }
      }

      const phoneId = decrypted.phoneId || process.env.WHATSAPP_PHONE_ID;
      const accessToken = decrypted.accessToken || process.env.WHATSAPP_ACCESS_TOKEN;
      const wabaId = decrypted.wabaId || process.env.WHATSAPP_WABA_ID;

      if (phoneId && accessToken) {
        return {
          wabaId,
          phoneId,
          accessToken,
          connected: row.connected ?? true
        };
      }
    }

    // Fallback to process.env if available
    if (process.env.WHATSAPP_PHONE_ID && process.env.WHATSAPP_ACCESS_TOKEN) {
      return {
        wabaId: process.env.WHATSAPP_WABA_ID,
        phoneId: process.env.WHATSAPP_PHONE_ID,
        accessToken: process.env.WHATSAPP_ACCESS_TOKEN,
        connected: true
      };
    }

    return null;
  } catch (err) {
    console.error('[WhatsApp Service] Error fetching config:', err);
    return null;
  }
}

/**
 * Sends a raw text message via Meta WhatsApp Cloud API
 */
export async function sendWhatsAppTextMessage(
  orgId: string,
  to: string,
  body: string
): Promise<SendMessageResult> {
  const config = await getWhatsAppConfig(orgId);
  if (!config || !config.phoneId || !config.accessToken) {
    return {
      success: false,
      error: 'WhatsApp Cloud API integration is not configured. Please add your Phone Number ID and Access Token in Settings > Integrations.'
    };
  }

  const normalizedTo = normalizeWhatsAppNumber(to);
  if (!normalizedTo || normalizedTo.length < 8) {
    return {
      success: false,
      error: `Invalid recipient phone number: "${to}"`
    };
  }

  try {
    const url = `https://graph.facebook.com/v20.0/${encodeURIComponent(config.phoneId)}/messages`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.accessToken.trim()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: normalizedTo,
        type: 'text',
        text: {
          preview_url: true,
          body
        }
      })
    });

    const data: any = await response.json().catch(() => ({}));

    if (response.ok && data?.messages?.[0]?.id) {
      return {
        success: true,
        messageId: data.messages[0].id,
        details: data
      };
    }

    const errorMessage = data?.error?.message || `HTTP ${response.status}: Failed to send WhatsApp message`;
    console.error('[WhatsApp Service] Meta Cloud API error:', data);
    return {
      success: false,
      error: errorMessage,
      details: data?.error
    };
  } catch (err: any) {
    console.error('[WhatsApp Service] Request error:', err);
    return {
      success: false,
      error: err?.message || 'Network error communicating with WhatsApp Cloud API'
    };
  }
}

/**
 * Sends an approved WhatsApp Template Message (e.g. hello_world or custom utility templates)
 */
export async function sendWhatsAppTemplateMessage(
  orgId: string,
  to: string,
  templateName: string,
  languageCode = 'en_US',
  components: any[] = []
): Promise<SendMessageResult> {
  const config = await getWhatsAppConfig(orgId);
  if (!config || !config.phoneId || !config.accessToken) {
    return {
      success: false,
      error: 'WhatsApp Cloud API integration is not configured.'
    };
  }

  const normalizedTo = normalizeWhatsAppNumber(to);
  if (!normalizedTo) {
    return {
      success: false,
      error: 'Invalid recipient phone number'
    };
  }

  try {
    const url = `https://graph.facebook.com/v20.0/${encodeURIComponent(config.phoneId)}/messages`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.accessToken.trim()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: normalizedTo,
        type: 'template',
        template: {
          name: templateName,
          language: {
            code: languageCode
          },
          components: components.length > 0 ? components : undefined
        }
      })
    });

    const data: any = await response.json().catch(() => ({}));

    if (response.ok && data?.messages?.[0]?.id) {
      return {
        success: true,
        messageId: data.messages[0].id,
        details: data
      };
    }

    return {
      success: false,
      error: data?.error?.message || 'Failed to send template message',
      details: data?.error
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Network error sending template message'
    };
  }
}
