# FMT News Digest - Windows Installation Guide

## Required Files for Windows

### Core Files (Essential)
1. **digest-script.mjs** - Main digest generation script
2. **image-converter.mjs** - Image processing utility  
3. **digest-cli.cjs** - Command-line interface
4. **digest** - CLI wrapper script
5. **package.json** - Node.js dependencies
6. **digest-config.json** - Configuration storage

### Background Service Files
7. **start-digest-background.sh** - Background scheduler starter
8. **run-scheduler.sh** - Process management
9. **watchdog-scheduler.sh** - Auto-restart monitoring
10. **start-watchdog.sh** - Watchdog starter

### Setup Files
11. **setup-local.sh** - Local installation script
12. **package-standalone.json** - Standalone package config
13. **.env.example** - Environment variable template

## Windows Installation Steps

### 1. Prerequisites
- Install Node.js 20+ from nodejs.org
- Install Git for Windows (includes bash)

### 2. Download Files
Download all 13 files listed above to a folder (e.g., `C:\fmt-digest\`)

### 3. Setup
```bash
# Open Git Bash in your folder
chmod +x *.sh
chmod +x digest
npm install
```

### 4. Configuration
```bash
# Copy environment template
cp .env.example .env

# Edit .env with your credentials:
# - OPENAI_API_KEY=your_key_here
# - SMTP_PASSWORD=your_email_password
```

### 5. Test Installation
```bash
./digest test
```

## Windows-Specific Notes

- Use **Git Bash** or **WSL** to run bash scripts
- The CLI commands work the same: `./digest status`, `./digest config`, etc.
- Background services will run using Node.js processes
- Logs are saved as text files in the same directory

## CLI Commands Available
- `./digest test` - Send test digest
- `./digest status` - Check system status
- `./digest start` - Start background scheduler
- `./digest config` - View configuration
- `./digest logs` - View recent logs
- `./digest help` - Full command list

## Troubleshooting
- If scripts don't run: Use Git Bash instead of Command Prompt
- If permissions denied: Run `chmod +x *.sh digest`
- If modules not found: Run `npm install`