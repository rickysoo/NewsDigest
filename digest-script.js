#!/usr/bin/env node

/**
 * FMT News Digest Script
 * Automatically generates and emails news digests every 3 hours starting at 12am
 * 
 * Usage: node digest-script.js
 * 
 * Environment Variables Required:
 * - OPENAI_API_KEY: Your OpenAI API key
 * - EMAIL_USER: Your email address (for sending)
 * - EMAIL_PASS: Your email password/app password
 * - RECIPIENT_EMAIL: Email address to receive digests
 * - SMTP_HOST: SMTP server (default: smtp.gmail.com)
 * - SMTP_PORT: SMTP port (default: 587)
 */

import cron from 'node-cron';
import * as cheerio from 'cheerio';
import OpenAI from 'openai';
import nodemailer from 'nodemailer';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Configuration
const config = {
  openaiApiKey: process.env.OPENAI_API_KEY,
  emailUser: process.env.EMAIL_USER,
  emailPass: process.env.SMTP_PASSWORD,
  recipientEmail: process.env.RECIPIENT_EMAIL,
  smtpHost: process.env.SMTP_HOST || 'smtp.gmail.com',
  smtpPort: parseInt(process.env.SMTP_PORT || '587'),
  maxArticles: 10,
  targetWords: 500,
  // Rate limiting configuration
  rateLimits: {
    openaiRequests: 10, // Max 10 requests per hour
    httpRequests: 50,   // Max 50 HTTP requests per hour
    emailsSent: 25      // Max 25 emails per day
  }
};

// Rate limiting tracking
const rateLimitTracker = {
  openai: { requests: 0, resetTime: Date.now() + 3600000 }, // 1 hour
  http: { requests: 0, resetTime: Date.now() + 3600000 },   // 1 hour  
  email: { requests: 0, resetTime: Date.now() + 86400000 }  // 24 hours
};

// Initialize services
const openai = new OpenAI({ apiKey: config.openaiApiKey });
const transporter = nodemailer.createTransport({
  host: config.smtpHost,
  port: config.smtpPort,
  secure: true, // SSL for port 465
  auth: {
    user: config.emailUser,
    pass: config.emailPass,
  },
});

/**
 * News scraping service
 */
class NewsService {
  constructor() {
    this.FMT_BASE_URL = "https://www.freemalaysiatoday.com";
    this.fmtLogoUrl = "https://www.freemalaysiatoday.com/wp-content/uploads/2019/07/FMT-logo-new2.png";
  }

  extractLogoUrl($) {
    // Try to find FMT logo in the page
    const logoSelectors = [
      'img[alt*="FMT"]',
      'img[src*="logo"]',
      '.logo img',
      'header img',
      '.site-logo img'
    ];
    
    for (const selector of logoSelectors) {
      const logoImg = $(selector).first();
      if (logoImg.length) {
        const src = logoImg.attr('src');
        if (src) {
          return src.startsWith('http') ? src : `${this.FMT_BASE_URL}${src}`;
        }
      }
    }
    return null;
  }

