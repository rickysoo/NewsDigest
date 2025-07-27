#!/usr/bin/env node

/**
 * FMT News Digest Scheduler Daemon
 * A robust wrapper that keeps the digest scheduler running
 */

import { spawn } from 'child_process';
import { writeFileSync, readFileSync, existsSync, unlinkSync } from 'fs';

const SCRIPT_PATH = './digest-script.js';
const PID_FILE = './scheduler-daemon.pid';
const LOG_FILE = './scheduler-daemon.log';

let child = null;
let restartCount = 0;
const MAX_RESTARTS = 5;
const RESTART_DELAY = 5000; // 5 seconds

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

function validateEnvironment() {
  const required = ['OPENAI_API_KEY', 'SMTP_PASSWORD', 'EMAIL_USER', 'RECIPIENT_EMAIL'];
  const missing = required.filter(name => !process.env[name]);
  
  if (missing.length > 0) {
    log(`Missing environment variables: ${missing.join(', ')}`);
    return false;
  }
  return true;
}

function startScheduler() {
  if (!validateEnvironment()) {
    process.exit(1);
  }

  log('Starting digest scheduler...');
  
  child = spawn('node', [SCRIPT_PATH], {
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env }
  });

  child.stdout.on('data', (data) => {
    log(`SCHEDULER: ${data.toString().trim()}`);
  });

  child.stderr.on('data', (data) => {
    log(`SCHEDULER ERROR: ${data.toString().trim()}`);
  });

  child.on('exit', (code, signal) => {
    log(`Scheduler exited with code ${code}, signal ${signal}`);
    
    if (restartCount < MAX_RESTARTS) {
      restartCount++;
      log(`Restarting scheduler (attempt ${restartCount}/${MAX_RESTARTS}) in ${RESTART_DELAY/1000} seconds...`);
      
      setTimeout(() => {
        startScheduler();
      }, RESTART_DELAY);
    } else {
      log('Maximum restart attempts reached. Daemon stopping.');
      cleanup();
      process.exit(1);
    }
  });

  log(`Scheduler started with PID ${child.pid}`);
  
  // Reset restart counter on successful run
  setTimeout(() => {
    if (child && !child.killed) {
      restartCount = 0;
      log('Scheduler running successfully, reset restart counter');
    }
  }, 30000); // 30 seconds
}

function cleanup() {
  log('Cleaning up...');
  
  if (child && !child.killed) {
    child.kill('SIGTERM');
  }
  
  try {
    if (existsSync(PID_FILE)) {
      unlinkSync(PID_FILE);
    }
  } catch (error) {
    log(`Error removing PID file: ${error.message}`);
  }
}

function start() {
  // Check if already running
  if (existsSync(PID_FILE)) {
    try {
      const pid = parseInt(readFileSync(PID_FILE, 'utf8'));
      // Check if process exists
      process.kill(pid, 0);
      console.log('Scheduler daemon is already running');
      process.exit(0);
    } catch (error) {
      // PID file exists but process is dead, remove it
      unlinkSync(PID_FILE);
    }
  }

  // Write PID file
  writeFileSync(PID_FILE, process.pid.toString());
  
  log('FMT News Digest Scheduler Daemon starting...');
  log(`Daemon PID: ${process.pid}`);
  
  // Handle shutdown signals
  process.on('SIGINT', () => {
    log('Received SIGINT, shutting down...');
    cleanup();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    log('Received SIGTERM, shutting down...');
    cleanup();
    process.exit(0);
  });

  process.on('exit', () => {
    cleanup();
  });

  startScheduler();
}

// Command line handling
const command = process.argv[2];

switch (command) {
  case 'start':
    start();
    break;
    
  case 'stop':
    if (existsSync(PID_FILE)) {
      try {
        const pid = parseInt(readFileSync(PID_FILE, 'utf8'));
        process.kill(pid, 'SIGTERM');
        console.log('Scheduler daemon stopped');
      } catch (error) {
        console.log('Scheduler daemon was not running');
        unlinkSync(PID_FILE);
      }
    } else {
      console.log('Scheduler daemon is not running');
    }
    break;
    
  case 'status':
    if (existsSync(PID_FILE)) {
      try {
        const pid = parseInt(readFileSync(PID_FILE, 'utf8'));
        process.kill(pid, 0);
        console.log(`Scheduler daemon is running (PID: ${pid})`);
        
        // Show recent logs
        if (existsSync(LOG_FILE)) {
          console.log('\nRecent logs:');
          const logs = readFileSync(LOG_FILE, 'utf8').split('\n').slice(-10);
          logs.filter(line => line.trim()).forEach(line => console.log(line));
        }
      } catch (error) {
        console.log('Scheduler daemon is not running (stale PID file)');
        unlinkSync(PID_FILE);
      }
    } else {
      console.log('Scheduler daemon is not running');
    }
    break;
    
  default:
    console.log('Usage: node scheduler-daemon.js {start|stop|status}');
    console.log('Commands:');
    console.log('  start  - Start the scheduler daemon');
    console.log('  stop   - Stop the scheduler daemon');
    console.log('  status - Check daemon status');
    process.exit(1);
}