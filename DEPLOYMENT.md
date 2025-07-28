# Deployment Guide

This guide covers deploying the FMT News Digest system in various environments.

## Production Deployment

### 1. Server Requirements

**Minimum System Requirements:**
- Linux/macOS server or cloud instance
- Node.js 18.0.0 or higher
- 1GB RAM minimum (2GB recommended)
- 10GB disk space
- Stable internet connection

**Recommended Cloud Providers:**
- AWS EC2 (t3.micro or larger)
- DigitalOcean Droplet (Basic plan)
- Google Cloud Compute Engine
- Azure Virtual Machine

### 2. Production Setup

```bash
# 1. Clone the repository
git clone https://github.com/[username]/fmt-news-digest.git
cd fmt-news-digest

# 2. Install dependencies
npm install --production

# 3. Set up executable permissions
npm run setup

# 4. Configure environment
cp .env.example .env
nano .env  # Edit with your actual credentials

# 5. Test the system
./digest test

# 6. Start the system
./digest start
```

### 3. Environment Configuration

**Required Environment Variables:**
```bash
# OpenAI Configuration
OPENAI_API_KEY=sk-...

# Email Configuration  
EMAIL_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465

# Recipients
RECIPIENT_EMAIL=recipient@domain.com
```

**Gmail Setup for Production:**
1. Enable 2-factor authentication
2. Generate an App Password
3. Use the App Password in `SMTP_PASSWORD`

### 4. System Service Setup (Linux)

Create a systemd service for automatic startup:

```bash
# Create service file
sudo nano /etc/systemd/system/fmt-digest.service
```

```ini
[Unit]
Description=FMT News Digest Service
After=network.target

[Service]
Type=forking
User=your_username
WorkingDirectory=/path/to/fmt-news-digest
ExecStart=/path/to/fmt-news-digest/digest start
ExecStop=/path/to/fmt-news-digest/digest stop
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

```bash
# Enable and start service
sudo systemctl enable fmt-digest
sudo systemctl start fmt-digest
sudo systemctl status fmt-digest
```

### 5. Monitoring Setup

**Log Monitoring:**
```bash
# View real-time logs
./digest logs

# Monitor system status
watch -n 30 './digest status'

# Check process health
ps aux | grep digest
```

**Automated Monitoring:**
The system includes a built-in watchdog that:
- Checks scheduler health every 60 minutes
- Automatically restarts failed processes
- Logs all monitoring activities

### 6. Backup Strategy

**Configuration Backup:**
```bash
# Backup configuration
cp digest-config.json digest-config.backup
cp .env .env.backup

# Weekly backup script
#!/bin/bash
DATE=$(date +%Y%m%d)
tar -czf "backup-$DATE.tar.gz" digest-config.json .env *.log
```

## Docker Deployment

### Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .
RUN chmod +x digest start-digest-background.sh watchdog-scheduler.sh start-watchdog.sh

EXPOSE 3000

CMD ["./digest", "start"]
```

### Docker Compose
```yaml
version: '3.8'
services:
  fmt-digest:
    build: .
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - EMAIL_USER=${EMAIL_USER}
      - SMTP_PASSWORD=${SMTP_PASSWORD}
      - SMTP_HOST=${SMTP_HOST}
      - SMTP_PORT=${SMTP_PORT}
      - RECIPIENT_EMAIL=${RECIPIENT_EMAIL}
    volumes:
      - ./logs:/app/logs
    restart: unless-stopped
```

## Cloud Platform Deployments

### Heroku
```bash
# Install Heroku CLI and login
heroku create fmt-news-digest

# Set environment variables
heroku config:set OPENAI_API_KEY=your_key
heroku config:set EMAIL_USER=your_email
heroku config:set SMTP_PASSWORD=your_password
# ... set other variables

# Deploy
git push heroku main
```

### Railway
```bash
# Install Railway CLI
railway login
railway init
railway up

# Set environment variables in Railway dashboard
```

### DigitalOcean App Platform
1. Connect your GitHub repository
2. Set environment variables in the control panel
3. Configure build and run commands:
   - Build: `npm install`
   - Run: `./digest start`

## Security Considerations

### API Key Security
- Never commit `.env` files to version control
- Use environment variables or secure key management
- Rotate API keys regularly
- Monitor API usage for anomalies

### Email Security
- Use app-specific passwords for Gmail
- Enable 2FA on email accounts
- Monitor email sending quotas
- Implement rate limiting if needed

### Server Security
```bash
# Update system regularly
sudo apt update && sudo apt upgrade

# Configure firewall
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443

# Secure SSH
sudo nano /etc/ssh/sshd_config
# Disable root login, change default port
```

## Scaling Considerations

### Performance Optimization
- Monitor memory usage during peak operations
- Consider caching mechanisms for repeated requests
- Optimize image processing for large news articles
- Implement request queuing for high-volume scenarios

### Multi-Instance Deployment
- Use load balancers for multiple instances
- Implement shared configuration storage
- Coordinate scheduling across instances
- Monitor distributed system health

## Troubleshooting

### Common Issues
1. **Service won't start**: Check permissions and environment variables
2. **Emails not sending**: Verify SMTP credentials and firewall settings
3. **Memory issues**: Monitor process usage and consider resource limits
4. **Scheduling problems**: Check cron configuration and system time

### Debug Commands
```bash
./digest status      # Check system status
./digest logs        # View recent logs
./digest config      # Verify configuration
./digest test        # Test email delivery
```

### Log Analysis
```bash
# Search for errors
grep -i error *.log

# Monitor resource usage
top -p $(pgrep -f digest)

# Check disk space
df -h
```

## Maintenance

### Regular Tasks
- **Weekly**: Review logs and system performance
- **Monthly**: Update dependencies and security patches
- **Quarterly**: Review and rotate API keys
- **Annually**: Full system backup and disaster recovery test

### Update Process
```bash
# Backup current system
./digest stop
cp -r . ../fmt-digest-backup

# Pull updates
git pull origin main
npm install

# Test updates
./digest test

# Restart system
./digest start
```