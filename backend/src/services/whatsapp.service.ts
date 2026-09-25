import { db } from '../config/db';
import { decryptConfigObject } from '../utils/encrypt';

export interface WhatsAppConfig {
  wabaId?: string;
  phoneId?: string;
  accessToken?: string;
  otpTemplateName?: string;
  languageCode?: string;
  connected?: boolean;
}

export interface SendMessageResult {
  success: boolean;
  messageId?: string;
  error?: string;
  details?: any;
}

export interface SendOtpWhatsAppParams {
  orgId: string;
  to: string;
  otpCode: string;
  title?: string;
  documentType?: string;
  agencyName?: string;
  overrideConfig?: WhatsAppConfig;
}

export interface SendOtpWhatsAppResult {
  success: boolean;
  messageId?: string;
  error?: string;
  method?: 'template' | 'text';
  notConfigured?: boolean;
}

export interface SendDocumentInviteWhatsAppParams {
  orgId: string;
  to: string;
  recipientName: string;
  shareUrl: string;
  documentTitle: string;
  documentType: string;
  agencyName?: string;
  personalMessage?: string;
}

/**
 * Normalizes phone numbers for WhatsApp Cloud API (E.164 format without '+')
 * e.g., "+91 98765-43210" -> "919876543210"
 * "09876543210" -> "919876543210"
 * "9876543210" (10 digits) -> "919876543210" (India default if no CC provided)
 */
export function normalizeWhatsAppNumber(phone: string): string {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (!digits) return '';

  // 10 digits -> Assume Indian mobile
  if (digits.length === 10) {
    return `91${digits}`;
  }

  // 11 digits starting with 0 -> Strip 0 and prepend 91
  if (digits.length === 11 && digits.startsWith('0')) {
    return `91${digits.slice(1)}`;
  }

  return digits;
}

/**
 * Formats phone number for safe display (e.g. +91 ••••••3210)
 */
