import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { SchedulerService } from "./services/schedulerService";
import { insertDigestSchema, insertSystemLogSchema, insertSettingSchema } from "@shared/schema";

const schedulerService = new SchedulerService();

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Initialize scheduler
  const scheduleEnabledSetting = await storage.getSetting("schedule_enabled");
  if (scheduleEnabledSetting?.value === "true") {
    const intervalSetting = await storage.getSetting("schedule_interval");
    const interval = intervalSetting ? parseInt(intervalSetting.value) : 3;
    await schedulerService.startSchedule(interval);
  }

  // Dashboard stats
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const stats = await storage.getDigestStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Recent digests
  app.get("/api/digests", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const digests = await storage.getDigests(limit);
      res.json(digests);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch digests" });
    }
  });

  // Get specific digest
  app.get("/api/digests/:id", async (req, res) => {
    try {
      const digest = await storage.getDigest(req.params.id);
      if (!digest) {
        return res.status(404).json({ message: "Digest not found" });
      }
      res.json(digest);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch digest" });
    }
  });

  // System logs
  app.get("/api/logs", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const logs = await storage.getSystemLogs(limit);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch system logs" });
    }
  });

  // Email logs
  app.get("/api/email-logs", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const logs = await storage.getEmailLogs(limit);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch email logs" });
    }
  });

  // Manual digest trigger
  app.post("/api/digest/trigger", async (req, res) => {
    try {
      const result = await schedulerService.manualTrigger();
      res.json(result);
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: "Failed to trigger digest generation" 
      });
    }
  });

  // Schedule management
  app.get("/api/schedule", async (req, res) => {
    try {
      const scheduleEnabled = await storage.getSetting("schedule_enabled");
      const scheduleInterval = await storage.getSetting("schedule_interval");
      const emailRecipients = await storage.getSetting("email_recipients");

      res.json({
        enabled: scheduleEnabled?.value === "true",
        interval: parseInt(scheduleInterval?.value || "3"),
        recipients: emailRecipients ? JSON.parse(emailRecipients.value) : [],
        isActive: schedulerService.isScheduleActive()
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch schedule settings" });
    }
  });

  app.post("/api/schedule/toggle", async (req, res) => {
    try {
      const currentSetting = await storage.getSetting("schedule_enabled");
      const newValue = currentSetting?.value === "true" ? "false" : "true";
      
      await storage.setSetting("schedule_enabled", newValue);

      if (newValue === "true") {
        const intervalSetting = await storage.getSetting("schedule_interval");
        const interval = intervalSetting ? parseInt(intervalSetting.value) : 3;
        await schedulerService.startSchedule(interval);
      } else {
        schedulerService.stopSchedule();
      }

      res.json({ 
        enabled: newValue === "true",
        message: `Schedule ${newValue === "true" ? "enabled" : "disabled"}` 
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to toggle schedule" });
    }
  });

  app.post("/api/schedule/interval", async (req, res) => {
    try {
      const { interval } = req.body;
      
      if (!interval || interval < 1 || interval > 24) {
        return res.status(400).json({ message: "Invalid interval. Must be between 1 and 24 hours." });
      }

      await storage.setSetting("schedule_interval", interval.toString());

      // Restart schedule with new interval if currently enabled
      const scheduleEnabled = await storage.getSetting("schedule_enabled");
      if (scheduleEnabled?.value === "true") {
        await schedulerService.startSchedule(interval);
      }

      res.json({ 
        interval,
        message: "Schedule interval updated" 
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to update schedule interval" });
    }
  });

  // Recipients management
  app.get("/api/recipients", async (req, res) => {
    try {
      const recipientsSetting = await storage.getSetting("email_recipients");
      const recipients = recipientsSetting ? JSON.parse(recipientsSetting.value) : [];
      res.json(recipients);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recipients" });
    }
  });

  app.post("/api/recipients", async (req, res) => {
    try {
      const { recipients } = req.body;
      
      if (!Array.isArray(recipients)) {
        return res.status(400).json({ message: "Recipients must be an array" });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const invalidEmails = recipients.filter(email => !emailRegex.test(email));
      
      if (invalidEmails.length > 0) {
        return res.status(400).json({ 
          message: `Invalid email addresses: ${invalidEmails.join(", ")}` 
        });
      }

      await storage.setSetting("email_recipients", JSON.stringify(recipients));
      res.json({ 
        recipients,
        message: "Recipients updated successfully" 
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to update recipients" });
    }
  });

  // Settings
  app.get("/api/settings", async (req, res) => {
    try {
      const settings = await storage.getSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
