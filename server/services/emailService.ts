import nodemailer from "nodemailer";
import { type Digest } from "@shared/schema";

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Configure email transporter
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: false,
      auth: {
        user: process.env.SMTP_USER || process.env.EMAIL_USER || "your-email@gmail.com",
        pass: process.env.SMTP_PASS || process.env.EMAIL_PASS || "your-app-password",
      },
    });
  }

  async sendDigest(digest: Digest, recipients: string[]): Promise<{ success: boolean; error?: string }[]> {
    const results: { success: boolean; error?: string }[] = [];

    for (const recipient of recipients) {
      try {
        const emailContent = this.formatDigestEmail(digest);
        
        await this.transporter.sendMail({
          from: process.env.SMTP_USER || process.env.EMAIL_USER || "fmt-digest@example.com",
          to: recipient,
          subject: `FMT News Digest: ${digest.title}`,
          html: emailContent,
          text: this.stripHtml(emailContent),
        });

        results.push({ success: true });
      } catch (error) {
        console.error(`Error sending email to ${recipient}:`, error);
        results.push({ 
          success: false, 
          error: (error as Error).message 
        });
      }
    }

    return results;
  }

  private formatDigestEmail(digest: Digest): string {
    const currentDate = new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FMT News Digest</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; padding: 2rem; text-align: center; }
        .header h1 { margin: 0; font-size: 1.5rem; font-weight: 600; }
        .header p { margin: 0.5rem 0 0 0; opacity: 0.9; }
        .content { padding: 2rem; }
        .digest-title { font-size: 1.25rem; font-weight: 600; margin-bottom: 1rem; color: #1e293b; }
        .digest-content { font-size: 1rem; line-height: 1.7; margin-bottom: 2rem; }
        .digest-content p { margin-bottom: 1rem; }
        .footer { background-color: #f1f5f9; padding: 1.5rem; text-align: center; font-size: 0.875rem; color: #64748b; border-top: 1px solid #e2e8f0; }
        .stats { background-color: #f8fafc; padding: 1rem; border-radius: 0.5rem; margin-bottom: 1.5rem; font-size: 0.875rem; color: #64748b; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🗞️ FMT News Digest</h1>
            <p>${currentDate}</p>
        </div>
        
        <div class="content">
            <div class="stats">
                📊 ${digest.wordCount} words • Generated ${digest.createdAt.toLocaleTimeString()}
            </div>
            
            <h2 class="digest-title">${digest.title}</h2>
            
            <div class="digest-content">
                ${this.formatContentWithParagraphs(digest.content)}
            </div>
        </div>
        
        <div class="footer">
            <p>This digest was automatically generated from Free Malaysia Today news articles.</p>
            <p>Powered by AI • Delivered every 3 hours</p>
        </div>
    </div>
</body>
</html>`;
  }

  private formatContentWithParagraphs(content: string): string {
    return content
      .split(/\n\s*\n/)
      .map(paragraph => `<p>${paragraph.trim()}</p>`)
      .join("");
  }

  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, "").replace(/&[^;]+;/g, " ");
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      console.error("Email service connection test failed:", error);
      return false;
    }
  }
}
