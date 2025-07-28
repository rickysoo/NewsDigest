# FMT News Digest Application

## Overview

This is a full-stack web application that automatically generates and distributes news digests from Free Malaysia Today (FMT). The system fetches articles, uses AI to create compelling summaries, and emails them to subscribers on a scheduled basis.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

**July 28, 2025 - Repository Cleaned for GitHub Push**
- Removed all security documentation files (SECURITY_*.md) from public repository
- Excluded development documentation (DEPLOYMENT.md, GIT_SETUP.md, etc.)
- Cleaned up development artifacts and build files
- Enhanced .gitignore to protect sensitive files automatically
- Moved digest-config.json with real emails to .gitignore protection
- Repository now contains only essential files for deployment (25 files total)
- Ready for safe public GitHub hosting with no sensitive data exposure

**July 28, 2025 - Added Comprehensive REST API System**
- Created full-featured REST API server (api-server.js) with 8 endpoints
- Built interactive web interface for API testing and monitoring
- Implemented rate limiting: 100 req/15min general, 10 req/hour for digest generation
- Added real-time statistics, system status, and digest history tracking
- Created comprehensive API documentation with usage examples
- Designed for deployment at https://your-replit-app.replit.app with full CORS support
- API provides on-demand digest generation alongside existing scheduled automation

**July 28, 2025 - Fixed ES Module Import Syntax Error**
- Created CommonJS wrapper (digest-script.js) that imports ES module version (digest-script.mjs)
- Resolved deployment error: "ES module import syntax not supported in CommonJS mode"
- Maintained package.json as CommonJS while enabling ES6 imports through dynamic import()
- All npm scripts now work correctly: test, start, and dev commands function properly
- Successfully tested digest generation and email delivery with fixed module configuration

## System Architecture

### Dual-Mode System: Automation + API
- **Automation Mode**: digest-script.js for scheduled cron-based email automation
- **API Mode**: api-server.js providing REST endpoints for manual control and monitoring
- **Web Interface**: Interactive dashboard for API testing and system monitoring
- **Flexible Deployment**: Can run as pure automation or combined automation+API system

## Key Components

### Core Services
1. **NewsService**: Scrapes FMT website using Cheerio for article extraction
2. **AIService**: Integrates with OpenAI GPT-4o to generate digest summaries
3. **EmailService**: Handles email delivery via Nodemailer with SMTP configuration
4. **SchedulerService**: Manages cron-based scheduling for automated digest generation

### Data Models
- **Digests**: Generated news summaries with metadata
- **EmailLogs**: Tracking email delivery status and recipients
- **SystemLogs**: Application logging and monitoring
- **Settings**: Configurable application parameters

### Management Commands
- **`./start-digest-background.sh`**: Start scheduler in background
- **`./run-scheduler.sh`**: Full process management (start/stop/status)
- **`node digest-script.js --test`**: Manual digest generation
- **Process monitoring**: Built-in restart and error handling

## External Dependencies

### Required Services
- **OpenAI API**: For digest generation (GPT-4o model)
- **SMTP Server**: For email delivery (Gmail/custom SMTP)
- **PostgreSQL Database**: Data persistence (Neon serverless recommended)

### Key Libraries
- **@neondatabase/serverless**: Serverless PostgreSQL connection
- **drizzle-orm**: Database ORM and query builder
- **node-cron**: Scheduled task execution
- **cheerio**: HTML parsing for web scraping
- **nodemailer**: Email sending capabilities

## Deployment Strategy

### Development Setup
- Vite dev server with HMR for frontend development
- Express server with middleware for API handling
- Memory storage fallback for testing without database

### Production Build
- **Frontend**: Vite builds optimized static assets
- **Backend**: ESBuild compiles server code for Node.js execution
- **Database**: Drizzle migrations for schema deployment

### Environment Configuration
- `DATABASE_URL`: PostgreSQL connection string
- `OPENAI_API_KEY`: AI service authentication
- `SMTP_*` variables: Email service configuration
- Graceful fallbacks for missing environment variables

### Monitoring and Logging
- Request/response logging with timing
- System activity tracking in database
- Error handling with proper HTTP status codes
- Health check endpoints for service monitoring