  async fetchLatestNews(limit = 10) {
    try {
      console.log(`[${this.getMalaysiaTime()}] Fetching latest news from FMT...`);
      
      const response = await fetch(this.FMT_BASE_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const html = await response.text();
      const $ = cheerio.load(html);
      const articles = [];

      // Extract FMT logo for email
      const logoUrl = this.extractLogoUrl($);
      if (logoUrl) {
        this.fmtLogoUrl = logoUrl;
      }

      // FMT news article selectors
      $("article, .news-item, .post-item").slice(0, limit).each((_, element) => {
        const $element = $(element);
        const titleElement = $element.find("h1, h2, h3, .title, .headline").first();
        const linkElement = $element.find("a").first();
        
        const title = titleElement.text().trim();
        const relativeUrl = linkElement.attr("href");
        
        if (title && relativeUrl) {
          const url = relativeUrl.startsWith("http") ? relativeUrl : `${this.FMT_BASE_URL}${relativeUrl}`;
          
          articles.push({
            title,
            url,
            content: "", // Will be filled by fetchArticleContent
            publishedAt: new Date().toISOString()
          });
        }
      });

      console.log(`[${this.getMalaysiaTime()}] Found ${articles.length} articles, fetching content...`);

      // Fetch full content for each article
      const articlesWithContent = await Promise.all(
        articles.map(async (article) => {
          try {
            const content = await this.fetchArticleContent(article.url);
            return { ...article, content };
          } catch (error) {
            console.error(`Error fetching content for ${article.url}:`, error.message);
            return { ...article, content: article.title }; // Fallback to title
          }
        })
      );

      const validArticles = articlesWithContent.filter(article => article.title.length > 10);
      
      // Prioritize Malaysian domestic news
      const malaysianKeywords = [
        'malaysia', 'malaysian', 'kuala lumpur', 'kl', 'putrajaya', 'selangor', 'johor', 'penang', 'sabah', 'sarawak',
        'prime minister', 'pm', 'anwar', 'mahathir', 'najib', 'dap', 'umno', 'pas', 'pkr', 'parliament', 'dewan rakyat',
        'ringgit', 'bursa', 'klse', 'bank negara', 'bnm', 'gst', 'sst', 'budget', 'felda', 'petronas', 'proton',
        'genting', 'pahang', 'kedah', 'perlis', 'terengganu', 'kelantan', 'melaka', 'negeri sembilan', 'perak',
        'labuan', 'mca', 'mic', 'gerakan', 'bersatu', 'warisan', 'gps', 'bn', 'ph', 'pn'
      ];
      
      const prioritizedArticles = validArticles.sort((a, b) => {
        const aScore = this.calculateMalaysianRelevanceScore(a, malaysianKeywords);
        const bScore = this.calculateMalaysianRelevanceScore(b, malaysianKeywords);
        return bScore - aScore; // Higher score first
      });
      
      console.log(`[${this.getMalaysiaTime()}] Successfully processed ${prioritizedArticles.length} articles (prioritized Malaysian news)`);
      
      return prioritizedArticles;
    } catch (error) {
      console.error(`[${this.getMalaysiaTime()}] Error fetching FMT news:`, error.message);
      throw new Error("Failed to fetch news articles from FMT");
    }
  }

  async fetchArticleContent(url) {
    try {
      // Check rate limits
      if (!this.checkRateLimit('http')) {
        throw new Error('HTTP request rate limit exceeded');
      }

      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        timeout: 10000 // 10 second timeout
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const html = await response.text();
      const $ = cheerio.load(html);

      // Remove unwanted elements
      $("script, style, nav, header, footer, .advertisement, .ads, .social-share").remove();

      // Extract main content
      const contentSelectors = [
        ".entry-content",
        ".post-content",
        ".article-content", 
        ".content",
        "main article",
        ".story-body"
      ];

      let content = "";
      for (const selector of contentSelectors) {
        const element = $(selector);
        if (element.length > 0) {
          content = element.text().trim();
          break;
        }
      }

      // If no content found, try paragraph tags
      if (!content) {
        content = $("p").map((_, el) => $(el).text().trim()).get().join(" ");
      }

      // Sanitize content to prevent XSS and injection attacks
      return this.sanitizeContent(content.slice(0, 2000));
    } catch (error) {
      // Secure error logging - don't log URLs or sensitive info
      console.error(`Error fetching article content: ${this.sanitizeErrorMessage(error.message)}`);
      return "";
    }
  }

  checkRateLimit(type) {
    const tracker = rateLimitTracker[type];
    const now = Date.now();
    
    // Reset counter if time window has passed
    if (now > tracker.resetTime) {
      tracker.requests = 0;
      tracker.resetTime = now + (type === 'email' ? 86400000 : 3600000);
    }
    
    // Check if under limit
    const limit = config.rateLimits[type + (type === 'email' ? 'Sent' : 'Requests')];
    if (tracker.requests >= limit) {
      return false;
    }
    
    tracker.requests++;
    return true;
  }

  sanitizeErrorMessage(message) {
    if (!message) return 'Unknown error';
    
    // Remove potentially sensitive information from error messages
    return message
      .replace(/https?:\/\/[^\s]+/g, '[URL]')
      .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[EMAIL]')
      .replace(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, '[IP]')
      .replace(/api[_-]?key[s]?[=:]\s*[^\s]+/gi, 'api_key=[REDACTED]')
      .slice(0, 200); // Limit length
  }

  calculateMalaysianRelevanceScore(article, keywords) {
    const text = (article.title + " " + article.content).toLowerCase();
    let score = 0;
    
    keywords.forEach(keyword => {
      const occurrences = (text.match(new RegExp(keyword.toLowerCase(), 'g')) || []).length;
      score += occurrences;
    });
    
    // Boost score for articles with Malaysian locations/politics
    if (text.includes('malaysia') || text.includes('malaysian')) {
      score += 10;
    }
    
    return score;
  }

  sanitizeContent(content) {
    if (!content || typeof content !== 'string') return '';
    
    return content
      // Remove any HTML tags
      .replace(/<[^>]*>/g, '')
      // Remove script content
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      // Remove style content
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      // Remove potentially dangerous characters
      .replace(/[<>&"']/g, (char) => {
        const entities = { '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#x27;' };
        return entities[char];
      })
      // Remove control characters
      .replace(/[\x00-\x1F\x7F]/g, '')
      // Limit line length and normalize whitespace
      .replace(/\s+/g, ' ')
      .trim();
  }

  getMalaysiaTime() {
    return new Date().toLocaleString("en-MY", {
      timeZone: "Asia/Kuala_Lumpur",
      year: "numeric",
      month: "2-digit", 
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false
    });
  }
}

/**
 * AI service for generating digests
 */
class AIService {
  async generateDigest(articles) {
    try {
      // Check rate limits for OpenAI API
      if (!this.checkRateLimit('openai')) {
        throw new Error('OpenAI API rate limit exceeded');
      }

      console.log(`[${this.getMalaysiaTime()}] Generating AI digest from ${articles.length} articles...`);
      
      const articlesText = articles
        .map((article, index) => `${index + 1}. ${article.title}\n${article.content}\n`)
        .join("\n");

      const prompt = `You are a professional news editor creating a comprehensive daily digest specifically focused on Malaysian news and events for Malaysian readers. 

Please analyze the following ${articles.length} news articles from Free Malaysia Today and create a cohesive ${config.targetWords}-word digest that:

1. PRIORITIZES Malaysian domestic news, politics, economics, and social issues
2. Provides a concise, engaging title (under 50 characters for email subjects)
3. Focuses heavily on news that directly impacts Malaysia and Malaysians
4. Groups related Malaysian stories into coherent sections
5. Only briefly mentions international news if it has direct Malaysian relevance
6. Uses clear, engaging language suitable for Malaysian readers
7. Maintains an objective, journalistic tone
8. Format content as HTML paragraphs and sections

Articles to summarize:
${articlesText}

Please respond with JSON in this exact format:
{
  "title": "Brief compelling title focusing on Malaysian news (under 50 chars)",
  "content": "Your ${config.targetWords}-word digest content formatted as HTML with <h3> for sections and <p> for paragraphs, prioritizing Malaysian domestic news"
}`;

      // Using GPT-4o-mini for cost efficiency as requested by user
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are an expert news editor specializing in creating engaging, accurate news digests. Always respond with valid JSON."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 1000,
        temperature: 0.7,
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      
      if (!result.title || !result.content) {
        throw new Error("Invalid response format from OpenAI");
      }

      const wordCount = result.content.split(/\s+/).length;
      console.log(`[${this.getMalaysiaTime()}] AI digest generated successfully (${wordCount} words)`);

      return {
        title: result.title,
        content: result.content,
        wordCount
      };
    } catch (error) {
      console.error(`[${this.getMalaysiaTime()}] Error generating AI digest:`, this.sanitizeErrorMessage(error.message));
      throw new Error("Failed to generate AI digest: " + this.sanitizeErrorMessage(error.message));
    }
  }

