#!/bin/bash

# FMT News Digest - Persistent Scheduler Runner
# This script ensures the digest scheduler stays running

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PID_FILE="$SCRIPT_DIR/scheduler.pid"
LOG_FILE="$SCRIPT_DIR/scheduler-persistent.log"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

check_process() {
    if [ -f "$PID_FILE" ]; then
        local pid=$(cat "$PID_FILE")
        if ps -p "$pid" > /dev/null 2>&1; then
            return 0  # Process is running
        else
            rm -f "$PID_FILE"
            return 1  # Process not running
        fi
    fi
    return 1  # PID file doesn't exist
}

start_scheduler() {
    log "Starting FMT News Digest Scheduler..."
    
    # Set environment variables
    export OPENAI_API_KEY="$OPENAI_API_KEY"
    export SMTP_PASSWORD="$SMTP_PASSWORD"
    export EMAIL_USER="ricky@rickysoo.com"
    export RECIPIENT_EMAIL="ricky@rickysoo.com"
    export SMTP_HOST="mail.rickysoo.com"
    export SMTP_PORT="465"
    
    # Start the scheduler in background
    nohup node "$SCRIPT_DIR/digest-script.mjs" > "$SCRIPT_DIR/scheduler-output.log" 2>&1 &
    local pid=$!
    
    # Save PID
    echo "$pid" > "$PID_FILE"
    log "Scheduler started with PID: $pid"
    
    # Wait a moment to check if it started successfully
    sleep 3
    if check_process; then
        log "Scheduler is running successfully"
        return 0
    else
        log "Scheduler failed to start"
        return 1
    fi
}

stop_scheduler() {
    if check_process; then
        local pid=$(cat "$PID_FILE")
        log "Stopping scheduler (PID: $pid)..."
        kill "$pid" 2>/dev/null
        rm -f "$PID_FILE"
        log "Scheduler stopped"
    else
        log "Scheduler is not running"
    fi
}

restart_scheduler() {
    stop_scheduler
    sleep 2
    start_scheduler
}

status_scheduler() {
    if check_process; then
        local pid=$(cat "$PID_FILE")
        log "Scheduler is running (PID: $pid)"
        
        # Show recent log entries
        if [ -f "$SCRIPT_DIR/scheduler-output.log" ]; then
            echo "Recent scheduler output:"
            tail -10 "$SCRIPT_DIR/scheduler-output.log"
        fi
    else
        log "Scheduler is not running"
    fi
}

case "$1" in
    start)
        if check_process; then
            log "Scheduler is already running"
        else
            start_scheduler
        fi
        ;;
    stop)
        stop_scheduler
        ;;
    restart)
        restart_scheduler
        ;;
    status)
        status_scheduler
        ;;
    monitor)
        log "Starting scheduler monitor (checks every 60 seconds)..."
        while true; do
            if ! check_process; then
                log "Scheduler not running, restarting..."
                start_scheduler
            fi
            sleep 60
        done
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|status|monitor}"
        echo "Commands:"
        echo "  start   - Start the scheduler"
        echo "  stop    - Stop the scheduler"
        echo "  restart - Restart the scheduler"
        echo "  status  - Check scheduler status"
        echo "  monitor - Keep scheduler running (auto-restart if stopped)"
        exit 1
        ;;
esac