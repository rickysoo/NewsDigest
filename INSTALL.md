# Local Installation Guide

## Download and Setup

### Option 1: Direct Download
1. Download all project files to your computer
2. Open terminal/command prompt in the project folder
3. Run the setup script:
   ```bash
   chmod +x setup-local.sh
   ./setup-local.sh
   ```

### Option 2: Git Clone (if using Git)
```bash
git clone <your-repo-url>
cd fmt-news-digest
./setup-local.sh
```

## Installation Steps

### 1. Install Node.js Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your credentials
nano .env   # or use any text editor
```

Required environment variables:
```
OPENAI_API_KEY=sk-your-openai-key-here
EMAIL_USER=your-email@domain.com
SMTP_PASSWORD=your-email-password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
RECIPIENT_EMAIL=recipient@domain.com
```

### 3. Test Configuration
```bash
# Send a test digest to verify everything works
./digest test
```

### 4. Start the System
```bash
# Start both scheduler and watchdog
./digest start

# Check if everything is running
./digest status
```

## File Structure

Your local installation will include:

```
fmt-news-digest/
├── digest-script.js           # Main digest generator
├── digest-cli.cjs            # CLI management interface
├── digest                    # CLI command wrapper
├── image-converter.js        # Image processing
├── start-digest-background.sh # Scheduler startup
├── watchdog-scheduler.sh     # System monitor
├── start-watchdog.sh         # Watchdog startup
├── package.json              # Dependencies
├── .env                      # Your configuration
├── .env.example              # Configuration template
└── README.md                 # Documentation
```

## Usage

Once installed, use the CLI commands:

```bash
./digest config               # View configuration
./digest test                 # Send test digest
./digest start                # Start all services
./digest status               # Check system status
./digest logs                 # View logs
./digest help                 # Full command list
```

## System Requirements

- **Node.js**: Version 18.0.0 or higher
- **Operating System**: Linux, macOS, or Windows with WSL
- **Network**: Internet connection for FMT scraping and OpenAI API
- **Email**: SMTP server access (Gmail recommended)

## Troubleshooting

### Common Issues

1. **Permission Denied Errors**
   ```bash
   chmod +x digest
   chmod +x *.sh
   ```

2. **Module Not Found**
   ```bash
   npm install
   ```

3. **Email Sending Fails**
   - Check SMTP credentials in `.env`
   - For Gmail, use app-specific password
   - Verify SMTP host and port

4. **OpenAI API Errors**
   - Verify API key in `.env`
   - Check API usage limits
   - Ensure sufficient credits

### Getting Help

1. Check system status: `./digest status`
2. View logs: `./digest logs`
3. Test configuration: `./digest test`
4. Restart services: `./digest restart`

Your digest system is now ready to run independently on your local computer!