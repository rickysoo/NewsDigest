# FMT News Digest

Automated news digest system that scrapes Free Malaysia Today (FMT), generates AI-powered summaries, and emails them on a scheduled basis.

[![Node.js](https://img.shields.io/badge/Node.js-18.0.0%2B-green.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![OpenAI](https://img.shields.io/badge/AI-OpenAI%20GPT--4o-orange.svg)](https://openai.com/)

## Features

- 🤖 **AI-Powered Summaries**: Uses OpenAI GPT-4o to create compelling news digests
- 📧 **Email Automation**: Sends HTML-formatted emails with embedded images
- ⏰ **Flexible Scheduling**: Configurable intervals (default: 3 times daily)
- 🖼️ **Image Processing**: Automatically includes and optimizes news images
- 🛡️ **Reliability**: Watchdog system ensures continuous operation
- 🎛️ **CLI Management**: Complete command-line interface for configuration

## Quick Start

### 1. Installation

```bash
# Clone or download the project
cd fmt-news-digest

# Install dependencies
npm install

# Make scripts executable
npm run setup
```

### 2. Environment Configuration

Create a `.env` file with your credentials:

```bash
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Email Configuration
EMAIL_USER=your_email@domain.com
SMTP_PASSWORD=your_email_password
SMTP_HOST=your_smtp_server
SMTP_PORT=465

# Recipient Configuration
RECIPIENT_EMAIL=recipient@domain.com
```

### 3. Start the System

```bash
# Start scheduler and watchdog
./digest start

# Or run individual components
npm run scheduler  # Start scheduler only
npm run watchdog   # Start watchdog only
```

## CLI Commands

### Configuration
```bash
./digest config                      # Show current settings
./digest source <url>                # Set news source
./digest interval <minutes>          # Set digest interval
./digest recipient add <email>       # Add recipient
./digest recipient remove <email>    # Remove recipient
./digest recipient list              # List recipients
```

### Operations
```bash
./digest test                        # Send test digest
./digest start                       # Start all services
./digest stop                        # Stop all services
./digest restart                     # Restart services
./digest status                      # Show system status
```

### System Management
```bash
./digest enable                      # Enable system
./digest disable                     # Disable system
./digest logs                        # View scheduler logs
./digest logs watchdog               # View watchdog logs
```

## Configuration Examples

```bash
# Set to send 4 times daily (every 6 hours)
./digest interval 360

# Change news source
./digest source https://www.freemalaysiatoday.com

# Add multiple recipients
./digest recipient add team@company.com
./digest recipient add manager@company.com

# Send immediate test
./digest test
```

## Email Schedule

Default schedule (3 times daily):
- **8:00 AM** Malaysia Time (12:00 AM UTC)
- **4:00 PM** Malaysia Time (8:00 AM UTC)  
- **12:00 AM** Malaysia Time (4:00 PM UTC)

Schedule automatically adjusts based on your configured interval using the CLI.

## System Architecture

### Core Components
- **digest-script.js**: Main digest generation and email sending
- **digest-cli.cjs**: Command-line interface for management (16 commands)
- **digest**: CLI wrapper script for easy command execution
- **image-converter.js**: Handles image processing and base64 conversion

### Process Management
- **start-digest-background.sh**: Scheduler startup script
- **watchdog-scheduler.sh**: Monitors and restarts scheduler (60-min intervals)  
- **start-watchdog.sh**: Watchdog startup script
- **setup-local.sh**: Automated local installation setup

### Configuration
- **digest-config.json**: Persistent configuration storage (auto-generated)
- **.env**: Environment variables for API keys and credentials
- **package-standalone.json**: Standalone npm package configuration

## Requirements

- Node.js 18.0.0 or higher
- OpenAI API key
- SMTP email account (Gmail, custom server, etc.)

## Troubleshooting

### Check System Status
```bash
./digest status
```

### View Recent Logs
```bash
./digest logs
./digest logs watchdog
```

### Restart Everything
```bash
./digest restart
```

### Manual Test
```bash
./digest test
```

## Security Notes

- Never commit `.env` files to version control
- Use app-specific passwords for Gmail
- Keep your OpenAI API key secure
- Regularly monitor logs for any issues

## Advanced Usage

### Batch Configuration
```bash
./digest source https://www.freemalaysiatoday.com
./digest interval 360
./digest recipient add team@company.com
./digest start
```

### Monitoring and Maintenance
```bash
# Check everything is working
./digest status

# View recent activity
./digest logs

# Restart if needed
./digest restart
```

### Customization
The system supports:
- Multiple news sources (modify `digest-script.js`)
- Custom email templates (HTML formatting)
- Flexible scheduling (any interval in minutes)
- Multiple recipients
- Watchdog monitoring with auto-restart

## Recent Updates (July 28, 2025)

- ✅ **Complete CLI Management System**: 16 commands for full control
- ✅ **Persistent Configuration**: JSON-based settings storage
- ✅ **Watchdog Monitoring**: Hourly health checks with auto-restart
- ✅ **Production Ready**: Comprehensive documentation and deployment guides
- ✅ **Git Ready**: Proper licensing, contributing guidelines, and environment setup
- ✅ **Enhanced Reliability**: Multiple process management scripts

## Documentation

- **[Installation & Setup](README.md)** - This file
- **[Contributing Guidelines](CONTRIBUTING.md)** - Development and contribution guide
- **[Deployment Guide](DEPLOYMENT.md)** - Production deployment instructions
- **[Environment Setup](.env.example)** - Configuration template
- **[Security Checklist](SECURITY_CHECKLIST.md)** - **MUST READ** before pushing to Git

## Git Repository Setup

⚠️ **SECURITY WARNING**: This project contains sensitive data that must not be exposed on GitHub.

**BEFORE pushing to Git, read [SECURITY_CHECKLIST.md](SECURITY_CHECKLIST.md) first!**

Critical files to protect:
- `.env` - Contains your API keys and passwords
- `digest-config.json` - Contains real email addresses
- `*.log` files - May contain sensitive runtime data

Steps to prepare for Git:

1. **Read security checklist**: [SECURITY_CHECKLIST.md](SECURITY_CHECKLIST.md)
2. **Created your repository** on GitHub/GitLab
3. **Configure environment safely**:
   ```bash
   cp .env.example .env
   cp digest-config.example.json digest-config.json
   # Edit with your actual credentials (these files won't be committed)
   ```
4. **Verify sensitive files are excluded**:
   ```bash
   git status  # Should NOT show .env or digest-config.json
   ```
5. **Set up Git remote**:
   ```bash
   git remote add origin https://github.com/[username]/fmt-news-digest.git
   ```

## Support

For issues or questions:
1. Check system status: `./digest status`
2. View logs: `./digest logs`
3. Verify configuration: `./digest config`
4. Test connectivity: `./digest test`
5. Restart services: `./digest restart`

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.