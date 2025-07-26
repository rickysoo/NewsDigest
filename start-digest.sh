#!/bin/bash

# FMT News Digest - Production Startup Script
# This script sets up environment variables and starts the digest service

echo "🚀 Starting FMT News Digest Service..."

# Check if environment file exists
if [ -f ".env" ]; then
    echo "📋 Loading environment variables from .env file..."
    export $(grep -v '^#' .env | xargs)
else
    echo "⚠️  No .env file found. Using system environment variables."
fi

# Validate required environment variables
required_vars=("OPENAI_API_KEY" "SMTP_PASSWORD" "EMAIL_USER" "RECIPIENT_EMAIL")
missing_vars=()

for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        missing_vars+=("$var")
    fi
done

if [ ${#missing_vars[@]} -ne 0 ]; then
    echo "❌ Missing required environment variables:"
    for var in "${missing_vars[@]}"; do
        echo "   - $var"
    done
    echo ""
    echo "Please create a .env file with these variables or set them in your environment:"
    echo "Example .env file:"
    echo "OPENAI_API_KEY=your-openai-key"
    echo "SMTP_PASSWORD=your-smtp-password"
    echo "EMAIL_USER=sender@domain.com"
    echo "RECIPIENT_EMAIL=recipient@domain.com"
    echo "SMTP_HOST=smtp.gmail.com"
    echo "SMTP_PORT=587"
    exit 1
fi

# Set optional variables with defaults
export SMTP_HOST=${SMTP_HOST:-"smtp.gmail.com"}
export SMTP_PORT=${SMTP_PORT:-"587"}

echo "✅ Environment validation complete"
echo "📧 Email: ${EMAIL_USER} -> ${RECIPIENT_EMAIL}"
echo "🌐 SMTP: ${SMTP_HOST}:${SMTP_PORT}"

# Start the digest service
node digest-service.js start