#!/bin/bash

# Simple background scheduler starter for FMT News Digest
# This is the most reliable way to keep the scheduler running

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_FILE="$SCRIPT_DIR/digest-background.log"

# Kill any existing scheduler processes
pkill -f digest-script.js 2>/dev/null || true
sleep 2

echo "$(date): Starting FMT News Digest Background Scheduler..." | tee -a "$LOG_FILE"

# Set environment variables
export OPENAI_API_KEY="$OPENAI_API_KEY"
export SMTP_PASSWORD="$SMTP_PASSWORD"
export EMAIL_USER="ricky@rickysoo.com"
export RECIPIENT_EMAIL="ricky@rickysoo.com"
export SMTP_HOST="mail.rickysoo.com"
export SMTP_PORT="465"

# Start the digest script with nohup for persistence
nohup node "$SCRIPT_DIR/digest-script.js" >> "$LOG_FILE" 2>&1 &
PID=$!

echo "$(date): Scheduler started with PID: $PID" | tee -a "$LOG_FILE"
echo "$PID" > "$SCRIPT_DIR/digest.pid"

# Wait a moment and verify it's running
sleep 3
if ps -p "$PID" > /dev/null; then
    echo "$(date): Scheduler confirmed running successfully" | tee -a "$LOG_FILE"
    echo "✅ FMT News Digest scheduler is now running in background"
    echo "📄 Logs: tail -f $LOG_FILE"
    echo "🔄 Schedule: 8am, 4pm, 12am Malaysia Time"
    echo "🛑 To stop: pkill -f digest-script.js"
else
    echo "$(date): ERROR - Scheduler failed to start" | tee -a "$LOG_FILE"
    echo "❌ Failed to start scheduler. Check $LOG_FILE for details."
    exit 1
fi