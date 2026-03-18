import nodemailer from "nodemailer";
import type { EmailConfig } from "@/types";

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
}

export async function sendEmail(config: Partial<EmailConfig>): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const transport = getTransporter();
    const result = await transport.sendMail({
      from: config.from || process.env.SMTP_USER,
      to: config.to?.join(", "),
      subject: config.subject || "HiveBot Notification",
      html: config.body || "",
    });
    return { success: true, messageId: result.messageId };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown email error";
    return { success: false, error: message };
  }
}

export async function sendTemplateEmail(
  to: string[],
  subject: string,
  templateData: { title: string; body: string; ctaText?: string; ctaUrl?: string }
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f4f4f5; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
        .header { background: linear-gradient(135deg, #4870ea, #3352de); padding: 24px 32px; }
        .header h1 { color: white; margin: 0; font-size: 20px; }
        .header .logo { color: #ffc44a; font-weight: 700; font-size: 14px; margin-bottom: 8px; }
        .content { padding: 32px; }
        .content h2 { margin-top: 0; color: #1b2050; }
        .content p { color: #52525b; line-height: 1.6; }
        .cta { display: inline-block; background: #4870ea; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 16px; }
        .footer { padding: 16px 32px; background: #f9fafb; color: #a1a1aa; font-size: 12px; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">HIVEBOT</div>
          <h1>${subject}</h1>
        </div>
        <div class="content">
          <h2>${templateData.title}</h2>
          <div>${templateData.body}</div>
          ${templateData.ctaText ? `<a href="${templateData.ctaUrl || "#"}" class="cta">${templateData.ctaText}</a>` : ""}
        </div>
        <div class="footer">
          Sent by HiveBot &mdash; Your AI Workflow Assistant
        </div>
      </div>
    </body>
    </html>
  `;
  return sendEmail({ to, subject, body: html });
}
