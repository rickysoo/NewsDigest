# FMT News Digest System

An automated news digest system that scrapes the latest articles from Free Malaysia Today (FMT), generates AI-powered summaries using OpenAI GPT-4o, and delivers them via email every 3 hours with a focus on Malaysian domestic news.

## Features

- **Automated News Scraping**: Fetches latest articles from FMT website
- **AI-Powered Summarization**: Uses OpenAI GPT-4o to create intelligent, coherent digests
- **Malaysian News Priority**: Filters and prioritizes domestic Malaysian news content
- **Email Delivery**: Sends HTML-formatted digests via SMTP
- **Scheduled Operation**: Runs every 3 hours starting at midnight (12am, 3am, 6am, 9am, 12pm, 3pm, 6pm, 9pm)
- **Service Management**: Built-in process management with start/stop/restart capabilities

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   NewsService   │    │   AIService     │    │  EmailService   │
│                 │    │                 │    │                 │
│ • FMT Scraping  │───▶│ • OpenAI GPT-4o │───▶│ • SMTP Delivery │
│ • Content Parse │    │ • Digest Gen.   │    │ • HTML Format   │
│ • MY News Focus │    │ • 500 words     │    │ • Clean Design  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Quick Start

### Prerequisites

- Node.js 18+ 
- OpenAI API key
- SMTP email server access

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd fmt-news-digest
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
export OPENAI_API_KEY="your-openai-api-key"
export SMTP_PASSWORD="your-smtp-password"
```

### Running the Service

**Start the automated service:**
```bash
node digest-service.js start
```

**Check service status:**
```bash
node digest-service.js status
```

**Stop the service:**
```bash
node digest-service.js stop
```

**Run a test digest:**
```bash
node digest-service.js test
```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `OPENAI_API_KEY` | OpenAI API key for GPT-4o | **Required** |
| `SMTP_PASSWORD` | SMTP server password | **Required** |
| `EMAIL_USER` | Sender email address | **Required** |
| `RECIPIENT_EMAIL` | Recipient email address | **Required** |
| `SMTP_HOST` | SMTP server hostname | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP server port | `587` |

**⚠️ Security Note:** All sensitive configuration must be provided via environment variables. No credentials should be hardcoded in source files.

### Customization

Edit `digest-script.js` to modify:
- **Target word count**: Change `targetWords` in config
- **Article limit**: Modify `maxArticles` in config  
- **Schedule**: Update cron pattern (currently `0 */3 * * *`)
- **Email template**: Customize HTML formatting in `EmailService.formatDigestEmail()`

## Malaysian News Focus

The system prioritizes Malaysian domestic content using:

- **Keyword filtering** for Malaysian politics, economy, and locations
- **Relevance scoring** based on Malaysian context
- **Content prioritization** for domestic over international news
- **Smart article selection** focusing on Malaysian impact

Keywords include: `malaysia`, `kuala lumpur`, `parliament`, `ringgit`, `anwar`, `umno`, `dap`, `pas`, etc.

## Email Format

Digests are delivered as clean HTML emails featuring:
- Responsive design optimized for email clients
- Professional typography and layout
- Word count and generation timestamp
- Concise subject lines: "FMT News Digest: [Title]"
- Malaysian-focused content organization

## Service Management

The system includes robust service management:

- **Process monitoring** with PID file tracking
- **Automatic restart** capabilities
- **Comprehensive logging** to `digest-service.log`
- **Error handling** and recovery
- **Resource cleanup** on shutdown

## Dependencies

### Core Dependencies
- **cheerio**: HTML parsing for web scraping
- **openai**: AI-powered digest generation  
- **nodemailer**: Email delivery via SMTP
- **node-cron**: Scheduled task execution

### Development
- **Node.js**: Runtime environment
- **ES Modules**: Modern JavaScript module system

## File Structure

```
├── digest-script.js         # Main digest generation script
├── digest-service.js        # Service management wrapper
├── digest-service.log       # Service operation logs
├── digest.pid              # Process ID file
├── package.json            # Dependencies and scripts
├── README.md              # This file
└── SECURITY_AUDIT.md      # Security assessment
```

## Logging

Service logs include:
- **Startup/shutdown events**
- **Article scraping progress** 
- **AI digest generation status**
- **Email delivery confirmation**
- **Error tracking and debugging**

View logs:
```bash
tail -f digest-service.log
```

## Error Handling

The system includes comprehensive error handling:
- **Graceful degradation** when services are unavailable
- **Retry mechanisms** for transient failures
- **Detailed error logging** for debugging
- **Service recovery** capabilities

## Security Features

✅ **Security Enhancements Implemented:**
- **Input Sanitization**: All scraped content is sanitized to prevent XSS and injection attacks
- **Rate Limiting**: Built-in limits for API calls and email sending to prevent abuse
- **Secure Error Logging**: Sensitive information filtered from error messages and logs
- **Environment Variables**: All credentials must be provided securely via environment variables
- **Content Validation**: HTML tags and malicious content stripped from articles

⚠️ **Important**: Review `SECURITY_AUDIT.md` for complete security assessment

**Rate Limits:**
- OpenAI API: 10 requests per hour
- HTTP Requests: 50 requests per hour  
- Email Sending: 25 emails per day

## Performance

- **Average digest generation**: 10-15 seconds
- **Memory usage**: ~50MB during operation
- **Article processing**: 8-10 articles per digest
- **Content size**: ~500 words per digest

## Troubleshooting

### Common Issues

**Service won't start:**
```bash
# Check if already running
node digest-service.js status

# Kill any existing processes
pkill -f "digest-script.js"
rm -f digest.pid
```

**Email not sending:**
- Verify SMTP credentials and server settings
- Check firewall/network connectivity
- Review email provider security settings

**Missing articles:**
- FMT website structure may have changed
- Check network connectivity to FMT
- Review scraping selectors in NewsService

### Debug Mode

Run with detailed logging:
```bash
node digest-script.js --test
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Review security guidelines in `SECURITY_AUDIT.md`
4. Implement changes with proper error handling
5. Test thoroughly with `node digest-service.js test`
6. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
1. Check logs in `digest-service.log`
2. Review troubleshooting section
3. Verify environment variable configuration
4. Test with `node digest-service.js test`

---

**Note**: This system is designed for personal/educational use. Review security audit before production deployment.