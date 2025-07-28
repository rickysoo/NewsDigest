# FMT News Digest Application

## Overview

This is a full-stack web application that automatically generates and distributes news digests from Free Malaysia Today (FMT). The system fetches articles, uses AI to create compelling summaries, and emails them to subscribers on a scheduled basis.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

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

**July 28, 2025 - Fixed Previous Deployment Issues**
- Added missing `dev` and `build` scripts to package.json to resolve deployment errors
- Fixed email SMTP configuration for proper SSL/STARTTLS handling
- Updated workflow to successfully run digest script in development mode
- Resolved module type conflicts between CommonJS and ES modules
- Configured custom mail server (mail.rickysoo.com) with SSL on port 465
- Successfully tested complete digest generation and email delivery

**July 28, 2025 - Git Repository Preparation Complete**
- Updated README.md with production-ready documentation and badges
- Created comprehensive CONTRIBUTING.md for developer guidelines
- Added detailed DEPLOYMENT.md with production deployment instructions
- Generated proper LICENSE file (MIT License)
- Created .env.example template for environment configuration
- Added GIT_SETUP.md checklist for repository preparation
- Enhanced documentation with proper cross-references and Git setup instructions
- Project now fully ready for pushing to Git repositories

**July 27, 2025 - Added Comprehensive CLI Management System**
- Created complete command-line interface (`digest-cli.cjs`) for system management
- Added configuration management with persistent JSON storage
- Implemented process monitoring and control through CLI commands
- Created watchdog system with hourly monitoring (60-minute intervals)
- Enhanced system reliability with automatic scheduler restart capabilities
- CLI supports: source configuration, interval changes, recipient management, testing, logs
- All system operations now manageable through simple `./digest <command>` syntax

**July 27, 2025 - Simplified to Standalone Email Automation**
- Removed web dashboard interface and all React/Express dependencies
- Converted to standalone Node.js email automation system
- Created reliable background scheduler with `start-digest-background.sh`
- Added process management scripts for ensuring scheduler reliability
- Streamlined project to focus solely on FMT news digest automation
- Maintained 3 times daily schedule: 8am, 4pm, 12am Malaysia Time
- Enhanced image processing with base64 embedding for reliable email display

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

## Data Flow

1. **Content Ingestion**: Scheduler triggers NewsService to scrape FMT articles
2. **AI Processing**: AIService processes articles to generate cohesive digest
3. **Storage**: Digest saved to database with generated content and metadata
4. **Distribution**: EmailService sends digest to configured recipients
5. **Monitoring**: All operations logged for tracking and debugging

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