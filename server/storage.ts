import { type Digest, type InsertDigest, type EmailLog, type InsertEmailLog, type SystemLog, type InsertSystemLog, type Setting, type InsertSetting, type DigestStats } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Digests
  createDigest(digest: InsertDigest): Promise<Digest>;
  getDigest(id: string): Promise<Digest | undefined>;
  getDigests(limit?: number): Promise<Digest[]>;
  updateDigestStatus(id: string, status: string): Promise<void>;

  // Email Logs
  createEmailLog(emailLog: InsertEmailLog): Promise<EmailLog>;
  getEmailLogs(limit?: number): Promise<EmailLog[]>;
  getEmailLogsByDigest(digestId: string): Promise<EmailLog[]>;

  // System Logs
  createSystemLog(systemLog: InsertSystemLog): Promise<SystemLog>;
  getSystemLogs(limit?: number): Promise<SystemLog[]>;

  // Settings
  setSetting(key: string, value: string): Promise<Setting>;
  getSetting(key: string): Promise<Setting | undefined>;
  getSettings(): Promise<Setting[]>;

  // Stats
  getDigestStats(): Promise<DigestStats>;
}

export class MemStorage implements IStorage {
  private digests: Map<string, Digest>;
  private emailLogs: Map<string, EmailLog>;
  private systemLogs: Map<string, SystemLog>;
  private settings: Map<string, Setting>;

  constructor() {
    this.digests = new Map();
    this.emailLogs = new Map();
    this.systemLogs = new Map();
    this.settings = new Map();

    // Initialize default settings
    this.initializeDefaultSettings();
  }

  private async initializeDefaultSettings() {
    await this.setSetting("schedule_enabled", "true");
    await this.setSetting("schedule_interval", "3");
    await this.setSetting("email_recipients", JSON.stringify(["admin@example.com"]));
    await this.setSetting("last_digest_time", new Date().toISOString());
  }

  async createDigest(insertDigest: InsertDigest): Promise<Digest> {
    const id = randomUUID();
    const digest: Digest = { 
      ...insertDigest, 
      id, 
      status: insertDigest.status || "generated",
      createdAt: new Date()
    };
    this.digests.set(id, digest);
    return digest;
  }

  async getDigest(id: string): Promise<Digest | undefined> {
    return this.digests.get(id);
  }

  async getDigests(limit = 10): Promise<Digest[]> {
    return Array.from(this.digests.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  async updateDigestStatus(id: string, status: string): Promise<void> {
    const digest = this.digests.get(id);
    if (digest) {
      digest.status = status;
      this.digests.set(id, digest);
    }
  }

  async createEmailLog(insertEmailLog: InsertEmailLog): Promise<EmailLog> {
    const id = randomUUID();
    const emailLog: EmailLog = { 
      ...insertEmailLog, 
      id, 
      error: insertEmailLog.error || null,
      createdAt: new Date()
    };
    this.emailLogs.set(id, emailLog);
    return emailLog;
  }

  async getEmailLogs(limit = 50): Promise<EmailLog[]> {
    return Array.from(this.emailLogs.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  async getEmailLogsByDigest(digestId: string): Promise<EmailLog[]> {
    return Array.from(this.emailLogs.values())
      .filter(log => log.digestId === digestId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createSystemLog(insertSystemLog: InsertSystemLog): Promise<SystemLog> {
    const id = randomUUID();
    const systemLog: SystemLog = { 
      ...insertSystemLog, 
      id, 
      details: insertSystemLog.details || null,
      createdAt: new Date()
    };
    this.systemLogs.set(id, systemLog);
    return systemLog;
  }

  async getSystemLogs(limit = 50): Promise<SystemLog[]> {
    return Array.from(this.systemLogs.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  async setSetting(key: string, value: string): Promise<Setting> {
    const id = randomUUID();
    const setting: Setting = { 
      id,
      key, 
      value, 
      updatedAt: new Date()
    };
    this.settings.set(key, setting);
    return setting;
  }

  async getSetting(key: string): Promise<Setting | undefined> {
    return this.settings.get(key);
  }

  async getSettings(): Promise<Setting[]> {
    return Array.from(this.settings.values());
  }

  async getDigestStats(): Promise<DigestStats> {
    const totalDigests = this.digests.size;
    const emailLogs = Array.from(this.emailLogs.values());
    const sentEmails = emailLogs.filter(log => log.status === "sent").length;
    const successRate = emailLogs.length > 0 ? (sentEmails / emailLogs.length) * 100 : 100;
    
    const lastDigestSetting = await this.getSetting("last_digest_time");
    const lastDigestTime = lastDigestSetting ? new Date(lastDigestSetting.value) : new Date();
    const nextDigestTime = new Date(lastDigestTime.getTime() + 3 * 60 * 60 * 1000);
    
    return {
      totalDigests,
      successRate: Math.round(successRate * 10) / 10,
      nextDigestTime: nextDigestTime.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
      systemStatus: "Healthy"
    };
  }
}

export const storage = new MemStorage();
