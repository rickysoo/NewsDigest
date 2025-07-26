#!/bin/bash

# FMT News Digest Startup Script
# Starts the automated digest script as a background service

echo "Starting FMT News Digest Service..."

# Kill any existing digest processes
pkill -f "digest-script.js" 2>/dev/null

# Set environment variables from Replit secrets
export OPENAI_API_KEY="${OPENAI_API_KEY}"
export SMTP_PASSWORD="${SMTP_PASSWORD}"
export EMAIL_USER="ricky@rickysoo.com"
export RECIPIENT_EMAIL="ricky@rickysoo.com"
export SMTP_HOST="mail.rickysoo.com"
export SMTP_PORT="465"

# Start the digest script
cd /home/runner/workspace
nohup node digest-script.js > digest-service.log 2>&1 &

# Get the process ID
PID=$!
echo "FMT News Digest started with PID: $PID"

# Wait a moment and check if it's still running
sleep 3
if kill -0 $PID 2>/dev/null; then
    echo "✅ Service started successfully"
    echo "📅 Schedule: Every 3 hours starting at midnight"
    echo "📧 Sending to: ricky@rickysoo.com"
    echo "📝 Logs: digest-service.log"
    echo "🛑 To stop: pkill -f 'digest-script.js'"
else
    echo "❌ Service failed to start"
    echo "Check digest-service.log for errors"
fi