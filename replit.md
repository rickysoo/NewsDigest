# FMT News Digest Application

## Overview

This is a full-stack web application that automatically generates and distributes news digests from Free Malaysia Today (FMT). The system fetches articles, uses AI to create compelling summaries, and emails them to subscribers on a scheduled basis.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

**July 26, 2025 - Security & GitHub Preparation Complete**
- Implemented comprehensive input sanitization to prevent XSS and injection attacks
- Added rate limiting for OpenAI API (10/hour), HTTP requests (50/hour), and emails (25/day)
- Enhanced secure error logging with sensitive data filtering (URLs, emails, IPs, API keys)
- Removed hardcoded credential fallbacks requiring all sensitive config via environment variables
- Email addresses now masked in logs for privacy (e.g., ri***@domain.com)
- Added content validation removing HTML tags and malicious content from scraped articles
- Created detailed SECURITY_STATUS.md showing critical issues resolved
- Updated README.md with security features and deployment checklist
- System security level upgraded from MEDIUM to HIGH
- Removed all hardcoded personal information for safe GitHub publication
- Updated to GPT-4o-mini for cost efficiency while maintaining quality
- Fixed README.md documentation inconsistency: removed reference to missing SECURITY_AUDIT.md file
- Made SECURITY_STATUS.md private by removing all public references and adding to .gitignore
- Updated public documentation to use generic security guidelines instead of referencing private files
- Updated schedule to 3 times daily at 8am, 4pm, 12am Malaysia Time (changed from every 3 hours)

## System Architecture

### Frontend Architecture
- **React + TypeScript**: Modern React application with TypeScript for type safety
- **Vite**: Fast build tool and development server
- **Tailwind CSS**: Utility-first CSS framework for styling
- **shadcn/ui**: Pre-built UI component library based on Radix UI primitives
- **TanStack Query**: Data fetching and caching library for API interactions
- **Wouter**: Lightweight client-side routing

### Backend Architecture
- **Express.js**: Node.js web framework handling API routes and middleware
- **TypeScript**: Full type safety across the backend
- **Service-oriented design**: Separated concerns with dedicated services for news, AI, email, and scheduling

### Database Layer
- **Drizzle ORM**: Type-safe SQL query builder and ORM
- **PostgreSQL**: Primary database (configured via Neon serverless)
- **Schema-first approach**: Database schema defined in shared TypeScript files

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

### Frontend Pages
- **Dashboard**: Overview with stats, recent digests, and manual triggers
- **Digests**: Browse all generated digests with status indicators
- **Email Logs**: Monitor email delivery success/failure rates
- **Schedule**: Configure automation intervals and recipients
- **Settings**: System configuration management

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