  checkRateLimit(type) {
    const tracker = rateLimitTracker[type];
    const now = Date.now();
    
    // Reset counter if time window has passed
    if (now > tracker.resetTime) {
      tracker.requests = 0;
      tracker.resetTime = now + (type === 'email' ? 86400000 : 3600000);
    }
    
    // Check if under limit
    const limit = config.rateLimits[type + (type === 'email' ? 'Sent' : 'Requests')];
    if (tracker.requests >= limit) {
      return false;
    }
    
    tracker.requests++;
    return true;
  }

  sanitizeErrorMessage(message) {
    if (!message) return 'Unknown error';
    
    // Remove potentially sensitive information from error messages
    return message
      .replace(/https?:\/\/[^\s]+/g, '[URL]')
      .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[EMAIL]')
      .replace(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, '[IP]')
      .replace(/api[_-]?key[s]?[=:]\s*[^\s]+/gi, 'api_key=[REDACTED]')
      .slice(0, 200); // Limit length
  }

  getMalaysiaTime() {
    return new Date().toLocaleString("en-MY", {
      timeZone: "Asia/Kuala_Lumpur",
      year: "numeric",
      month: "2-digit", 
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false
    });
  }
}

/**
 * Email service for sending digests
 */
class EmailService {
  async sendDigest(digest, recipientEmail) {
    try {
      // Check rate limits for email sending
      if (!this.checkRateLimit('email')) {
        throw new Error('Email sending rate limit exceeded');
      }

      console.log(`[${this.getMalaysiaTime()}] Sending digest email to ${this.sanitizeEmailForLogging(recipientEmail)}...`);
      
      const emailContent = this.formatDigestEmail(digest);
      
      await transporter.sendMail({
        from: config.emailUser,
        to: recipientEmail,
        subject: `FMT News Digest: ${digest.title}`,
        html: emailContent,
        text: this.stripHtml(emailContent),
      });

      console.log(`[${this.getMalaysiaTime()}] Email sent successfully to ${this.sanitizeEmailForLogging(recipientEmail)}`);
      return { success: true };
    } catch (error) {
      console.error(`[${this.getMalaysiaTime()}] Error sending email:`, this.sanitizeErrorMessage(error.message));
      return { success: false, error: this.sanitizeErrorMessage(error.message) };
    }
  }

