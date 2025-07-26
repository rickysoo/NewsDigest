# FMT News Digest Script

A standalone script that automatically scrapes Free Malaysia Today (FMT) news articles, generates AI-powered summaries, and emails them every 3 hours starting at midnight.

## Features

- 🕐 **Automated Schedule**: Runs every 3 hours (12am, 3am, 6am, 9am, 12pm, 3pm, 6pm, 9pm)
- 📰 **Smart Scraping**: Fetches latest 10 articles from Free Malaysia Today
- 🤖 **AI Summaries**: Uses OpenAI GPT-4o to create intelligent 500-word digests
- 📧 **Professional Emails**: Sends beautifully formatted HTML email digests
- 🔧 **Easy Setup**: Simple configuration via environment variables
- 🧪 **Test Mode**: Run immediate test digests before scheduling

## Quick Start

### 1. Setup
```bash
# Run the setup script
./setup-digest.sh

# Or manually copy files
cp digest-package.json package.json
npm install
```

### 2. Configure Environment
Edit the `.env` file with your credentials:

```env
# Required: OpenAI API Key
OPENAI_API_KEY=sk-your-key-here

# Required: Email Configuration  
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password-here
RECIPIENT_EMAIL=recipient@example.com

# Optional: SMTP Settings (defaults to Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
```

### 3. Test & Run
```bash
# Test immediately
npm run test

# Start the scheduler
npm start
```

## Getting API Keys & Passwords

### OpenAI API Key
1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create account and add payment method
3. Generate a new API key
4. Copy the key (starts with `sk-`)

### Gmail App Password
1. Enable 2-factor authentication on your Google account
2. Go to Google Account Settings → Security
3. Generate an "App Password" for Mail
4. Use this 16-character password (not your regular password)

## Usage

### Start Scheduler
```bash
node digest-script.js
```
The script will run continuously and generate digests every 3 hours.

### Test Mode
```bash
node digest-script.js --test
```
Generates and sends one digest immediately for testing.

### Schedule Times
The script runs at these times daily:
- 12:00 AM (midnight)
- 3:00 AM  
- 6:00 AM
- 9:00 AM
- 12:00 PM (noon)
- 3:00 PM
- 6:00 PM
- 9:00 PM

## How It Works

1. **News Scraping**: Fetches latest articles from FMT homepage
2. **Content Extraction**: Downloads full article text from each URL
3. **AI Processing**: Sends articles to OpenAI GPT-4o for intelligent summarization
4. **Email Generation**: Creates professional HTML email with formatted digest
5. **Delivery**: Sends email via SMTP (Gmail or custom server)
6. **Logging**: Comprehensive console logging for monitoring

## Email Format

The generated emails include:
- Professional header with date
- Article count and word count statistics  
- AI-generated compelling title
- Well-structured 500-word summary
- Clean, mobile-friendly HTML formatting
- Automatic paragraph formatting

## Monitoring

The script provides detailed console output:
- Startup configuration validation
- Schedule confirmation
- Real-time processing logs
- Success/failure notifications
- Error details and timestamps

## Troubleshooting

### Common Issues

**"OPENAI_API_KEY is required"**
- Set your OpenAI API key in the `.env` file
- Ensure you have credits in your OpenAI account

**"Email connection failed"**
- Check your EMAIL_USER and EMAIL_PASS
- For Gmail, use an app password, not your regular password
- Ensure 2-factor authentication is enabled

**"No articles fetched"**
- FMT website may be temporarily unavailable
- Check your internet connection
- The script will retry on the next scheduled run

**"Invalid login" or email errors**
- Verify your email credentials
- For Gmail, ensure "Less secure app access" is enabled or use app passwords
- Check SMTP host and port settings

### Running as a Service

To run continuously in the background:

**Linux/Mac:**
```bash
# Using nohup
nohup node digest-script.js > digest.log 2>&1 &

# Using screen
screen -S digest
node digest-script.js
# Press Ctrl+A, then D to detach
```

**Windows:**
```bash
# Using pm2 (install with: npm install -g pm2)
pm2 start digest-script.js --name "fmt-digest"
pm2 startup  # Configure auto-start
pm2 save     # Save current processes
```

## Configuration Options

All configuration is done via environment variables in `.env`:

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `OPENAI_API_KEY` | Yes | - | Your OpenAI API key |
| `EMAIL_USER` | Yes | - | Sender email address |
| `EMAIL_PASS` | Yes | - | Sender email password/app password |
| `RECIPIENT_EMAIL` | Yes | - | Where to send digests |
| `SMTP_HOST` | No | smtp.gmail.com | SMTP server hostname |
| `SMTP_PORT` | No | 587 | SMTP server port |

## Cost Estimation

**OpenAI API Usage:**
- Approximately $0.01-0.05 per digest
- Daily cost: ~$0.08-0.40 (8 digests)
- Monthly cost: ~$2.40-12.00

**Email:**
- Gmail: Free for personal use
- Custom SMTP: Varies by provider

Total estimated monthly cost: $2.40-15.00

## License

MIT License - feel free to modify and distribute.