# Contributing to FMT News Digest

Thank you for your interest in contributing to the FMT News Digest project! This guide will help you get started.

## Development Setup

### Prerequisites
- Node.js 18.0.0 or higher
- Git
- OpenAI API key
- SMTP email account

### Quick Setup
```bash
# Clone the repository
git clone https://github.com/[username]/fmt-news-digest.git
cd fmt-news-digest

# Install dependencies
npm install

# Set up executable permissions
npm run setup

# Create your .env file
cp .env.example .env
# Edit .env with your actual credentials
```

## Project Structure

```
fmt-news-digest/
├── digest-script.js          # Main digest generation script
├── digest-cli.cjs            # Command-line interface (16 commands)
├── digest                    # CLI wrapper script
├── image-converter.js        # Image processing utilities
├── start-digest-background.sh # Scheduler startup
├── watchdog-scheduler.sh     # Process monitoring
├── start-watchdog.sh         # Watchdog startup
└── setup-local.sh           # Local setup automation
```

## Development Workflow

### Making Changes

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Test your changes**
   ```bash
   # Test digest generation
   ./digest test
   
   # Check system status
   ./digest status
   
   # View logs
   ./digest logs
   ```

3. **Run the CLI to verify functionality**
   ```bash
   ./digest config          # Check configuration
   ./digest start           # Start services
   ./digest stop            # Stop services
   ```

### Code Standards

- Use meaningful variable and function names
- Add comments for complex logic
- Follow existing code formatting
- Test all CLI commands after changes
- Ensure background processes work correctly

### Testing Guidelines

- Always test with `./digest test` before committing
- Verify watchdog functionality with `./digest status`
- Test configuration changes with `./digest config`
- Check email delivery in test mode

## Pull Request Process

1. Update documentation if you've changed functionality
2. Test all CLI commands work correctly
3. Ensure the watchdog system functions properly
4. Update README.md if needed
5. Submit pull request with clear description

## CLI Command Reference

For contributors working on CLI functionality:

```bash
# Configuration commands
./digest config                      # Show settings
./digest source <url>                # Set news source
./digest interval <minutes>          # Set digest interval
./digest recipient add <email>       # Add recipient
./digest recipient remove <email>    # Remove recipient

# Operation commands
./digest start                       # Start all services
./digest stop                        # Stop all services
./digest restart                     # Restart services
./digest test                        # Send test digest
./digest status                      # Show system status

# System commands
./digest enable                      # Enable system
./digest disable                     # Disable system
./digest logs                        # View logs
```

## Reporting Issues

When reporting bugs:
1. Include system status: `./digest status`
2. Provide recent logs: `./digest logs`
3. Describe expected vs actual behavior
4. Include configuration: `./digest config`

## Feature Requests

We welcome suggestions for:
- Additional news sources
- Enhanced email templates
- Improved CLI functionality
- Better monitoring capabilities
- Performance optimizations

## License

By contributing, you agree that your contributions will be licensed under the MIT License.