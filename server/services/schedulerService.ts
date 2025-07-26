import cron from "node-cron";
import { NewsService } from "./newsService";
import { AIService } from "./aiService";
import { EmailService } from "./emailService";
import { storage } from "../storage";

export class SchedulerService {
  private newsService: NewsService;
  private aiService: AIService;
  private emailService: EmailService;
  private scheduledTask: cron.ScheduledTask | null = null;

  constructor() {
    this.newsService = new NewsService();
    this.aiService = new AIService();
    this.emailService = new EmailService();
  }

  async startSchedule(intervalHours = 3): Promise<void> {
    // Stop existing schedule if running
    this.stopSchedule();

    // Create cron expression for every N hours
    const cronExpression = `0 */${intervalHours} * * *`;
    
    console.log(`Starting digest schedule: every ${intervalHours} hours`);
    
    this.scheduledTask = cron.schedule(cronExpression, async () => {
      await this.generateAndSendDigest();
    }, {
      scheduled: true,
      timezone: "Asia/Kuala_Lumpur"
    });

    await storage.createSystemLog({
      type: "info",
      message: `Digest schedule started: every ${intervalHours} hours`,
      details: { intervalHours, cronExpression }
    });
  }

  stopSchedule(): void {
    if (this.scheduledTask) {
      this.scheduledTask.stop();
      this.scheduledTask = null;
      console.log("Digest schedule stopped");
    }
  }

  async generateAndSendDigest(): Promise<void> {
    try {
      await storage.createSystemLog({
        type: "info",
        message: "Scheduled digest task started",
        details: null
      });

      // Step 1: Fetch news articles
      await storage.createSystemLog({
        type: "info",
        message: "Fetching news articles from FMT",
        details: null
      });

      const articles = await this.newsService.fetchLatestNews(10);
      
      if (articles.length === 0) {
        throw new Error("No articles fetched from FMT");
      }

      await storage.createSystemLog({
        type: "info",
        message: `News articles fetched from FMT (${articles.length} articles)`,
        details: { articleCount: articles.length }
      });

      // Step 2: Generate AI digest
      await storage.createSystemLog({
        type: "info",
        message: "Starting AI digest generation",
        details: null
      });

      const digestData = await this.aiService.generateDigest(articles);

      await storage.createSystemLog({
        type: "info",
        message: `AI digest generation completed (${digestData.wordCount} words)`,
        details: { wordCount: digestData.wordCount }
      });

      // Step 3: Save digest to storage
      const digest = await storage.createDigest({
        title: digestData.title,
        content: digestData.content,
        wordCount: digestData.wordCount,
        articles: articles,
        status: "generated"
      });

      // Step 4: Get email recipients
      const recipientsSetting = await storage.getSetting("email_recipients");
      const recipients = recipientsSetting 
        ? JSON.parse(recipientsSetting.value) 
        : ["admin@example.com"];

      // Step 5: Send emails
      const emailResults = await this.emailService.sendDigest(digest, recipients);

      // Step 6: Log email results
      let successCount = 0;
      for (let i = 0; i < recipients.length; i++) {
        const result = emailResults[i];
        const recipient = recipients[i];

        const emailLog = await storage.createEmailLog({
          digestId: digest.id,
          recipient,
          subject: `FMT News Digest: ${digest.title}`,
          status: result.success ? "sent" : "failed",
          error: result.error || null,
          sentAt: result.success ? new Date() : null
        });

        if (result.success) {
          successCount++;
        }
      }

      // Update digest status
      await storage.updateDigestStatus(
        digest.id, 
        successCount > 0 ? "sent" : "failed"
      );

      await storage.createSystemLog({
        type: "info",
        message: `Email digest sent successfully to ${successCount} recipients`,
        details: { 
          digestId: digest.id,
          totalRecipients: recipients.length,
          successCount,
          failedCount: recipients.length - successCount
        }
      });

      // Update last digest time
      await storage.setSetting("last_digest_time", new Date().toISOString());

    } catch (error) {
      console.error("Error in scheduled digest generation:", error);
      
      await storage.createSystemLog({
        type: "error",
        message: `Scheduled digest generation failed: ${(error as Error).message}`,
        details: { error: (error as Error).stack }
      });
    }
  }

  async manualTrigger(): Promise<{ success: boolean; message: string }> {
    try {
      await storage.createSystemLog({
        type: "info",
        message: "Manual digest generation triggered",
        details: null
      });

      await this.generateAndSendDigest();
      
      return {
        success: true,
        message: "Digest generated and sent successfully"
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to generate digest: ${(error as Error).message}`
      };
    }
  }

  isScheduleActive(): boolean {
    return this.scheduledTask !== null;
  }
}
