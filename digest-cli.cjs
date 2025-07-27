#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration file path
const CONFIG_FILE = path.join(__dirname, 'digest-config.json');

// Default configuration
const DEFAULT_CONFIG = {
    source: 'https://www.freemalaysiatoday.com',
    interval: 480, // 8 hours in minutes (3 times daily)
    recipients: ['ricky@rickysoo.com'],
    schedules: ['0,8,16'], // Hours in UTC (8am, 4pm, 12am Malaysia Time)
    enabled: true,
    lastUpdate: new Date().toISOString()
};

// Load configuration
function loadConfig() {
    if (!fs.existsSync(CONFIG_FILE)) {
        saveConfig(DEFAULT_CONFIG);
        return DEFAULT_CONFIG;
    }
    try {
        return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
    } catch (error) {
        console.error('❌ Error loading config:', error.message);
        return DEFAULT_CONFIG;
    }
}

// Save configuration
function saveConfig(config) {
    try {
        config.lastUpdate = new Date().toISOString();
        fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
        console.log('✅ Configuration saved');
    } catch (error) {
        console.error('❌ Error saving config:', error.message);
    }
}

// Get process status
function getProcessStatus() {
    try {
        const schedulerPid = execSync('pgrep -f "digest-script"', { encoding: 'utf8' }).trim();
        const watchdogPid = execSync('pgrep -f "watchdog-scheduler.sh"', { encoding: 'utf8' }).trim();
        
        return {
            scheduler: schedulerPid ? { running: true, pid: schedulerPid } : { running: false },
            watchdog: watchdogPid ? { running: true, pid: watchdogPid } : { running: false }
        };
    } catch {
        return {
            scheduler: { running: false },
            watchdog: { running: false }
        };
    }
}