export function maskPhoneNumber(phone: string): string {
  if (!phone) return '';
  const clean = phone.replace(/\s+/g, '');
  if (clean.length <= 4) return clean;
  const last4 = clean.slice(-4);
  const prefix = clean.startsWith('+') ? clean.slice(0, 3) : '+91';
  return `${prefix} ••••••${last4}`;
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
      const otpTemplateName = decrypted.otpTemplateName || process.env.WHATSAPP_OTP_TEMPLATE;
      const languageCode = decrypted.languageCode || 'en_US';

      if (phoneId && accessToken) {
        return {
          wabaId,
          phoneId,
          accessToken,
          otpTemplateName,
          languageCode,
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
        otpTemplateName: process.env.WHATSAPP_OTP_TEMPLATE,
        languageCode: 'en_US',
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
  body: string,
  overrideConfig?: WhatsAppConfig
): Promise<SendMessageResult> {
  const config = (overrideConfig && overrideConfig.phoneId && overrideConfig.accessToken)
    ? overrideConfig
    : await getWhatsAppConfig(orgId);
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
    const url = `https://graph.facebook.com/v20.0/${encodeURIComponent(config.phoneId.trim())}/messages`;
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
      console.log(`[WhatsApp Service] Dispatched text message to ${normalizedTo}, ID: ${data.messages[0].id}`);
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
 * Sends an approved WhatsApp Template Message (e.g. Authentication or Utility template)
 */
export async function sendWhatsAppTemplateMessage(
  orgId: string,
  to: string,
  templateName: string,
  languageCode = 'en_US',
  components: any[] = [],
  overrideConfig?: WhatsAppConfig
): Promise<SendMessageResult> {
  const config = (overrideConfig && overrideConfig.phoneId && overrideConfig.accessToken)
    ? overrideConfig
    : await getWhatsAppConfig(orgId);
  if (!config || !config.phoneId || !config.accessToken) {
    return {
      success: false,
      error: 'WhatsApp Cloud API integration is not configured.'
    };
  }

  const normalizedTo = normalizeWhatsAppNumber(to);
  if (!normalizedTo || normalizedTo.length < 8) {
    return {
      success: false,
      error: 'Invalid recipient phone number'
    };
  }

  try {
    const url = `https://graph.facebook.com/v20.0/${encodeURIComponent(config.phoneId.trim())}/messages`;
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
      console.log(`[WhatsApp Service] Dispatched template "${templateName}" to ${normalizedTo}, ID: ${data.messages[0].id}`);
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

/**
 * Dispatches a 6-digit OTP verification message via WhatsApp
 * Attempts template if configured; falls back automatically to formatted text message
 */
export async function sendWhatsAppOtp(params: SendOtpWhatsAppParams): Promise<SendOtpWhatsAppResult> {
  const { orgId, to, otpCode, title, agencyName, overrideConfig } = params;
  const config = (overrideConfig && overrideConfig.phoneId && overrideConfig.accessToken)
    ? overrideConfig
    : await getWhatsAppConfig(orgId);

  if (!config || !config.phoneId || !config.accessToken) {
    return {
      success: false,
      notConfigured: true,
      error: 'WhatsApp integration is not connected for this organization'
    };
  }

  const normalizedTo = normalizeWhatsAppNumber(to);
  if (!normalizedTo || normalizedTo.length < 8) {
    return {
      success: false,
      error: `Invalid phone number for WhatsApp OTP: ${to}`
    };
  }

  // 1. Try approved Meta template if configured
  if (config.otpTemplateName) {
    try {
      const templateResult = await sendWhatsAppTemplateMessage(
        orgId,
        normalizedTo,
        config.otpTemplateName,
        config.languageCode || 'en_US',
        [
          {
            type: 'body',
            parameters: [{ type: 'text', text: otpCode }]
          },
          {
            type: 'button',
            sub_type: 'url',
            index: '0',
            parameters: [{ type: 'text', text: otpCode }]
          }
        ],
        config
      );

      if (templateResult.success) {
        return {
          success: true,
          messageId: templateResult.messageId,
          method: 'template'
        };
      }

      console.warn(`[WhatsApp Service] Template dispatch failed, falling back to direct message:`, templateResult.error);
    } catch (tmplErr: any) {
      console.warn(`[WhatsApp Service] Template attempt error, falling back to direct message:`, tmplErr.message);
    }
  }

  // 2. Direct Formatted Text Message Fallback
  const safeAgency = agencyName || 'OptiVir';
  const docRef = title ? ` to review "${title}"` : '';
  const messageBody = `*${otpCode}* is your verification code${docRef} from ${safeAgency}.\n\nThis code expires in 10 minutes. For security, do not share this code with anyone.`;

  const textResult = await sendWhatsAppTextMessage(orgId, normalizedTo, messageBody, config);

  return {
    success: textResult.success,
    messageId: textResult.messageId,
    error: textResult.error,
    method: 'text'
  };
}

/**
 * Dispatches a Document or Proposal Review Invitation via WhatsApp
 */
export async function sendWhatsAppDocumentInvite(
  params: SendDocumentInviteWhatsAppParams
): Promise<SendMessageResult> {
  const { orgId, to, recipientName, shareUrl, documentTitle, documentType, agencyName, personalMessage } = params;
  const safeAgency = agencyName || 'OptiVir';
  const typeLabel = (documentType || 'document').toUpperCase();

  const greeting = recipientName ? `Hello ${recipientName},` : 'Hello,';
  const note = personalMessage ? `\n\n_"${personalMessage}"_\n` : '\n';

  const body = `${greeting}\n\nYou have been invited by *${safeAgency}* to review and approve the official ${typeLabel}: *${documentTitle}*.${note}\n👉 *Access Secure Review Portal:*\n${shareUrl}\n\n_Note: Access is secured with a one-time OTP for authorization._`;

  return await sendWhatsAppTextMessage(orgId, to, body);
}
