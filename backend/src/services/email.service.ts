import nodemailer, { Transporter } from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

function escapeHtml(str?: string | null): string {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

interface SendOtpParams {
  toEmail: string;
  otpCode: string;
  creativeName: string;
  agencyName?: string;
}

interface SendInviteParams {
  toEmail: string;
  recipientName?: string;
  shareUrl: string;
  creativeName: string;
  agencyName?: string;
  personalMessage?: string;
}

interface SendDocumentInviteParams {
  toEmail: string;
  recipientName?: string;
  shareUrl: string;
  documentTitle: string;
  documentType: string;
  documentNumber?: string;
  totalAmount?: string | number;
  agencyName?: string;
  personalMessage?: string;
}


interface TeamNotificationParams {
  type: 'COMMENT' | 'APPROVED' | 'CHANGES_REQUESTED';
  creative: {
    id: string;
    name: string;
    campaign_name?: string;
    target_platform?: string;
  };
  clientName: string;
  clientEmail: string;
  commentContent?: string;
  feedbackNotes?: string;
  recipients: Array<{ email: string; name?: string; role: 'CREATOR' | 'MANAGER' | 'TEAM' }>;
}

export interface TaskAssignedNotificationParams {
  task: {
    id: string;
    title: string;
    description?: string | null;
    priority?: string | null;
    due_date?: string | null;
    projectName?: string | null;
    clientName?: string | null;
  };
  assignee: {
    name: string;
    email: string;
  };
  assignedBy?: {
    name: string;
    email?: string;
  };
  agencyName?: string;
}

export interface ProposalAcceptedNotificationParams {
  proposal: {
    id: string;
    number: string;
    title: string;
    clientName: string;
    brandName?: string;
    amount?: string | number;
    managementFee?: string | number;
    advanceAmount?: string | number;
  };
  decision?: 'APPROVED' | 'ACCEPTED';
  approverName: string;
  approverEmail: string;
  feedbackNotes?: string;
  recipients: Array<{ email: string; name?: string; role?: string }>;
  agencyName?: string;
}

export class EmailService {
  private static transporter: Transporter | null = null;
  private static cachedUser: string | null = null;
  private static cachedPass: string | null = null;

  private static getTransporter(): Transporter | null {
    dotenv.config();
    const user = (process.env.GMAIL_USER || '').trim();
    const pass = (process.env.GMAIL_APP_PASSWORD || '').replace(/\s+/g, '');

    if (!user || !pass) {
      console.error('[EmailService] Missing GMAIL_USER or GMAIL_APP_PASSWORD in environment.');
      return null;
    }

    if (!this.transporter || this.cachedUser !== user || this.cachedPass !== pass) {
      this.cachedUser = user;
      this.cachedPass = pass;
      this.transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user,
          pass,
        },
        pool: true,
        maxConnections: 3,
        connectionTimeout: 10000,
        socketTimeout: 15000,
      });
    }

    return this.transporter;
  }

  /**
   * 1. Send OTP Verification Email to Client
   */
  public static async sendProofOtpEmail({
    toEmail,
    otpCode,
    creativeName,
    agencyName,
  }: SendOtpParams): Promise<boolean> {
    const transporter = this.getTransporter();
    const fromName = process.env.GMAIL_FROM_NAME || agencyName || 'Opti CRM';
    const brandName = agencyName || process.env.GMAIL_FROM_NAME || 'Opti CRM';
    const fromEmail = (process.env.GMAIL_USER || '').trim() || 'optivirads@gmail.com';

    const subject = `[${otpCode}] Your Access Code for Creative Review: ${creativeName}`;

    const safeCreative = escapeHtml(creativeName);
    const safeBrand = escapeHtml(brandName);
    const safeAgency = escapeHtml(agencyName || brandName);

    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 540px; margin: 0 auto; background: #0B1424; color: #F8FAFC; border-radius: 16px; overflow: hidden; border: 1px solid rgba(255, 255, 255, 0.1);">
        <div style="padding: 24px 32px; background: linear-gradient(135deg, #1E293B, #0F172A); border-bottom: 1px solid rgba(255, 255, 255, 0.08);">
          <h2 style="margin: 0; font-size: 18px; color: #FFFFFF; font-weight: 800; letter-spacing: -0.5px;">${safeBrand}</h2>
          <p style="margin: 4px 0 0; font-size: 12px; color: #94A3B8;">Client Creative Proofing & Sign-Off Portal</p>
        </div>
        <div style="padding: 32px;">
          <p style="margin: 0 0 16px; font-size: 14px; line-height: 1.6; color: #CBD5E1;">
            You have received this verification code to access and review the creative deliverable:
          </p>
          <div style="background: rgba(220, 38, 38, 0.1); border: 1px solid rgba(220, 38, 38, 0.3); border-radius: 12px; padding: 14px 18px; margin-bottom: 24px;">
            <div style="font-size: 12px; color: #FCA5A5; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Creative Deliverable</div>
            <div style="font-size: 15px; color: #FFFFFF; font-weight: 700; margin-top: 2px;">${safeCreative}</div>
          </div>
          
          <div style="text-align: center; margin: 32px 0;">
            <div style="font-size: 12px; color: #94A3B8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Your One-Time Verification Code</div>
            <div style="display: inline-block; background: #0F172A; border: 2px solid #DC2626; border-radius: 12px; padding: 14px 36px; font-size: 32px; font-weight: 900; font-family: 'Courier New', monospace; letter-spacing: 8px; color: #FFFFFF; text-shadow: 0 0 12px rgba(220, 38, 38, 0.6);">
              ${otpCode}
            </div>
            <div style="font-size: 11px; color: #64748B; margin-top: 8px;">Valid for 10 minutes • Do not share this code</div>
          </div>

          <p style="margin: 0; font-size: 12px; line-height: 1.6; color: #94A3B8;">
            Enter this 6-digit code on the review portal to view watermarked assets, leave pinned comments, and submit your official approval.
          </p>
        </div>
        <div style="padding: 16px 32px; background: #070D18; border-top: 1px solid rgba(255, 255, 255, 0.05); font-size: 11px; color: #64748B; text-align: center;">
          Secured by ${safeAgency} • Single-session client authentication
        </div>
      </div>
    `;

    if (!transporter) {
      console.error('[Gmail Service] Gmail transporter not initialized. Ensure GMAIL_USER and GMAIL_APP_PASSWORD are set in .env');
      return false;
    }

    try {
      const sendPromise = transporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to: toEmail,
        subject,
        html: htmlContent,
      });
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Gmail SMTP connection timed out after 15s')), 15000)
      );
      await Promise.race([sendPromise, timeoutPromise]);

      console.log(`[Gmail Service] Successfully dispatched OTP email to: ${toEmail}`);
      return true;
    } catch (err: any) {
      console.error(`[Gmail Service] Error sending OTP email to ${toEmail}:`, err.message);
      return false;
    }
  }

  /**
   * 1b. Send OTP Verification Email to Client for Document Review (Proposal/Agreement/Quotation/Invoice)
   */
  public static async sendDocumentOtpEmail({
    toEmail,
    otpCode,
    documentTitle,
    documentType,
    agencyName,
  }: {
    toEmail: string;
    otpCode: string;
    documentTitle: string;
    documentType: string;
    agencyName?: string;
  }): Promise<boolean> {
    const transporter = this.getTransporter();
    const fromName = process.env.GMAIL_FROM_NAME || agencyName || 'Opti CRM';
    const brandName = agencyName || process.env.GMAIL_FROM_NAME || 'Opti CRM';
    const fromEmail = (process.env.GMAIL_USER || '').trim() || 'optivirads@gmail.com';

    const typeLabel = (documentType || 'document').charAt(0).toUpperCase() + (documentType || 'document').slice(1);
    const subject = `[${otpCode}] Your Access Code for ${typeLabel} Review: ${documentTitle}`;

    const safeTitle = escapeHtml(documentTitle);
    const safeBrand = escapeHtml(brandName);
    const safeAgency = escapeHtml(agencyName || brandName);
    const safeType = escapeHtml(typeLabel);

    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 540px; margin: 0 auto; background: #0B1424; color: #F8FAFC; border-radius: 16px; overflow: hidden; border: 1px solid rgba(255, 255, 255, 0.1);">
        <div style="padding: 24px 32px; background: linear-gradient(135deg, #1E293B, #0F172A); border-bottom: 1px solid rgba(255, 255, 255, 0.08);">
          <h2 style="margin: 0; font-size: 18px; color: #FFFFFF; font-weight: 800; letter-spacing: -0.5px;">${safeBrand}</h2>
          <p style="margin: 4px 0 0; font-size: 12px; color: #94A3B8;">Client Document Review & Approval Portal</p>
        </div>
        <div style="padding: 32px;">
          <p style="margin: 0 0 16px; font-size: 14px; line-height: 1.6; color: #CBD5E1;">
            You have received this verification code to access and review the following ${safeType.toLowerCase()}:
          </p>
          <div style="background: rgba(37, 99, 235, 0.1); border: 1px solid rgba(37, 99, 235, 0.3); border-radius: 12px; padding: 14px 18px; margin-bottom: 24px;">
            <div style="font-size: 12px; color: #93C5FD; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">${safeType}</div>
            <div style="font-size: 15px; color: #FFFFFF; font-weight: 700; margin-top: 2px;">${safeTitle}</div>
          </div>
          
          <div style="text-align: center; margin: 32px 0;">
            <div style="font-size: 12px; color: #94A3B8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Your One-Time Verification Code</div>
            <div style="display: inline-block; background: #0F172A; border: 2px solid #2563EB; border-radius: 12px; padding: 14px 36px; font-size: 32px; font-weight: 900; font-family: 'Courier New', monospace; letter-spacing: 8px; color: #FFFFFF; text-shadow: 0 0 12px rgba(37, 99, 235, 0.6);">
              ${otpCode}
            </div>
            <div style="font-size: 11px; color: #64748B; margin-top: 8px;">Valid for 10 minutes • Do not share this code</div>
          </div>

          <p style="margin: 0; font-size: 12px; line-height: 1.6; color: #94A3B8;">
            Enter this 6-digit code on the review portal to view the document, and submit your official approval or request changes.
          </p>
        </div>
        <div style="padding: 16px 32px; background: #070D18; border-top: 1px solid rgba(255, 255, 255, 0.05); font-size: 11px; color: #64748B; text-align: center;">
          Secured by ${safeAgency} • Single-session client authentication
        </div>
      </div>
    `;

    if (!transporter) {
      console.error('[Gmail Service] Gmail transporter not initialized. Ensure GMAIL_USER and GMAIL_APP_PASSWORD are set in .env');
      return false;
    }

    try {
      const sendPromise = transporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to: toEmail,
        subject,
        html: htmlContent,
      });
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Gmail SMTP connection timed out after 15s')), 15000)
      );
      await Promise.race([sendPromise, timeoutPromise]);

      console.log(`[Gmail Service] Successfully dispatched document OTP email to: ${toEmail}`);
      return true;
    } catch (err: any) {
      console.error(`[Gmail Service] Error sending document OTP email to ${toEmail}:`, err.message);
      return false;
    }
  }

  /**
   * 2. Send Direct Document Review & Approval Invitation Link to Client via Gmail
   */
  public static async sendDocumentInviteEmail({
    toEmail,
    recipientName,
    shareUrl,
    documentTitle,
    documentType,
    documentNumber,
    totalAmount,
    agencyName,
    personalMessage,
  }: SendDocumentInviteParams): Promise<boolean> {
    const transporter = this.getTransporter();
    const fromName = process.env.GMAIL_FROM_NAME || agencyName || 'Opti CRM';
    const brandName = agencyName || process.env.GMAIL_FROM_NAME || 'Opti CRM';
    const fromEmail = (process.env.GMAIL_USER || '').trim() || 'optivirads@gmail.com';

    const typeLabel = (documentType || 'document').charAt(0).toUpperCase() + (documentType || 'document').slice(1);
    const subject = `Review & Digital Signoff: ${typeLabel} ${documentNumber ? `(${documentNumber}) ` : ''}- ${documentTitle} | ${brandName}`;

    const safeBrand = escapeHtml(brandName);
    const safeRecipient = escapeHtml(recipientName || 'there');
    const safeTitle = escapeHtml(documentTitle);
    const safeNumber = escapeHtml(documentNumber || '');
    const safeAgency = escapeHtml(agencyName || brandName);
    const safePersonalMessage = escapeHtml(personalMessage);
    const safeType = escapeHtml(typeLabel);
    const safeAmount = totalAmount ? escapeHtml(typeof totalAmount === 'number' ? `₹${totalAmount.toLocaleString('en-IN')}` : String(totalAmount)) : '';

    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; background: #0B1424; color: #F8FAFC; border-radius: 16px; overflow: hidden; border: 1px solid rgba(255, 255, 255, 0.1);">
        <div style="padding: 24px 32px; background: linear-gradient(135deg, #1E293B, #0F172A); border-bottom: 1px solid rgba(255, 255, 255, 0.08);">
          <h2 style="margin: 0; font-size: 18px; color: #FFFFFF; font-weight: 800; letter-spacing: -0.5px;">${safeBrand}</h2>
          <p style="margin: 4px 0 0; font-size: 12px; color: #94A3B8;">Commercial & Engagement Operations</p>
        </div>
        <div style="padding: 32px;">
          <p style="margin: 0 0 16px; font-size: 14px; color: #CBD5E1;">
            Hello ${safeRecipient},
          </p>
          <p style="margin: 0 0 20px; font-size: 14px; line-height: 1.6; color: #CBD5E1;">
            <strong>${safeBrand}</strong> has dispatched the following official <strong>${safeType.toLowerCase()}</strong> for your review and digital signoff:
          </p>

          <div style="background: rgba(37, 99, 235, 0.08); border: 1px solid rgba(37, 99, 235, 0.25); border-radius: 12px; padding: 18px 20px; margin-bottom: 24px;">
            <div style="font-size: 11px; color: #93C5FD; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">
              ${safeType} Document ${safeNumber ? `• ${safeNumber}` : ''}
            </div>
            <div style="font-size: 16px; color: #FFFFFF; font-weight: 700;">${safeTitle}</div>
            ${safeAmount ? `<div style="margin-top: 8px; font-size: 13px; color: #E2E8F0;"><span style="color: #94A3B8;">Commercial Value:</span> <strong style="color: #34D399;">${safeAmount}</strong></div>` : ''}
          </div>

          ${
            safePersonalMessage
              ? `<div style="background: rgba(255, 255, 255, 0.04); border-left: 3px solid #2563EB; padding: 14px 16px; border-radius: 4px; margin-bottom: 24px; font-size: 13px; color: #E2E8F0; line-height: 1.5; font-style: italic;">
                  "${safePersonalMessage}"
                </div>`
              : ''
          }

          <div style="text-align: center; margin: 32px 0;">
            <a href="${shareUrl}" target="_blank" style="display: inline-block; background: #2563EB; color: #FFFFFF; font-weight: 700; font-size: 14px; text-decoration: none; padding: 14px 32px; border-radius: 12px; box-shadow: 0 8px 20px rgba(37, 99, 235, 0.35);">
              Review & Approve ${safeType} →
            </a>
            <div style="font-size: 11px; color: #94A3B8; margin-top: 10px;">
              Requires a one-time OTP sent to this email upon opening
            </div>
          </div>

          <p style="margin: 0; font-size: 12px; color: #64748B; line-height: 1.5;">
            Or copy and paste this link into your browser:<br />
            <a href="${shareUrl}" style="color: #60A5FA; word-break: break-all; font-size: 11px;">${shareUrl}</a>
          </p>
        </div>
        <div style="padding: 16px 32px; background: #070D18; border-top: 1px solid rgba(255, 255, 255, 0.05); font-size: 11px; color: #64748B; text-align: center;">
          Sent via ${safeAgency} • Secured Client Portal with OTP Signoff
        </div>
      </div>
    `;

    if (!transporter) {
      console.log(`\n================== [GMAIL SERVICE: DOCUMENT INVITE] ==================`);
      console.log(`To: ${toEmail} (${recipientName || 'Client'})`);
      console.log(`Subject: ${subject}`);
      console.log(`Share URL: ${shareUrl}`);
      console.log(`======================================================================\n`);
      return true;
    }

    try {
      const sendPromise = transporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to: toEmail,
        subject,
        html: htmlContent,
      });
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Gmail SMTP connection timed out after 15s')), 15000)
      );
      await Promise.race([sendPromise, timeoutPromise]);
      console.log(`[Gmail Service] Successfully dispatched document invite to: ${toEmail}`);
      return true;
    } catch (err: any) {
      console.error(`[Gmail Service] Error sending document invite to ${toEmail}:`, err.message);
      return false;
    }
  }

  /**
   * 3. Send Direct Review Invitation Link to Client via Gmail
   */
  public static async sendProofInviteEmail({
    toEmail,
    recipientName,
    shareUrl,
    creativeName,
    agencyName,
    personalMessage,
  }: SendInviteParams): Promise<boolean> {
    const transporter = this.getTransporter();
    const fromName = process.env.GMAIL_FROM_NAME || agencyName || 'Opti CRM';
    const brandName = agencyName || process.env.GMAIL_FROM_NAME || 'Opti CRM';
    const fromEmail = (process.env.GMAIL_USER || '').trim() || 'optivirads@gmail.com';

    const subject = `Review & Approval Request: ${creativeName} | ${brandName}`;

    const safeBrand = escapeHtml(brandName);
    const safeRecipient = escapeHtml(recipientName || 'there');
    const safeCreative = escapeHtml(creativeName);
    const safeAgency = escapeHtml(agencyName || brandName);
    const safePersonalMessage = escapeHtml(personalMessage);

    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 540px; margin: 0 auto; background: #0B1424; color: #F8FAFC; border-radius: 16px; overflow: hidden; border: 1px solid rgba(255, 255, 255, 0.1);">
        <div style="padding: 24px 32px; background: linear-gradient(135deg, #1E293B, #0F172A); border-bottom: 1px solid rgba(255, 255, 255, 0.08);">
          <h2 style="margin: 0; font-size: 18px; color: #FFFFFF; font-weight: 800;">${safeBrand}</h2>
          <p style="margin: 4px 0 0; font-size: 12px; color: #94A3B8;">Creative Delivery & Approval Portal</p>
        </div>
        <div style="padding: 32px;">
          <p style="margin: 0 0 16px; font-size: 14px; color: #CBD5E1;">
            Hello ${safeRecipient},
          </p>
          <p style="margin: 0 0 20px; font-size: 14px; line-height: 1.6; color: #CBD5E1;">
            The creative team at <strong>${safeBrand}</strong> has prepared a new deliverable ready for your review and approval:
          </p>

          <div style="background: rgba(220, 38, 38, 0.1); border: 1px solid rgba(220, 38, 38, 0.3); border-radius: 12px; padding: 16px 20px; margin-bottom: 24px;">
            <div style="font-size: 12px; color: #FCA5A5; font-weight: 600; text-transform: uppercase;">Deliverable for Review</div>
            <div style="font-size: 16px; color: #FFFFFF; font-weight: 700; margin-top: 4px;">${safeCreative}</div>
          </div>

          ${
            safePersonalMessage
              ? `<div style="background: rgba(255, 255, 255, 0.05); border-left: 3px solid #DC2626; padding: 12px 16px; border-radius: 4px; margin-bottom: 24px; font-size: 13px; color: #E2E8F0; font-style: italic;">
                  "${safePersonalMessage}"
                </div>`
              : ''
          }

          <div style="text-align: center; margin: 32px 0;">
            <a href="${shareUrl}" target="_blank" style="display: inline-block; background: #DC2626; color: #FFFFFF; font-weight: 700; font-size: 14px; text-decoration: none; padding: 14px 32px; border-radius: 12px; box-shadow: 0 8px 20px rgba(220, 38, 38, 0.35);">
              Open Review Portal →
            </a>
            <div style="font-size: 11px; color: #94A3B8; margin-top: 10px;">
              Requires a one-time OTP sent to this email upon opening
            </div>
          </div>

          <p style="margin: 0; font-size: 12px; color: #64748B; line-height: 1.5;">
            Or copy and paste this link into your browser:<br />
            <a href="${shareUrl}" style="color: #60A5FA; word-break: break-all; font-size: 11px;">${shareUrl}</a>
          </p>
        </div>
        <div style="padding: 16px 32px; background: #070D18; border-top: 1px solid rgba(255, 255, 255, 0.05); font-size: 11px; color: #64748B; text-align: center;">
          Sent via ${safeAgency} • Secured Client Portal
        </div>
      </div>
    `;

    if (!transporter) {
      console.log(`\n================== [GMAIL SERVICE: CLIENT INVITE] ==================`);
      console.log(`To: ${toEmail} (${recipientName || 'Client'})`);
      console.log(`Subject: ${subject}`);
      console.log(`Share URL: ${shareUrl}`);
      console.log(`===================================================================\n`);
      return true;
    }

    try {
      await transporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to: toEmail,
        subject,
        html: htmlContent,
      });
      console.log(`[Gmail Service] Successfully sent proof invite to: ${toEmail}`);
      return true;
    } catch (err: any) {
      console.error(`[Gmail Service] Error sending invite to ${toEmail}:`, err.message);
      return false;
    }
  }

  /**
   * 3. Send Notification to Manager and Creator via Gmail
   */
  public static async sendCreativeNotificationToTeam({
    type,
    creative,
    clientName,
    clientEmail,
    commentContent,
    feedbackNotes,
    recipients,
  }: TeamNotificationParams): Promise<void> {
    if (!recipients || recipients.length === 0) {
      return;
    }

    // Deduplicate recipients by email
    const uniqueRecipients = Array.from(
      new Map(recipients.filter(r => r.email).map(r => [r.email.toLowerCase(), r])).values()
    );

    if (uniqueRecipients.length === 0) return;

    const transporter = this.getTransporter();
    const fromName = process.env.GMAIL_FROM_NAME || 'Opti CRM';
    const fromEmail = (process.env.GMAIL_USER || '').trim() || 'optivirads@gmail.com';
    const defaultFrontend = process.env.NODE_ENV === 'production' ? 'https://optivircrm.vercel.app' : 'http://localhost:3000';
    const crmUrl = `${process.env.FRONTEND_URL || defaultFrontend}/creatives?id=${creative.id}`;

    let subject = '';
    let badgeColor = '#3B82F6';
    let badgeText = 'FEEDBACK';
    let headlineText = '';

    if (type === 'COMMENT') {
      subject = `💬 [Client Comment] ${clientName} commented on "${creative.name}"`;
      badgeColor = '#3B82F6';
      badgeText = 'NEW CLIENT COMMENT';
      headlineText = `${clientName} added feedback on creative deliverable.`;
    } else if (type === 'APPROVED') {
      subject = `✅ [APPROVED] ${clientName} officially approved "${creative.name}"`;
      badgeColor = '#10B981';
      badgeText = 'OFFICIALLY APPROVED';
      headlineText = `${clientName} has signed off and approved this creative for campaign deployment!`;
    } else if (type === 'CHANGES_REQUESTED') {
      subject = `🔄 [REVISIONS REQUESTED] Changes requested on "${creative.name}" by ${clientName}`;
      badgeColor = '#F59E0B';
      badgeText = 'REVISIONS REQUESTED';
      headlineText = `${clientName} reviewed the creative and requested revision changes.`;
    }

    const safeCreativeName = escapeHtml(creative.name);
    const safeCampaignName = escapeHtml(creative.campaign_name);
    const safeClientName = escapeHtml(clientName);
    const safeClientEmail = escapeHtml(clientEmail);
    const safeComment = escapeHtml(commentContent);
    const safeFeedback = escapeHtml(feedbackNotes);
    const safeHeadline = escapeHtml(headlineText);
    const safeFromName = escapeHtml(fromName);

    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 580px; margin: 0 auto; background: #0B1424; color: #F8FAFC; border-radius: 16px; overflow: hidden; border: 1px solid rgba(255, 255, 255, 0.1);">
        <div style="padding: 24px 32px; background: linear-gradient(135deg, #1E293B, #0F172A); border-bottom: 1px solid rgba(255, 255, 255, 0.08); display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h2 style="margin: 0; font-size: 18px; color: #FFFFFF; font-weight: 800;">${safeFromName}</h2>
            <p style="margin: 4px 0 0; font-size: 12px; color: #94A3B8;">Creator & Manager Notification</p>
          </div>
        </div>

        <div style="padding: 32px;">
          <div style="display: inline-block; background: ${badgeColor}20; color: ${badgeColor}; border: 1px solid ${badgeColor}40; border-radius: 9999px; padding: 6px 14px; font-size: 11px; font-weight: 700; letter-spacing: 0.5px; margin-bottom: 16px;">
            ${badgeText}
          </div>

          <h3 style="margin: 0 0 8px; font-size: 18px; color: #FFFFFF; font-weight: 700;">
            ${safeHeadline}
          </h3>

          <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; padding: 18px; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
              <tr>
                <td style="color: #94A3B8; padding: 6px 0; width: 35%;">Creative:</td>
                <td style="color: #FFFFFF; font-weight: 600; padding: 6px 0;">${safeCreativeName}</td>
              </tr>
              ${
                safeCampaignName
                  ? `<tr>
                      <td style="color: #94A3B8; padding: 6px 0;">Campaign:</td>
                      <td style="color: #CBD5E1; padding: 6px 0;">${safeCampaignName}</td>
                    </tr>`
                  : ''
              }
              <tr>
                <td style="color: #94A3B8; padding: 6px 0;">Client Signer:</td>
                <td style="color: #CBD5E1; padding: 6px 0;">${safeClientName} (${safeClientEmail})</td>
              </tr>
              <tr>
                <td style="color: #94A3B8; padding: 6px 0;">Timestamp:</td>
                <td style="color: #CBD5E1; padding: 6px 0;">${new Date().toLocaleString()}</td>
              </tr>
            </table>
          </div>

          ${
            safeComment || safeFeedback
              ? `<div style="margin: 20px 0;">
                  <div style="font-size: 12px; color: #94A3B8; text-transform: uppercase; font-weight: 600; margin-bottom: 8px;">
                    ${type === 'COMMENT' ? 'Client Comment Content' : 'Approval Feedback / Notes'}:
                  </div>
                  <div style="background: #060B13; border-left: 3px solid ${badgeColor}; padding: 14px 18px; border-radius: 4px; font-size: 13px; color: #F1F5F9; line-height: 1.6;">
                    "${safeComment || safeFeedback}"
                  </div>
                </div>`
              : ''
          }

          <div style="text-align: center; margin: 32px 0 16px;">
            <a href="${crmUrl}" target="_blank" style="display: inline-block; background: #DC2626; color: #FFFFFF; font-weight: 700; font-size: 14px; text-decoration: none; padding: 14px 32px; border-radius: 12px; box-shadow: 0 8px 20px rgba(220, 38, 38, 0.35);">
              Open in Agency CRM →
            </a>
          </div>
        </div>

        <div style="padding: 16px 32px; background: #070D18; border-top: 1px solid rgba(255, 255, 255, 0.05); font-size: 11px; color: #64748B;">
          Delivered to Creator & Project Manager: ${uniqueRecipients.map(r => `${escapeHtml(r.name) || r.role} (${escapeHtml(r.email)})`).join(', ')}
        </div>
      </div>
    `;

    const recipientEmails = uniqueRecipients.map(r => r.email);

    if (!transporter) {
      console.log(`\n================== [GMAIL NOTIFICATION: MANAGER & CREATOR] ==================`);
      console.log(`Event: ${type}`);
      console.log(`To (Creator & Manager): ${recipientEmails.join(', ')}`);
      console.log(`Subject: ${subject}`);
      console.log(`Client: ${clientName} (${clientEmail})`);
      console.log(`Creative: ${creative.name}`);
      if (commentContent || feedbackNotes) {
        console.log(`Feedback: "${commentContent || feedbackNotes}"`);
      }
      console.log(`CRM Link: ${crmUrl}`);
      console.log(`============================================================================\n`);
      return;
    }

    try {
      await transporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to: recipientEmails.join(', '),
        subject,
        html: htmlContent,
      });
      console.log(`[Gmail Service] Notification delivered to team (${recipientEmails.join(', ')})`);
    } catch (err: any) {
      console.error(`[Gmail Service] Error notifying team:`, err.message);
    }
  }

  /**
   * 4. Send Security Confirmation OTP (Password Change / Security Update)
   */
  public static async sendSecurityOtpEmail({
    toEmail,
    userName,
    otpCode,
    actionTitle,
  }: {
    toEmail: string;
    userName?: string;
    otpCode: string;
    actionTitle: string;
  }): Promise<boolean> {
    const transporter = this.getTransporter();
    const fromName = process.env.GMAIL_FROM_NAME || 'Opti CRM';
    const fromEmail = (process.env.GMAIL_USER || '').trim() || 'optivirads@gmail.com';

    const subject = `[${otpCode}] Security Verification Code for ${actionTitle} | ${fromName}`;

    const safeUser = escapeHtml(userName || 'User');
    const safeAction = escapeHtml(actionTitle);
    const safeFromName = escapeHtml(fromName);

    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 540px; margin: 0 auto; background: #0B1424; color: #F8FAFC; border-radius: 16px; overflow: hidden; border: 1px solid rgba(255, 255, 255, 0.1);">
        <div style="padding: 24px 32px; background: linear-gradient(135deg, #1E293B, #0F172A); border-bottom: 1px solid rgba(255, 255, 255, 0.08);">
          <h2 style="margin: 0; font-size: 18px; color: #FFFFFF; font-weight: 800;">${safeFromName} Security Center</h2>
          <p style="margin: 4px 0 0; font-size: 12px; color: #94A3B8;">Security Verification Code</p>
        </div>
        <div style="padding: 32px;">
          <p style="margin: 0 0 16px; font-size: 14px; color: #CBD5E1;">
            Hello ${safeUser},
          </p>
          <p style="margin: 0 0 20px; font-size: 14px; line-height: 1.6; color: #CBD5E1;">
            A request was initiated for <strong>${safeAction}</strong> on your Opti CRM account. Use the one-time verification code below to authorize this operation:
          </p>

          <div style="text-align: center; margin: 32px 0;">
            <div style="font-size: 12px; color: #94A3B8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Your One-Time Security Code</div>
            <div style="display: inline-block; background: #0F172A; border: 2px solid #DC2626; border-radius: 12px; padding: 14px 36px; font-size: 32px; font-weight: 900; font-family: 'Courier New', monospace; letter-spacing: 8px; color: #FFFFFF; text-shadow: 0 0 12px rgba(220, 38, 38, 0.6);">
              ${otpCode}
            </div>
            <div style="font-size: 11px; color: #64748B; margin-top: 8px;">Valid for 10 minutes • Do not share this code with anyone</div>
          </div>

          <p style="margin: 0; font-size: 12px; line-height: 1.6; color: #94A3B8;">
            If you did not initiate this request, please contact your workspace administrator immediately and ensure your account credentials are secure.
          </p>
        </div>
      </div>
    `;

    if (!transporter) {
      console.error('[Gmail Service] Gmail transporter not initialized for security OTP.');
      return false;
    }

    try {
      const sendPromise = transporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to: toEmail,
        subject,
        html: htmlContent,
      });
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Gmail SMTP connection timed out after 15s')), 15000)
      );
      await Promise.race([sendPromise, timeoutPromise]);
      console.log(`[Gmail Service] Successfully sent Security OTP to ${toEmail}`);
      return true;
    } catch (err: any) {
      console.error(`[Gmail Service] Error sending security OTP to ${toEmail}:`, err.message);
      return false;
    }
  }

  /**
   * 5. Send Proposal Accepted Email Notification to the Client Managing Team
   */
  public static async sendProposalAcceptedNotification({
    proposal,
    decision = 'ACCEPTED',
    approverName,
    approverEmail,
    feedbackNotes,
    recipients,
    agencyName,
  }: ProposalAcceptedNotificationParams): Promise<boolean> {
    const transporter = this.getTransporter();
    const fromName = agencyName || process.env.GMAIL_FROM_NAME || 'OptiVir Ads';
    const fromEmail = (process.env.GMAIL_USER || '').trim() || 'optivirads@gmail.com';
    const defaultFrontend = process.env.NODE_ENV === 'production' ? 'https://optivircrm.vercel.app' : 'http://localhost:3000';
    const frontendUrl = (process.env.FRONTEND_URL || defaultFrontend).replace(/\/$/, '');

    // Filter unique recipients and always guarantee optivirads@gmail.com is included
    const recipientMap = new Map<string, { email: string; name?: string; role?: string }>();
    recipientMap.set('optivirads@gmail.com', { email: 'optivirads@gmail.com', name: 'OptiVir Ads Owner', role: 'OWNER' });

    for (const r of recipients) {
      if (r.email && r.email.includes('@')) {
        const cleanEmail = r.email.trim().toLowerCase();
        if (!recipientMap.has(cleanEmail)) {
          recipientMap.set(cleanEmail, { email: cleanEmail, name: r.name, role: r.role });
        }
      }
    }

    const uniqueRecipients = Array.from(recipientMap.values());
    const recipientEmails = uniqueRecipients.map(r => r.email);

    const safeAgency = escapeHtml(fromName);
    const safeClient = escapeHtml(proposal.clientName);
    const safeBrand = escapeHtml(proposal.brandName || '');
    const safeTitle = escapeHtml(proposal.title);
    const safeNumber = escapeHtml(proposal.number);
    const safeApprover = escapeHtml(approverName);
    const safeApproverEmail = escapeHtml(approverEmail);
    const safeFeedback = escapeHtml(feedbackNotes);
    const amountVal = proposal.managementFee || proposal.amount;
    const safeAmount = amountVal ? escapeHtml(typeof amountVal === 'number' ? `₹${amountVal.toLocaleString('en-IN')}` : String(amountVal)) : '₹20,000';
    const crmUrl = `${frontendUrl}/?tab=proposals&id=${proposal.id}`;

    const subject = `🎉 [ACCEPTED] Proposal ${safeNumber} (${safeTitle}) accepted by ${safeClient} | ${safeAgency}`;

    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 580px; margin: 0 auto; background: #0B1424; color: #F8FAFC; border-radius: 16px; overflow: hidden; border: 1px solid rgba(255, 255, 255, 0.1);">
        <div style="padding: 24px 32px; background: linear-gradient(135deg, #064E3B, #0F172A); border-bottom: 1px solid rgba(255, 255, 255, 0.08); display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h2 style="margin: 0; font-size: 18px; color: #FFFFFF; font-weight: 800;">${safeAgency}</h2>
            <p style="margin: 4px 0 0; font-size: 12px; color: #6EE7B7;">Commercial Milestone Notification</p>
          </div>
        </div>

        <div style="padding: 32px;">
          <div style="display: inline-block; background: rgba(16, 185, 129, 0.2); color: #34D399; border: 1px solid rgba(16, 185, 129, 0.4); border-radius: 9999px; padding: 6px 14px; font-size: 11px; font-weight: 800; letter-spacing: 0.5px; margin-bottom: 16px;">
            ✓ PROPOSAL OFFICIALLY ACCEPTED
          </div>

          <h3 style="margin: 0 0 10px; font-size: 20px; color: #FFFFFF; font-weight: 800; line-height: 1.3;">
            ${safeClient}${safeBrand ? ` (${safeBrand})` : ''} has accepted the commercial proposal!
          </h3>
          <p style="margin: 0 0 20px; font-size: 13px; color: #94A3B8; line-height: 1.5;">
            The proposal document has been officially approved and accepted. The terms, commercial investment, and roadmap deliverables are now binding and locked in the CRM.
          </p>

          <div style="background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; padding: 20px; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
              <tr>
                <td style="color: #94A3B8; padding: 6px 0; width: 38%;">Proposal SOW:</td>
                <td style="color: #FFFFFF; font-weight: 700; padding: 6px 0;">${safeTitle} (${safeNumber})</td>
              </tr>
              <tr>
                <td style="color: #94A3B8; padding: 6px 0;">Client Account:</td>
                <td style="color: #CBD5E1; font-weight: 600; padding: 6px 0;">${safeClient}${safeBrand ? ` — ${safeBrand}` : ''}</td>
              </tr>
              <tr>
                <td style="color: #94A3B8; padding: 6px 0;">Monthly Management Fee:</td>
                <td style="color: #34D399; font-weight: 800; font-size: 15px; padding: 6px 0;">${safeAmount} / month</td>
              </tr>
              <tr>
                <td style="color: #94A3B8; padding: 6px 0;">Accepted By:</td>
                <td style="color: #CBD5E1; padding: 6px 0;"><strong>${safeApprover}</strong> (${safeApproverEmail})</td>
              </tr>
              <tr>
                <td style="color: #94A3B8; padding: 6px 0;">Timestamp:</td>
                <td style="color: #CBD5E1; padding: 6px 0;">${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST</td>
              </tr>
            </table>
          </div>

          ${
            safeFeedback
              ? `<div style="margin: 20px 0;">
                  <div style="font-size: 12px; color: #94A3B8; text-transform: uppercase; font-weight: 700; margin-bottom: 8px;">
                    Client Feedback / Notes:
                  </div>
                  <div style="background: #060B13; border-left: 3px solid #10B981; padding: 14px 18px; border-radius: 4px; font-size: 13px; color: #F1F5F9; line-height: 1.6;">
                    "${safeFeedback}"
                  </div>
                </div>`
              : ''
          }

          <div style="background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.25); border-radius: 10px; padding: 14px 16px; margin: 20px 0; font-size: 12px; color: #FDE68A; line-height: 1.5;">
            🔒 <strong>Governance & Locking Notice:</strong> This proposal is now locked in the Accepted state. Any further modifications to this document or alteration of its status can only be performed by the account owner (<strong>optivirads@gmail.com</strong>).
          </div>

          <div style="text-align: center; margin: 30px 0 16px;">
            <a href="${crmUrl}" target="_blank" style="display: inline-block; background: #059669; color: #FFFFFF; font-weight: 700; font-size: 14px; text-decoration: none; padding: 14px 32px; border-radius: 12px; box-shadow: 0 8px 20px rgba(5, 150, 105, 0.35);">
              Open Accepted Proposal in CRM →
            </a>
          </div>
        </div>

        <div style="padding: 16px 32px; background: #070D18; border-top: 1px solid rgba(255, 255, 255, 0.05); font-size: 11px; color: #64748B;">
          Delivered to Managing Team: ${uniqueRecipients.map(r => `${escapeHtml(r.name) || r.role} (${escapeHtml(r.email)})`).join(', ')}
        </div>
      </div>
    `;

    if (!transporter) {
      console.log(`\n================== [GMAIL NOTIFICATION: PROPOSAL ACCEPTED] ==================`);
      console.log(`To (Client Managing Team): ${recipientEmails.join(', ')}`);
      console.log(`Subject: ${subject}`);
      console.log(`Proposal: ${proposal.number} - ${proposal.title}`);
      console.log(`Client: ${proposal.clientName}`);
      console.log(`Amount: ${safeAmount}`);
      console.log(`CRM Link: ${crmUrl}`);
      console.log(`=============================================================================\n`);
      return true;
    }

    try {
      const sendPromise = transporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to: recipientEmails.join(', '),
        subject,
        html: htmlContent,
      });
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Gmail SMTP connection timed out after 15s')), 15000)
      );
      await Promise.race([sendPromise, timeoutPromise]);
      console.log(`[Gmail Service] Proposal accepted notification delivered to team (${recipientEmails.join(', ')})`);
      return true;
    } catch (err: any) {
      console.error(`[Gmail Service] Error sending proposal accepted email:`, err.message);
      return false;
    }
  }

  /**
   * Send Task Assigned Email Notification to Team Member
   */
  static async sendTaskAssignedNotification(params: TaskAssignedNotificationParams): Promise<boolean> {
    const { task, assignee, assignedBy, agencyName = 'OptiVir Ads' } = params;

    if (!assignee.email || !assignee.email.includes('@') || assignee.email.endsWith('.local')) {
      console.log(`[Task Assigned Email] Skipped: assignee ${assignee.name} has no valid external email (${assignee.email})`);
      return false;
    }

    const transporter = this.getTransporter();
    const fromName = agencyName || process.env.GMAIL_FROM_NAME || 'OptiVir Ads';
    const fromEmail = (process.env.GMAIL_USER || '').trim() || 'optivirads@gmail.com';
    const defaultFrontend = process.env.NODE_ENV === 'production' ? 'https://optivircrm.vercel.app' : 'http://localhost:3000';
    const frontendUrl = (process.env.FRONTEND_URL || defaultFrontend).replace(/\/$/, '');
    const crmUrl = `${frontendUrl}/?tab=tasks&id=${task.id}`;
    const subject = `📋 Task Assigned: ${task.title} - ${agencyName}`;

    const priorityColor =
      task.priority === 'Urgent'
        ? '#DC2626'
        : task.priority === 'High'
        ? '#EA580C'
        : task.priority === 'Medium'
        ? '#2563EB'
        : '#10B981';

    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0B1424; color: #FFFFFF; border-radius: 16px; overflow: hidden; border: 1px solid rgba(255, 255, 255, 0.1);">
        <div style="padding: 24px 32px; background: linear-gradient(135deg, #1E293B 0%, #0F172A 100%); border-bottom: 1px solid rgba(255, 255, 255, 0.08);">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <span style="font-size: 18px; font-weight: 800; letter-spacing: -0.5px; color: #FFFFFF;">
              OptiVir<span style="color: #DC2626;">Ads</span>
            </span>
            <span style="background: rgba(220, 38, 38, 0.15); color: #FCA5A5; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 20px; text-transform: uppercase;">
              Task Assignment
            </span>
          </div>
        </div>

        <div style="padding: 32px;">
          <h1 style="font-size: 20px; font-weight: 800; color: #FFFFFF; margin: 0 0 8px; line-height: 1.3;">
            You have been assigned a new deliverable
          </h1>
          <p style="font-size: 13px; color: #94A3B8; margin: 0 0 24px;">
            ${escapeHtml(assignedBy?.name || 'A team member')} has assigned you to the following deliverable in <strong>${escapeHtml(agencyName)}</strong>.
          </p>

          <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; padding: 20px; margin-bottom: 24px;">
            <div style="font-size: 16px; font-weight: 700; color: #FFFFFF; margin-bottom: 12px;">
              ${escapeHtml(task.title)}
            </div>

            <div style="display: grid; gap: 8px; font-size: 12px;">
              <div style="color: #94A3B8;">
                <strong style="color: #CBD5E1;">Priority:</strong>
                <span style="display: inline-block; background: ${priorityColor}25; color: ${priorityColor}; font-weight: 700; padding: 2px 8px; border-radius: 6px; margin-left: 6px;">
                  ${escapeHtml(task.priority || 'Medium')}
                </span>
              </div>
              ${task.due_date ? `
                <div style="color: #94A3B8;">
                  <strong style="color: #CBD5E1;">Due Date:</strong> ${escapeHtml(task.due_date)}
                </div>
              ` : ''}
              ${task.clientName ? `
                <div style="color: #94A3B8;">
                  <strong style="color: #CBD5E1;">Client:</strong> ${escapeHtml(task.clientName)}
                </div>
              ` : ''}
              ${task.projectName ? `
                <div style="color: #94A3B8;">
                  <strong style="color: #CBD5E1;">Project:</strong> ${escapeHtml(task.projectName)}
                </div>
              ` : ''}
              ${task.description ? `
                <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(255, 255, 255, 0.06); color: #94A3B8; line-height: 1.5; font-style: italic;">
                  "${escapeHtml(task.description)}"
                </div>
              ` : ''}
            </div>
          </div>

          <div style="text-align: center; margin: 28px 0 12px;">
            <a href="${crmUrl}" target="_blank" style="display: inline-block; background: #DC2626; color: #FFFFFF; font-weight: 700; font-size: 14px; text-decoration: none; padding: 13px 28px; border-radius: 12px; box-shadow: 0 6px 16px rgba(220, 38, 38, 0.35);">
              Open Task in CRM →
            </a>
          </div>
        </div>

        <div style="padding: 16px 32px; background: #070D18; border-top: 1px solid rgba(255, 255, 255, 0.05); font-size: 11px; color: #64748B;">
          Delivered to ${escapeHtml(assignee.name)} (${escapeHtml(assignee.email)})
        </div>
      </div>
    `;

    if (!transporter) {
      console.log(`\n================== [EMAIL NOTIFICATION: TASK ASSIGNED] ==================`);
      console.log(`To: ${assignee.name} <${assignee.email}>`);
      console.log(`Subject: ${subject}`);
      console.log(`Task: ${task.title}`);
      console.log(`Priority: ${task.priority || 'Medium'} | Due: ${task.due_date || 'None'}`);
      console.log(`Link: ${crmUrl}`);
      console.log(`=========================================================================\n`);
      return true;
    }

    try {
      const sendPromise = transporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to: `"${assignee.name}" <${assignee.email}>`,
        subject,
        html: htmlContent,
      });
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Gmail SMTP connection timed out after 15s')), 15000)
      );
      await Promise.race([sendPromise, timeoutPromise]);
      console.log(`[Gmail Service] Task assigned notification delivered to ${assignee.email}`);
      return true;
    } catch (err: any) {
      console.error(`[Gmail Service] Error sending task assigned email:`, err.message);
      return false;
    }
  }

  static async sendTaskScriptAddedNotification(params: {
    task: {
      id: string;
      title: string;
      deliverableType?: string | null;
      scriptContent?: string | null;
      conceptIdea?: string | null;
      priority?: string | null;
      due_date?: string | null;
      projectName?: string | null;
      clientName?: string | null;
    };
    assignee: {
      name: string;
      email: string;
    };
    addedBy?: {
      name: string;
      email?: string;
    };
    agencyName?: string;
  }): Promise<boolean> {
    const { task, assignee, addedBy, agencyName = 'OptiVir Ads' } = params;

    if (!assignee.email || !assignee.email.includes('@') || assignee.email.endsWith('.local')) {
      console.log(`[Task Script Email] Skipped: assignee ${assignee.name} has no valid external email (${assignee.email})`);
      return false;
    }

    const transporter = this.getTransporter();
    const fromName = agencyName || process.env.GMAIL_FROM_NAME || 'OptiVir Ads';
    const fromEmail = (process.env.GMAIL_USER || '').trim() || 'optivirads@gmail.com';
    const defaultFrontend = process.env.NODE_ENV === 'production' ? 'https://optivircrm.vercel.app' : 'http://localhost:3000';
    const frontendUrl = (process.env.FRONTEND_URL || defaultFrontend).replace(/\/$/, '');
    const crmUrl = `${frontendUrl}/?tab=tasks&id=${task.id}`;
    const subject = `📝 Script Added: ${task.title} - ${agencyName}`;

    const isVideo = task.deliverableType === 'VIDEO' || (task.scriptContent && task.scriptContent.toLowerCase().includes('hook'));
    const badgeLabel = isVideo ? '🎬 Video Script' : '🎨 Poster Concept';

    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0B1424; color: #FFFFFF; border-radius: 16px; overflow: hidden; border: 1px solid rgba(255, 255, 255, 0.1);">
        <div style="padding: 24px 32px; background: linear-gradient(135deg, #1E293B 0%, #0F172A 100%); border-bottom: 1px solid rgba(255, 255, 255, 0.08);">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <span style="font-size: 18px; font-weight: 800; letter-spacing: -0.5px; color: #FFFFFF;">
              OptiVir<span style="color: #DC2626;">Ads</span>
            </span>
            <span style="background: rgba(220, 38, 38, 0.15); color: #FCA5A5; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 20px; text-transform: uppercase;">
              ${badgeLabel}
            </span>
          </div>
        </div>

        <div style="padding: 32px;">
          <h1 style="font-size: 20px; font-weight: 800; color: #FFFFFF; margin: 0 0 8px; line-height: 1.3;">
            A script or concept was added to your task
          </h1>
          <p style="font-size: 13px; color: #94A3B8; margin: 0 0 20px;">
            <strong>${escapeHtml(addedBy?.name || 'A team member')}</strong> has added a creative script / concept for your assigned task in <strong>${escapeHtml(agencyName)}</strong>.
          </p>

          <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; padding: 20px; margin-bottom: 20px;">
            <div style="font-size: 16px; font-weight: 700; color: #FFFFFF; margin-bottom: 8px;">
              ${escapeHtml(task.title)}
            </div>
            ${task.clientName ? `<div style="font-size: 12px; color: #94A3B8; margin-bottom: 4px;"><strong>Client:</strong> ${escapeHtml(task.clientName)} ${task.projectName ? `• ${escapeHtml(task.projectName)}` : ''}</div>` : ''}
          </div>

          ${task.scriptContent ? `
            <div style="margin-bottom: 24px;">
              <div style="font-size: 12px; font-weight: 700; color: #CBD5E1; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">
                ${isVideo ? '🎥 Video Script & Scene Breakdown:' : '🎨 Poster Copy & Layout:'}
              </div>
              <div style="background: rgba(0, 0, 0, 0.4); border: 1px solid rgba(220, 38, 38, 0.3); border-radius: 10px; padding: 16px; font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace; font-size: 12px; color: #F1F5F9; white-space: pre-wrap; line-height: 1.6;">${escapeHtml(task.scriptContent)}</div>
            </div>
          ` : ''}

          ${task.conceptIdea ? `
            <div style="margin-bottom: 24px;">
              <div style="font-size: 12px; font-weight: 700; color: #CBD5E1; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">
                💡 Visual Concept / Storyboard Idea:
              </div>
              <div style="background: rgba(0, 0, 0, 0.3); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 10px; padding: 14px; font-size: 12px; color: #CBD5E1; white-space: pre-wrap; line-height: 1.5;">${escapeHtml(task.conceptIdea)}</div>
            </div>
          ` : ''}

          <div style="text-align: center; margin: 28px 0 12px;">
            <a href="${crmUrl}" target="_blank" style="display: inline-block; background: #DC2626; color: #FFFFFF; font-weight: 700; font-size: 14px; text-decoration: none; padding: 13px 28px; border-radius: 12px; box-shadow: 0 6px 16px rgba(220, 38, 38, 0.35);">
              Open Task &amp; Script in CRM →
            </a>
          </div>
        </div>

        <div style="padding: 16px 32px; background: #070D18; border-top: 1px solid rgba(255, 255, 255, 0.05); font-size: 11px; color: #64748B;">
          Delivered to ${escapeHtml(assignee.name)} (${escapeHtml(assignee.email)}) • Automatic Draft created in Creative Studio
        </div>
      </div>
    `;

    if (!transporter) {
      console.log(`\n================== [EMAIL NOTIFICATION: TASK SCRIPT ADDED] ==================`);
      console.log(`To: ${assignee.name} <${assignee.email}>`);
      console.log(`Subject: ${subject}`);
      console.log(`Task: ${task.title}`);
      console.log(`Script Content:\n${task.scriptContent || task.conceptIdea}`);
      console.log(`Link: ${crmUrl}`);
      console.log(`=============================================================================\n`);
      return true;
    }

    try {
      const sendPromise = transporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to: `"${assignee.name}" <${assignee.email}>`,
        subject,
        html: htmlContent,
      });
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Gmail SMTP connection timed out after 15s')), 15000)
      );
      await Promise.race([sendPromise, timeoutPromise]);
      console.log(`[Gmail Service] Task script notification delivered to ${assignee.email}`);
      return true;
    } catch (err: any) {
      console.error(`[Gmail Service] Error sending task script email:`, err.message);
      return false;
    }
  }
}

