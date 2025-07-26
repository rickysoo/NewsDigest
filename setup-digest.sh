#!/bin/bash

# FMT News Digest Script Setup
# This script helps you set up the automated news digest

echo "🗞️  FMT News Digest Setup"
echo "=========================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first:"
    echo "   Visit: https://nodejs.org"
    exit 1
fi

echo "✅ Node.js detected: $(node --version)"

# Check if required packages are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing required packages..."
    npm install node-cron cheerio openai nodemailer
else
    echo "✅ Packages already installed"
fi

echo ""
echo "🔧 Environment Setup"
echo "===================="
echo ""

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating .env file for your configuration..."
    cat > .env << 'EOF'
# OpenAI API Key (required)
# Get from: https://platform.openai.com/api-keys
OPENAI_API_KEY=your_openai_api_key_here

# Email Configuration (required)
# Your Gmail address and app password
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password_here

# Recipient Email (required)
# Where to send the digest
RECIPIENT_EMAIL=recipient@example.com

# SMTP Configuration (optional - defaults to Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
EOF
    echo "✅ Created .env file"
else
    echo "✅ .env file already exists"
fi

echo ""
echo "📝 Next Steps:"
echo "=============="
echo ""
echo "1. Edit the .env file with your actual credentials:"
echo "   nano .env"
echo ""
echo "2. Get your OpenAI API key:"
echo "   - Go to https://platform.openai.com/api-keys"
echo "   - Create a new API key"
echo "   - Copy it to OPENAI_API_KEY in .env"
echo ""
echo "3. Set up Gmail app password (if using Gmail):"
echo "   - Go to Google Account settings"
echo "   - Enable 2-factor authentication"
echo "   - Generate an app password for 'Mail'"
echo "   - Use that password (not your regular password) in EMAIL_PASS"
echo ""
echo "4. Test the script:"
echo "   node digest-script.js --test"
echo ""
echo "5. Start the automated scheduler:"
echo "   node digest-script.js"
echo ""
echo "📅 The script will run every 3 hours starting at midnight (12am, 3am, 6am, etc.)"
echo ""