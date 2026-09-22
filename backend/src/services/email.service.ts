import nodemailer, { Transporter } from 'nodemailer';

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

export class EmailService {
  private static transporter: Transporter | null = null;

  private static getTransporter(): Transporter | null {
    const user = process.env.GMAIL_USER;
    const pass = process.env.GMAIL_APP_PASSWORD;

    if (!user || !pass) {
      return null;
    }

    if (!this.transporter) {
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user,
          pass,
        },
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
    const fromEmail = process.env.GMAIL_USER || 'no-reply@optivircrm.com';

    const subject = `[${otpCode}] Your Access Code for Creative Review: ${creativeName}`;

    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 540px; margin: 0 auto; background: #0B1424; color: #F8FAFC; border-radius: 16px; overflow: hidden; border: 1px solid rgba(255, 255, 255, 0.1);">
        <div style="padding: 24px 32px; background: linear-gradient(135deg, #1E293B, #0F172A); border-bottom: 1px solid rgba(255, 255, 255, 0.08);">
          <h2 style="margin: 0; font-size: 18px; color: #FFFFFF; font-weight: 800; letter-spacing: -0.5px;">${brandName}</h2>
          <p style="margin: 4px 0 0; font-size: 12px; color: #94A3B8;">Client Creative Proofing & Sign-Off Portal</p>
        </div>
        <div style="padding: 32px;">
          <p style="margin: 0 0 16px; font-size: 14px; line-height: 1.6; color: #CBD5E1;">
            You have received this verification code to access and review the creative deliverable:
          </p>
          <div style="background: rgba(220, 38, 38, 0.1); border: 1px solid rgba(220, 38, 38, 0.3); border-radius: 12px; padding: 14px 18px; margin-bottom: 24px;">
            <div style="font-size: 12px; color: #FCA5A5; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Creative Deliverable</div>
            <div style="font-size: 15px; color: #FFFFFF; font-weight: 700; margin-top: 2px;">${creativeName}</div>
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
          Secured by ${agencyName} • Single-session client authentication
        </div>
      </div>
    `;

    if (!transporter) {
      console.log(`\n================== [GMAIL SERVICE (Dev / Fallback Logger)] ==================`);
      console.log(`Action: OTP_DISPATCH`);
      console.log(`To: ${toEmail}`);
      console.log(`Subject: ${subject}`);
      console.log(`OTP Code: >>> ${otpCode} <<<`);
      console.log(`Creative: ${creativeName}`);
      console.log(`(Configure GMAIL_USER and GMAIL_APP_PASSWORD in backend/.env for live Gmail dispatch)`);
      console.log(`============================================================================\n`);
      return true;
    }

    try {
      await transporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to: toEmail,
        subject,
        html: htmlContent,
      });
      console.log(`[Gmail Service] Successfully dispatched OTP email to: ${toEmail}`);
      return true;
    } catch (err: any) {
      console.error(`[Gmail Service] Error sending OTP email to ${toEmail}:`, err.message);
      // Fallback log to console so testing is not blocked
      console.log(`[Fallback OTP for ${toEmail}]: ${otpCode}`);
      return false;
    }
  }

  /**
   * 2. Send Direct Review Invitation Link to Client via Gmail
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
    const fromEmail = process.env.GMAIL_USER || 'no-reply@optivircrm.com';

    const subject = `Review & Approval Request: ${creativeName} | ${brandName}`;

    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 540px; margin: 0 auto; background: #0B1424; color: #F8FAFC; border-radius: 16px; overflow: hidden; border: 1px solid rgba(255, 255, 255, 0.1);">
        <div style="padding: 24px 32px; background: linear-gradient(135deg, #1E293B, #0F172A); border-bottom: 1px solid rgba(255, 255, 255, 0.08);">
          <h2 style="margin: 0; font-size: 18px; color: #FFFFFF; font-weight: 800;">${brandName}</h2>
          <p style="margin: 4px 0 0; font-size: 12px; color: #94A3B8;">Creative Delivery & Approval Portal</p>
        </div>
        <div style="padding: 32px;">
          <p style="margin: 0 0 16px; font-size: 14px; color: #CBD5E1;">
            Hello ${recipientName || 'there'},
          </p>
          <p style="margin: 0 0 20px; font-size: 14px; line-height: 1.6; color: #CBD5E1;">
            The creative team at <strong>${brandName}</strong> has prepared a new deliverable ready for your review and approval:
          </p>

          <div style="background: rgba(220, 38, 38, 0.1); border: 1px solid rgba(220, 38, 38, 0.3); border-radius: 12px; padding: 16px 20px; margin-bottom: 24px;">
            <div style="font-size: 12px; color: #FCA5A5; font-weight: 600; text-transform: uppercase;">Deliverable for Review</div>
            <div style="font-size: 16px; color: #FFFFFF; font-weight: 700; margin-top: 4px;">${creativeName}</div>
          </div>

          ${
            personalMessage
              ? `<div style="background: rgba(255, 255, 255, 0.05); border-left: 3px solid #DC2626; padding: 12px 16px; border-radius: 4px; margin-bottom: 24px; font-size: 13px; color: #E2E8F0; font-style: italic;">
                  "${personalMessage}"
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
          Sent via ${agencyName} • Secured Client Portal
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
    const fromEmail = process.env.GMAIL_USER || 'no-reply@optivircrm.com';
    const crmUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/creatives?id=${creative.id}`;

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

    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 580px; margin: 0 auto; background: #0B1424; color: #F8FAFC; border-radius: 16px; overflow: hidden; border: 1px solid rgba(255, 255, 255, 0.1);">
        <div style="padding: 24px 32px; background: linear-gradient(135deg, #1E293B, #0F172A); border-bottom: 1px solid rgba(255, 255, 255, 0.08); display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h2 style="margin: 0; font-size: 18px; color: #FFFFFF; font-weight: 800;">${fromName}</h2>
            <p style="margin: 4px 0 0; font-size: 12px; color: #94A3B8;">Creator & Manager Notification</p>
          </div>
        </div>

        <div style="padding: 32px;">
          <div style="display: inline-block; background: ${badgeColor}20; color: ${badgeColor}; border: 1px solid ${badgeColor}40; border-radius: 9999px; padding: 6px 14px; font-size: 11px; font-weight: 700; letter-spacing: 0.5px; margin-bottom: 16px;">
            ${badgeText}
          </div>

          <h3 style="margin: 0 0 8px; font-size: 18px; color: #FFFFFF; font-weight: 700;">
            ${headlineText}
          </h3>

          <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; padding: 18px; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
              <tr>
                <td style="color: #94A3B8; padding: 6px 0; width: 35%;">Creative:</td>
                <td style="color: #FFFFFF; font-weight: 600; padding: 6px 0;">${creative.name}</td>
              </tr>
              ${
                creative.campaign_name
                  ? `<tr>
                      <td style="color: #94A3B8; padding: 6px 0;">Campaign:</td>
                      <td style="color: #CBD5E1; padding: 6px 0;">${creative.campaign_name}</td>
                    </tr>`
                  : ''
              }
              <tr>
                <td style="color: #94A3B8; padding: 6px 0;">Client Signer:</td>
                <td style="color: #CBD5E1; padding: 6px 0;">${clientName} (${clientEmail})</td>
              </tr>
              <tr>
                <td style="color: #94A3B8; padding: 6px 0;">Timestamp:</td>
                <td style="color: #CBD5E1; padding: 6px 0;">${new Date().toLocaleString()}</td>
              </tr>
            </table>
          </div>

          ${
            commentContent || feedbackNotes
              ? `<div style="margin: 20px 0;">
                  <div style="font-size: 12px; color: #94A3B8; text-transform: uppercase; font-weight: 600; margin-bottom: 8px;">
                    ${type === 'COMMENT' ? 'Client Comment Content' : 'Approval Feedback / Notes'}:
                  </div>
                  <div style="background: #060B13; border-left: 3px solid ${badgeColor}; padding: 14px 18px; border-radius: 4px; font-size: 13px; color: #F1F5F9; line-height: 1.6;">
                    "${commentContent || feedbackNotes}"
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
          Delivered to Creator & Project Manager: ${uniqueRecipients.map(r => `${r.name || r.role} (${r.email})`).join(', ')}
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
}
