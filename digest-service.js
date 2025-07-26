#!/usr/bin/env node

/**
 * FMT News Digest Service
 * A reliable service wrapper for the digest script
 */

import { spawn } from 'child_process';
import { existsSync, writeFileSync, readFileSync, unlinkSync } from 'fs';

const SERVICE_NAME = 'FMT News Digest';
const SCRIPT_PATH = './digest-script.js';
const PID_FILE = './digest.pid';
const LOG_FILE = './digest-service.log';

function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  console.log(logMessage.trim());
  
  try {
    writeFileSync(LOG_FILE, logMessage, { flag: 'a' });
  } catch (error) {
    console.error('Failed to write to log file:', error.message);
  }
}

function start() {
  // Check if already running
  if (existsSync(PID_FILE)) {
    console.log('❌ Service appears to be already running (PID file exists)');
    console.log('   Run: node digest-service.js stop');
    process.exit(1);
  }

  log(`Starting ${SERVICE_NAME}...`);

  // Validate required environment variables
  const requiredEnvVars = ['EMAIL_USER', 'RECIPIENT_EMAIL', 'SMTP_PASSWORD', 'OPENAI_API_KEY'];
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.log('❌ Missing required environment variables:');
    missingVars.forEach(varName => console.log(`   - ${varName}`));
    console.log('\nPlease set these environment variables before starting the service.');
    console.log('See README.md for configuration instructions.');
    process.exit(1);
  }

  // Set optional environment variables with secure defaults
  process.env.SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
  process.env.SMTP_PORT = process.env.SMTP_PORT || '587';

  // Spawn the digest script
  const child = spawn('node', [SCRIPT_PATH], {
    detached: true,
    stdio: ['ignore', 'pipe', 'pipe']
  });

  // Write PID file
  writeFileSync(PID_FILE, child.pid.toString());

  // Handle output
  child.stdout.on('data', (data) => {
    log(`STDOUT: ${data.toString().trim()}`);
  });

  child.stderr.on('data', (data) => {
    log(`STDERR: ${data.toString().trim()}`);
  });

  child.on('close', (code) => {
    log(`Service exited with code ${code}`);
    // Clean up PID file
    try {
      if (existsSync(PID_FILE)) {
        require('fs').unlinkSync(PID_FILE);
      }
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  child.on('error', (error) => {
    log(`Service error: ${error.message}`);
  });

  // Detach the child process
  child.unref();

  setTimeout(() => {
    if (existsSync(PID_FILE)) {
      console.log('✅ Service started successfully');
      console.log(`📧 Sending to: ${process.env.RECIPIENT_EMAIL || '[EMAIL_USER]'}`);
      console.log(`📅 Schedule: Every 3 hours (12am, 3am, 6am, 9am, 12pm, 3pm, 6pm, 9pm)`);
      console.log(`📝 Logs: ${LOG_FILE}`);
      console.log(`🛑 To stop: node digest-service.js stop`);
      log(`${SERVICE_NAME} started with PID ${child.pid}`);
    } else {
      console.log('❌ Service failed to start');
      console.log(`📝 Check ${LOG_FILE} for details`);
    }
  }, 2000);
}

function stop() {
  if (!existsSync(PID_FILE)) {
    console.log('❌ Service is not running (no PID file found)');
    process.exit(1);
  }

  try {
    const pid = parseInt(readFileSync(PID_FILE, 'utf8'));
    process.kill(pid, 'SIGTERM');
    unlinkSync(PID_FILE);
    log(`${SERVICE_NAME} stopped (PID ${pid})`);
    console.log('✅ Service stopped successfully');
  } catch (error) {
    console.log('❌ Failed to stop service:', error.message);
    // Clean up PID file anyway
    try {
      unlinkSync(PID_FILE);
    } catch (cleanupError) {
      // Ignore cleanup errors
    }
  }
}

function status() {
  if (existsSync(PID_FILE)) {
    const pid = parseInt(readFileSync(PID_FILE, 'utf8'));
    try {
      process.kill(pid, 0); // Check if process exists
      console.log(`✅ Service is running (PID: ${pid})`);
      console.log(`📧 Recipient: ${process.env.RECIPIENT_EMAIL || '[EMAIL_USER]'}`);
      console.log(`📅 Next digest times: 12am, 3am, 6am, 9am, 12pm, 3pm, 6pm, 9pm`);
    } catch (error) {
      console.log('❌ Service is not running (stale PID file)');
      // Clean up stale PID file
      unlinkSync(PID_FILE);
    }
  } else {
    console.log('❌ Service is not running');
  }
}

function test() {
  console.log('🧪 Running test digest...');
  
  // Validate required environment variables for test
  const requiredEnvVars = ['EMAIL_USER', 'RECIPIENT_EMAIL', 'SMTP_PASSWORD', 'OPENAI_API_KEY'];
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.log('❌ Missing required environment variables for test:');
    missingVars.forEach(varName => console.log(`   - ${varName}`));
    console.log('\nPlease set these environment variables before running the test.');
    process.exit(1);
  }

  // Set optional environment variables with secure defaults
  process.env.SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
  process.env.SMTP_PORT = process.env.SMTP_PORT || '587';

  const child = spawn('node', [SCRIPT_PATH, '--test'], {
    stdio: 'inherit'
  });

  child.on('close', (code) => {
    if (code === 0) {
      console.log('✅ Test completed successfully');
    } else {
      console.log(`❌ Test failed with code ${code}`);
    }
  });
}

// Main command handler
const command = process.argv[2];

switch (command) {
  case 'start':
    start();
    break;
  case 'stop':
    stop();
    break;
  case 'status':
    status();
    break;
  case 'restart':
    stop();
    setTimeout(start, 1000);
    break;
  case 'test':
    test();
    break;
  default:
    console.log('FMT News Digest Service Manager');
    console.log('');
    console.log('Usage:');
    console.log('  node digest-service.js start   - Start the service');
    console.log('  node digest-service.js stop    - Stop the service');
    console.log('  node digest-service.js status  - Check service status');
    console.log('  node digest-service.js restart - Restart the service');
    console.log('  node digest-service.js test    - Run a test digest');
    console.log('');
    console.log('The service will automatically generate and email news digests');
    console.log('every 3 hours starting at midnight.');
    break;
}