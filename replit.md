# FMT News Digest Application

## Overview

This is a full-stack web application that automatically generates and distributes news digests from Free Malaysia Today (FMT). The system fetches articles, uses AI to create compelling summaries, and emails them to subscribers on a scheduled basis.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

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

### Standalone Automation System
- **Node.js Script**: Single digest-script.js handling all functionality
- **Background Scheduler**: Reliable cron-based email automation
- **Process Management**: Scripts for starting, stopping, and monitoring
- **No Web Interface**: Pure automation system without GUI dependencies

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