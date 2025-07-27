#!/bin/bash

# FMT News Digest - Keep Alive Script
# Run this script to ensure the scheduler stays running permanently

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Starting FMT News Digest Keep-Alive Monitor..."
echo "This will ensure the scheduler restarts automatically if it stops."
echo "Press Ctrl+C to stop monitoring."

# Start monitoring
"$SCRIPT_DIR/run-scheduler.sh" monitor