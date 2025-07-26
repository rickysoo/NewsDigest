#!/bin/bash
export OPENAI_API_KEY="$OPENAI_API_KEY"
export SMTP_PASSWORD="$SMTP_PASSWORD" 
export EMAIL_USER="ricky@rickysoo.com"
export RECIPIENT_EMAIL="ricky@rickysoo.com"
export SMTP_HOST="mail.rickysoo.com"
export SMTP_PORT="465"

echo "Starting FMT News Digest Scheduler..."
echo "Schedule: 8am, 4pm, 12am Malaysia Time"
node digest-script.js
