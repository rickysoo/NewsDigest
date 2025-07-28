#!/usr/bin/env node

/**
 * FMT News Digest REST API Server
 * Provides REST endpoints for digest management and generation
 * 
 * Usage: node api-server.js
 * Default port: 3000 (or PORT environment variable)
 */

import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

// Import digest functionality
import('./digest-script.mjs').then(module => {
  global.digestModule = module;
}).catch(console.error);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later' }
});
app.use('/api/', limiter);

// Strict rate limiting for digest generation
const digestLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // limit each IP to 10 digest requests per hour
  message: { error: 'Digest generation rate limit exceeded. Try again in 1 hour.' }
});

// In-memory storage for API data
let digestHistory = [];
let apiStats = {
  totalRequests: 0,
  digestsGenerated: 0,
  lastGenerated: null,
  uptime: Date.now()
};

// Helper function to run digest generation
async function generateDigest(testMode = false) {
  try {
    // Import and run digest script
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);
    
    const command = testMode ? 'node digest-script.js --test' : 'node digest-script.js';
    const result = await execAsync(command);
    
    return {
      success: true,
      output: result.stdout,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

// Helper function to read configuration
function getConfig() {
  try {
    const configPath = join(__dirname, 'digest-config.json');
    if (fs.existsSync(configPath)) {
      return JSON.parse(fs.readFileSync(configPath, 'utf8'));
    }
  } catch (error) {
    console.error('Error reading config:', error.message);
  }
  
  return {
    sources: ['fmt'],
    recipients: [process.env.RECIPIENT_EMAIL || 'user@example.com'],
    interval: 8,
    lastRun: null
  };
}

// API Routes

// Health check
app.get('/api/health', (req, res) => {
  apiStats.totalRequests++;
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: Date.now() - apiStats.uptime,
    version: '1.0.0'
  });
});

// Get API statistics
app.get('/api/stats', (req, res) => {
  apiStats.totalRequests++;
  res.json({
    ...apiStats,
    uptimeHours: Math.round((Date.now() - apiStats.uptime) / (1000 * 60 * 60) * 100) / 100
  });
});

// Get current configuration
app.get('/api/config', (req, res) => {
  apiStats.totalRequests++;
  const config = getConfig();
  
  // Remove sensitive information
  const safeConfig = {
    sources: config.sources,
    recipients: config.recipients?.map(email => 
      email.replace(/(.{2}).*(@.*)/, '$1***$2')
    ),
    interval: config.interval,
    lastRun: config.lastRun,
    scheduleNextRun: config.lastRun ? 
      new Date(new Date(config.lastRun).getTime() + config.interval * 60 * 60 * 1000).toISOString() : 
      null
  };
  
  res.json(safeConfig);
});

// Generate digest immediately (test mode)
app.post('/api/digest/generate', digestLimiter, async (req, res) => {
  apiStats.totalRequests++;
  
  try {
    console.log('API: Starting digest generation...');
    const result = await generateDigest(true);
    
    if (result.success) {
      apiStats.digestsGenerated++;
      apiStats.lastGenerated = result.timestamp;
      
      // Store in history
      digestHistory.unshift({
        id: Date.now(),
        timestamp: result.timestamp,
        status: 'success',
        source: 'api',
        output: result.output
      });
      
      // Keep only last 50 entries
      if (digestHistory.length > 50) {
        digestHistory = digestHistory.slice(0, 50);
      }
      
      res.json({
        success: true,
        message: 'Digest generated and sent successfully',
        timestamp: result.timestamp,
        id: digestHistory[0].id
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error,
        timestamp: result.timestamp
      });
    }
  } catch (error) {
    console.error('API: Digest generation failed:', error.message);
    res.status(500).json({
      success: false,
      error: 'Internal server error during digest generation',
      timestamp: new Date().toISOString()
    });
  }
});