  sanitizeEmailForLogging(email) {
    if (!email) return '[NO_EMAIL]';
    const parts = email.split('@');
    if (parts.length !== 2) return '[INVALID_EMAIL]';
    return `${parts[0].slice(0, 2)}***@${parts[1]}`;
  }

  checkRateLimit(type) {
    const tracker = rateLimitTracker[type];
    const now = Date.now();
    
    // Reset counter if time window has passed
    if (now > tracker.resetTime) {
      tracker.requests = 0;
      tracker.resetTime = now + (type === 'email' ? 86400000 : 3600000);
    }
    
    // Check if under limit
    const limit = config.rateLimits[type + (type === 'email' ? 'Sent' : 'Requests')];
    if (tracker.requests >= limit) {
      return false;
    }
    
    tracker.requests++;
    return true;
  }

  sanitizeErrorMessage(message) {
    if (!message) return 'Unknown error';
    
    // Remove potentially sensitive information from error messages
    return message
      .replace(/https?:\/\/[^\s]+/g, '[URL]')
      .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[EMAIL]')
      .replace(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, '[IP]')
      .replace(/api[_-]?key[s]?[=:]\s*[^\s]+/gi, 'api_key=[REDACTED]')
      .slice(0, 200); // Limit length
  }

  getMalaysiaTime() {
    return new Date().toLocaleString("en-MY", {
      timeZone: "Asia/Kuala_Lumpur",
      year: "numeric",
      month: "2-digit", 
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false
    });
  }

