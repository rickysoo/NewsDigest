#!/bin/bash

# Start the watchdog in background to monitor scheduler
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PIDFILE="$SCRIPT_DIR/watchdog.pid"

# Check if watchdog is already running
if [ -f "$PIDFILE" ]; then
    PID=$(cat "$PIDFILE")
    if ps -p "$PID" > /dev/null 2>&1; then
        echo "Watchdog is already running (PID: $PID)"
        exit 0
    else
        rm -f "$PIDFILE"
    fi
fi

# Start watchdog in background
echo "$(date): Starting watchdog to monitor digest scheduler..."
nohup ./watchdog-scheduler.sh > /dev/null 2>&1 &
WATCHDOG_PID=$!

# Give it a moment to start
sleep 2

if ps -p "$WATCHDOG_PID" > /dev/null 2>&1; then
    echo "$(date): Watchdog started successfully (PID: $WATCHDOG_PID)"
    echo "✅ System is now monitored - scheduler will auto-restart if it stops"
    echo "📄 Watchdog logs: tail -f watchdog.log"
    echo "🛑 To stop watchdog: pkill -f watchdog-scheduler.sh"
else
    echo "$(date): Failed to start watchdog"
    exit 1
fi