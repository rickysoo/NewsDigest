#!/bin/bash

# Watchdog script to ensure digest scheduler keeps running
# This script checks every 60 minutes if the scheduler is running
# and restarts it if needed

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOGFILE="$SCRIPT_DIR/watchdog.log"
PIDFILE="$SCRIPT_DIR/watchdog.pid"

# Function to log with timestamp
log() {
    echo "$(date): $1" | tee -a "$LOGFILE"
}

# Function to check if digest scheduler is running
is_scheduler_running() {
    if pgrep -f "digest-script.js" > /dev/null; then
        return 0  # Running
    else
        return 1  # Not running
    fi
}

# Function to start scheduler
start_scheduler() {
    log "Starting digest scheduler..."
    cd "$SCRIPT_DIR"
    ./start-digest-background.sh
    if [ $? -eq 0 ]; then
        log "Scheduler started successfully"
    else
        log "Failed to start scheduler"
    fi
}

# Main watchdog loop
main() {
    log "Watchdog started - monitoring digest scheduler"
    
    while true; do
        if ! is_scheduler_running; then
            log "Scheduler not running - attempting restart"
            start_scheduler
        else
            log "Scheduler is running normally"
        fi
        
        # Wait 60 minutes before next check
        sleep 3600
    done
}

# Handle script termination
cleanup() {
    log "Watchdog stopping..."
    rm -f "$PIDFILE"
    exit 0
}

trap cleanup SIGTERM SIGINT

# Save PID for management
echo $$ > "$PIDFILE"

# Start watchdog
main