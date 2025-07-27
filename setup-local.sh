#!/bin/bash

# Setup script for local installation
echo "🚀 Setting up FMT News Digest for local installation..."

# Copy standalone package.json
if [ -f "package-standalone.json" ]; then
    cp package-standalone.json package.json
    echo "✅ Package configuration updated for standalone mode"
fi

# Copy standalone README
if [ -f "README-standalone.md" ]; then
    cp README-standalone.md README.md
    echo "✅ README updated for standalone version"
fi

# Make scripts executable
chmod +x digest
chmod +x digest-cli.cjs
chmod +x start-digest-background.sh
chmod +x watchdog-scheduler.sh
chmod +x start-watchdog.sh
chmod +x run-scheduler.sh
chmod +x keepalive-scheduler.sh

echo "✅ All scripts made executable"

# Create .env.example if it doesn't exist
if [ ! -f ".env.example" ]; then
    cat > .env.example << 'EOF'
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Email Configuration
EMAIL_USER=your_email@domain.com
SMTP_PASSWORD=your_email_password
SMTP_HOST=your_smtp_server
SMTP_PORT=465

# Recipient Configuration
RECIPIENT_EMAIL=recipient@domain.com
EOF
    echo "✅ Created .env.example file"
fi

echo ""
echo "🎉 Setup complete! Next steps:"
echo ""
echo "1. Install dependencies:"
echo "   npm install"
echo ""
echo "2. Create your .env file:"
echo "   cp .env.example .env"
echo "   # Edit .env with your actual credentials"
echo ""
echo "3. Start the system:"
echo "   ./digest start"
echo ""
echo "4. Check status:"
echo "   ./digest status"
echo ""
echo "5. Send test digest:"
echo "   ./digest test"