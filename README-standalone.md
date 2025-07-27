# FMT News Digest - Standalone Version

Automated news digest system that scrapes Free Malaysia Today (FMT), generates AI-powered summaries, and emails them on a scheduled basis.

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

## System Architecture

- **digest-script.js**: Main digest generation and email sending
- **digest-cli.cjs**: Command-line interface for management
- **start-digest-background.sh**: Scheduler startup script
- **watchdog-scheduler.sh**: Monitors and restarts scheduler if needed
- **image-converter.js**: Handles image processing and base64 conversion

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

## Support

For issues or questions:
1. Check the logs: `./digest logs`
2. Verify configuration: `./digest config`
3. Test connectivity: `./digest test`
4. Restart services: `./digest restart`

## License

MIT License - See LICENSE file for details.