  formatDigestEmail(digest) {
    // Get current time in Malaysia timezone
    const now = new Date();
    const currentDate = now.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "Asia/Kuala_Lumpur"
    });
    const generatedTime = now.toLocaleTimeString("en-US", {
      timeZone: "Asia/Kuala_Lumpur",
      hour12: true,
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit"
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
        .content { padding: 2rem; }
        .digest-title { font-size: 1.25rem; font-weight: 600; margin-bottom: 1rem; color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 0.5rem; }
        .digest-content { font-size: 1rem; line-height: 1.7; margin-bottom: 2rem; }
        .digest-content p { margin-bottom: 1rem; }
        .footer { background-color: #f1f5f9; padding: 1.5rem; text-align: center; font-size: 0.875rem; color: #64748b; border-top: 1px solid #e2e8f0; }
        .stats { background-color: #f8fafc; padding: 1rem; border-radius: 0.5rem; margin-bottom: 1.5rem; font-size: 0.875rem; color: #64748b; text-align: center; }
        .date-header { font-size: 0.875rem; color: #64748b; margin-bottom: 1rem; text-align: center; }
    </style>
</head>
<body>
    <div class="container">        
        <div class="content">
            <div class="header-section" style="text-align: center; margin-bottom: 2rem; padding-bottom: 1rem; border-bottom: 2px solid #e2e8f0;">
                <img src="${global.newsService ? global.newsService.fmtLogoUrl : 'https://www.freemalaysiatoday.com/wp-content/uploads/2019/07/FMT-logo-new2.png'}" alt="Free Malaysia Today" style="max-height: 60px; margin-bottom: 1rem;" />
                <div class="date-header">${currentDate} • ${generatedTime} MYT</div>
            </div>
            
            <h2 class="digest-title">${digest.title}</h2>
            
            <div class="digest-content">
                ${digest.content}
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



  stripHtml(html) {
    return html.replace(/<[^>]*>/g, "").replace(/&[^;]+;/g, " ");
  }

  async testConnection() {
    try {
      await transporter.verify();
      return true;
    } catch (error) {
      console.error(`[${getMalaysiaTime()}] Email connection test failed:`, error.message);
      return false;
    }
  }
}

/**
 * Helper function to get Malaysia time
 */
function getMalaysiaTime() {
  return new Date().toLocaleString("en-MY", {
    timeZone: "Asia/Kuala_Lumpur",
    year: "numeric",
    month: "2-digit", 
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  });
}

/**
 * Main digest generation function
 */
async function generateAndSendDigest() {
  const startTime = new Date();
  console.log(`\n[${getMalaysiaTime()}] ==================== DIGEST GENERATION STARTED ====================`);
  
  try {
    // Validate configuration
    if (!config.openaiApiKey) {
      throw new Error("OPENAI_API_KEY environment variable is required");
    }
    if (!config.emailUser || !config.emailPass) {
      throw new Error("EMAIL_USER and EMAIL_PASS environment variables are required");
    }
    if (!config.recipientEmail) {
      throw new Error("RECIPIENT_EMAIL environment variable is required");
    }

    // Initialize services
    global.newsService = new NewsService();
    const aiService = new AIService();
    const emailService = new EmailService();

    // Test email connection
    const emailConnected = await emailService.testConnection();
    if (!emailConnected) {
      throw new Error("Email service connection failed");
    }

    // Step 1: Fetch news articles
    const articles = await global.newsService.fetchLatestNews(config.maxArticles);
    
    if (articles.length === 0) {
      throw new Error("No articles fetched from FMT");
    }

    // Step 2: Generate AI digest
    const digestData = await aiService.generateDigest(articles);

    // Step 3: Send email
    const emailResult = await emailService.sendDigest(digestData, config.recipientEmail);

    if (emailResult.success) {
      const endTime = new Date();
      const duration = Math.round((endTime - startTime) / 1000);
      console.log(`[${getMalaysiaTime()}] ==================== DIGEST GENERATION COMPLETED (${duration}s) ====================\n`);
    } else {
      throw new Error(`Email delivery failed: ${emailResult.error}`);
    }

  } catch (error) {
    console.error(`[${getMalaysiaTime()}] ==================== DIGEST GENERATION FAILED ====================`);
    console.error(`[${getMalaysiaTime()}] Error: ${error.message}`);
    console.error(`[${getMalaysiaTime()}] ================================================================\n`);
  }
}

/**
 * Main application entry point
 */
async function main() {
  console.log('FMT News Digest Script Starting...');
  console.log('Configuration:');
  console.log(`- OpenAI API Key: ${config.openaiApiKey ? '✓ Set' : '✗ Missing'}`);
  console.log(`- Email User: ${config.emailUser || '✗ Missing'}`);
  console.log(`- Email Pass: ${config.emailPass ? '✓ Set' : '✗ Missing'}`);
  console.log(`- Recipient: ${config.recipientEmail || '✗ Missing'}`);
  console.log(`- SMTP: ${config.smtpHost}:${config.smtpPort}`);
  
  // Validate required environment variables
  const requiredVars = ['OPENAI_API_KEY'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  // Check email configuration
  if (!config.emailPass) {
    missingVars.push('SMTP_PASSWORD');
  }
  if (!config.emailUser) {
    missingVars.push('EMAIL_USER');
  }
  if (!config.recipientEmail) {
    missingVars.push('RECIPIENT_EMAIL');
  }
  
  if (missingVars.length > 0) {
    console.error('\n❌ Missing required environment variables:');
    missingVars.forEach(varName => {
      console.error(`   - ${varName}`);
    });
    console.error('\nPlease set these variables and restart the script.');
    process.exit(1);
  }

  console.log('\n✅ Configuration valid. Setting up scheduler...');

  // Schedule to run every 3 hours starting at midnight
  // Cron expression: "0 */3 * * *" means at minute 0 of every 3rd hour
  const cronExpression = '0 */3 * * *';
  
  console.log(`📅 Scheduling digest generation: ${cronExpression} (every 3 hours starting at midnight)`);
  console.log('🔄 Next runs will be at: 12:00 AM, 3:00 AM, 6:00 AM, 9:00 AM, 12:00 PM, 3:00 PM, 6:00 PM, 9:00 PM');
  
  // Schedule the job
  cron.schedule(cronExpression, generateAndSendDigest, {
    scheduled: true,
    timezone: "Asia/Kuala_Lumpur"
  });

  console.log('✅ Scheduler started successfully!');
  console.log('💡 To run a test digest immediately, press Ctrl+C and run: node digest-script.js --test');
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n👋 Shutting down digest script...');
    process.exit(0);
  });

  // Keep the script running
  console.log('🔄 Script is running... Press Ctrl+C to stop.');
}

// Handle command line arguments
if (process.argv.includes('--test')) {
  console.log('🧪 Running test digest generation...');
  generateAndSendDigest().then(() => {
    console.log('✅ Test completed. Exiting...');
    process.exit(0);
  }).catch((error) => {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  });
} else {
  main().catch((error) => {
    console.error('❌ Failed to start:', error.message);
    process.exit(1);
  });
}