// Get digest history
app.get('/api/digest/history', (req, res) => {
  apiStats.totalRequests++;
  
  const limit = Math.min(parseInt(req.query.limit) || 20, 100);
  const offset = parseInt(req.query.offset) || 0;
  
  const paginatedHistory = digestHistory.slice(offset, offset + limit);
  
  res.json({
    digests: paginatedHistory,
    total: digestHistory.length,
    limit,
    offset,
    hasMore: offset + limit < digestHistory.length
  });
});

// Get specific digest details
app.get('/api/digest/:id', (req, res) => {
  apiStats.totalRequests++;
  
  const digestId = parseInt(req.params.id);
  const digest = digestHistory.find(d => d.id === digestId);
  
  if (!digest) {
    return res.status(404).json({
      error: 'Digest not found',
      id: digestId
    });
  }
  
  res.json(digest);
});

// Get latest news articles (without generating digest)
app.get('/api/news/latest', async (req, res) => {
  apiStats.totalRequests++;
  
  try {
    // This would require extracting the news fetching logic from digest-script.mjs
    // For now, return a placeholder response
    res.json({
      message: 'News fetching endpoint - requires extraction of news service from digest script',
      timestamp: new Date().toISOString(),
      note: 'Use POST /api/digest/generate to get news with digest'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch latest news',
      timestamp: new Date().toISOString()
    });
  }
});

// System status endpoint
app.get('/api/system/status', (req, res) => {
  apiStats.totalRequests++;
  
  const status = {
    api: 'running',
    database: 'not connected', // Update when database is added
    emailService: process.env.EMAIL_USER ? 'configured' : 'not configured',
    openaiService: process.env.OPENAI_API_KEY ? 'configured' : 'not configured',
    lastDigest: apiStats.lastGenerated,
    nextScheduled: null, // Would need scheduler integration
    environment: process.env.NODE_ENV || 'development'
  };
  
  res.json(status);
});

// API documentation endpoint
app.get('/api/docs', (req, res) => {
  apiStats.totalRequests++;
  
  const docs = {
    title: 'FMT News Digest API',
    version: '1.0.0',
    baseUrl: `${req.protocol}://${req.get('host')}/api`,
    endpoints: {
      'GET /health': 'Health check',
      'GET /stats': 'API statistics',
      'GET /config': 'Current configuration',
      'POST /digest/generate': 'Generate digest immediately',
      'GET /digest/history': 'Get digest history (query: limit, offset)',
      'GET /digest/:id': 'Get specific digest details',
      'GET /news/latest': 'Get latest news articles',
      'GET /system/status': 'System status',
      'GET /docs': 'This documentation'
    },
    rateLimit: {
      general: '100 requests per 15 minutes',
      digest: '10 digest generations per hour'
    },
    authentication: 'None (public API)',
    cors: 'Enabled for all origins'
  };
  
  res.json(docs);
});

// Root endpoint
app.get('/api', (req, res) => {
  apiStats.totalRequests++;
  res.json({
    message: 'FMT News Digest API',
    version: '1.0.0',
    documentation: `${req.protocol}://${req.get('host')}/api/docs`,
    health: `${req.protocol}://${req.get('host')}/api/health`
  });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    error: 'API endpoint not found',
    path: req.path,
    method: req.method,
    documentation: '/api/docs'
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`
🚀 FMT News Digest API Server Started
📡 Server running on: http://0.0.0.0:${PORT}
📖 API Documentation: http://0.0.0.0:${PORT}/api/docs
💊 Health Check: http://0.0.0.0:${PORT}/api/health
🔗 Base API URL: http://0.0.0.0:${PORT}/api

Available endpoints:
- GET  /api/health
- GET  /api/stats  
- GET  /api/config
- POST /api/digest/generate
- GET  /api/digest/history
- GET  /api/digest/:id
- GET  /api/news/latest
- GET  /api/system/status
- GET  /api/docs
`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 API Server shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 API Server terminated');
  process.exit(0);
});