// Command handlers
const commands = {
    // Show current configuration
    config: () => {
        const config = loadConfig();
        console.log('\n📋 Current Configuration:');
        console.log(`Source: ${config.source}`);
        console.log(`Interval: ${config.interval} minutes`);
        console.log(`Recipients: ${config.recipients.join(', ')}`);
        // Convert UTC hours to Malaysia Time (UTC+8) 
        // Handle both array format and comma-separated string format
        let utcHours;
        if (Array.isArray(config.schedules)) {
            utcHours = config.schedules.flatMap(s => s.includes(',') ? s.split(',') : [s]);
        } else {
            utcHours = config.schedules.split(',');
        }
        
        const mytSchedules = utcHours.map(h => {
            const utcHour = parseInt(h.trim());
            const mytHour = (utcHour + 8) % 24;
            return `${mytHour.toString().padStart(2, '0')}:00`;
        });
        console.log(`Schedule: ${mytSchedules.join(', ')} MYT (${utcHours.join(', ')} UTC)`);
        console.log(`Status: ${config.enabled ? 'Enabled' : 'Disabled'}`);
        console.log(`Last Updated: ${config.lastUpdate}`);
    },

    // Set news source
    source: (url) => {
        if (!url) {
            console.error('❌ Please provide a URL');
            console.log('Usage: digest source <url>');
            return;
        }
        
        const config = loadConfig();
        config.source = url;
        saveConfig(config);
        console.log(`✅ News source updated to: ${url}`);
    },

    // Set interval (in minutes)
    interval: (minutes) => {
        if (!minutes || isNaN(minutes)) {
            console.error('❌ Please provide a valid number of minutes');
            console.log('Usage: digest interval <minutes>');
            console.log('Examples:');
            console.log('  digest interval 480  # 8 hours (3 times daily)');
            console.log('  digest interval 360  # 6 hours (4 times daily)');
            return;
        }
        
        const config = loadConfig();
        config.interval = parseInt(minutes);
        
        // Calculate new schedule based on interval
        const timesPerDay = Math.floor(1440 / config.interval); // 1440 minutes in a day
        const hourInterval = config.interval / 60;
        const schedules = [];
        
        for (let i = 0; i < timesPerDay; i++) {
            schedules.push(Math.floor(i * hourInterval));
        }
        
        config.schedules = schedules.map(h => h.toString());
        saveConfig(config);
        
        console.log(`✅ Interval updated to ${minutes} minutes`);
        // Show both Malaysia Time and UTC for clarity
        const mytSchedules = schedules.map(h => {
            const mytHour = (h + 8) % 24;
            return `${mytHour.toString().padStart(2, '0')}:00`;
        });
        console.log(`📅 New schedule: ${mytSchedules.join(', ')} MYT (${schedules.join(':00, ')}:00 UTC)`);
        console.log('⚠️  Restart scheduler to apply changes: digest restart');
    },

    // Add recipient
    recipient: (action, email) => {
        const config = loadConfig();
        
        if (action === 'add') {
            if (!email) {
                console.error('❌ Please provide an email address');
                console.log('Usage: digest recipient add <email>');
                return;
            }
            
            if (!config.recipients.includes(email)) {
                config.recipients.push(email);
                saveConfig(config);
                console.log(`✅ Added recipient: ${email}`);
            } else {
                console.log(`ℹ️  Recipient already exists: ${email}`);
            }
        } else if (action === 'remove') {
            if (!email) {
                console.error('❌ Please provide an email address');
                console.log('Usage: digest recipient remove <email>');
                return;
            }
            
            const index = config.recipients.indexOf(email);
            if (index > -1) {
                config.recipients.splice(index, 1);
                saveConfig(config);
                console.log(`✅ Removed recipient: ${email}`);
            } else {
                console.log(`ℹ️  Recipient not found: ${email}`);
            }
        } else if (action === 'list') {
            console.log('\n📧 Recipients:');
            config.recipients.forEach((email, index) => {
                console.log(`  ${index + 1}. ${email}`);
            });
        } else {
            console.log('Usage:');
            console.log('  digest recipient add <email>');
            console.log('  digest recipient remove <email>');
            console.log('  digest recipient list');
        }
    },

    // Send test digest
    test: () => {
        console.log('🧪 Sending test digest...');
        try {
            const config = loadConfig();
            const testEnv = {
                ...process.env,
                EMAIL_USER: 'ricky@rickysoo.com',
                RECIPIENT_EMAIL: config.recipients[0] || 'ricky@rickysoo.com',
                SMTP_HOST: 'mail.rickysoo.com',
                SMTP_PORT: '465'
            };
            
            const output = execSync('node digest-script.mjs --test', { 
                encoding: 'utf8',
                env: testEnv
            });
            console.log(output);
        } catch (error) {
            console.error('❌ Test failed:', error.message);
        }
    },

    // Show status
    status: () => {
        const config = loadConfig();
        const status = getProcessStatus();
        
        console.log('\n📊 System Status:');
        console.log(`Configuration: ${config.enabled ? '✅ Enabled' : '❌ Disabled'}`);
        console.log(`Scheduler: ${status.scheduler.running ? `✅ Running (PID: ${status.scheduler.pid})` : '❌ Stopped'}`);
        console.log(`Watchdog: ${status.watchdog.running ? `✅ Running (PID: ${status.watchdog.pid})` : '❌ Stopped'}`);
        // Convert UTC hours to Malaysia Time (UTC+8)
        // Handle both array format and comma-separated string format
        let utcHours;
        if (Array.isArray(config.schedules)) {
            utcHours = config.schedules.flatMap(s => s.includes(',') ? s.split(',') : [s]);
        } else {
            utcHours = config.schedules.split(',');
        }
        
        const mytSchedules = utcHours.map(h => {
            const utcHour = parseInt(h.trim());
            const mytHour = (utcHour + 8) % 24;
            return `${mytHour.toString().padStart(2, '0')}:00`;
        });
        console.log(`Next runs: ${mytSchedules.join(', ')} MYT (Malaysia Time)`);
    },

    // Start services
    start: () => {
        console.log('🚀 Starting digest scheduler...');
        try {
            execSync('./start-digest-background.sh', { stdio: 'inherit' });
            console.log('🛡️  Starting watchdog...');
            execSync('./start-watchdog.sh', { stdio: 'inherit' });
        } catch (error) {
            console.error('❌ Failed to start services:', error.message);
        }
    },

    // Stop services  
    stop: () => {
        console.log('🛑 Stopping digest services...');
        try {
            execSync('pkill -f digest-script', { stdio: 'inherit' });
            execSync('pkill -f watchdog-scheduler.sh', { stdio: 'inherit' });
            console.log('✅ Services stopped');
        } catch (error) {
            console.log('ℹ️  No running services found');
        }
    },

    // Restart services
    restart: () => {
        commands.stop();
        setTimeout(() => {
            commands.start();
        }, 2000);
    },

    // Enable/disable system
    enable: () => {
        const config = loadConfig();
        config.enabled = true;
        saveConfig(config);
        console.log('✅ Digest system enabled');
    },

    disable: () => {
        const config = loadConfig();
        config.enabled = false;
        saveConfig(config);
        commands.stop();
        console.log('✅ Digest system disabled');
    },

    // Show logs
    logs: (type = 'scheduler') => {
        const logFiles = {
            scheduler: 'digest-background.log',
            watchdog: 'watchdog.log'
        };
        
        const logFile = logFiles[type];
        if (!logFile) {
            console.error('❌ Invalid log type. Use: scheduler or watchdog');
            return;
        }
        
        if (!fs.existsSync(logFile)) {
            console.log(`ℹ️  No log file found: ${logFile}`);
            return;
        }
        
        try {
            const logs = execSync(`tail -20 ${logFile}`, { encoding: 'utf8' });
            console.log(`\n📄 ${type.charAt(0).toUpperCase() + type.slice(1)} Logs (last 20 lines):`);
            console.log(logs);
        } catch (error) {
            console.error('❌ Error reading logs:', error.message);
        }
    },

    // Show help
    help: () => {
        console.log(`
📰 FMT News Digest CLI

CONFIGURATION:
  digest config                    Show current configuration
  digest source <url>              Set news source URL
  digest interval <minutes>        Set digest interval
  digest recipient add <email>     Add recipient
  digest recipient remove <email>  Remove recipient
  digest recipient list            List all recipients

OPERATIONS:
  digest test                      Send test digest
  digest start                     Start scheduler and watchdog
  digest stop                      Stop all services
  digest restart                   Restart all services
  digest status                    Show system status

SYSTEM:
  digest enable                    Enable digest system
  digest disable                   Disable digest system
  digest logs [scheduler|watchdog] Show logs (default: scheduler)
  digest help                      Show this help

EXAMPLES:
  digest source https://www.freemalaysiatoday.com
  digest interval 480              # 8 hours (3 times daily)
  digest recipient add user@example.com
  digest test                      # Send test digest
`);
    }
};

// Main execution
function main() {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        commands.help();
        return;
    }
    
    const command = args[0];
    const commandArgs = args.slice(1);
    
    if (commands[command]) {
        commands[command](...commandArgs);
    } else {
        console.error(`❌ Unknown command: ${command}`);
        console.log('Run "digest help" for available commands');
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = { commands, loadConfig, saveConfig };