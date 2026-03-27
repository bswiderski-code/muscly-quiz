#!/bin/bash

# --- Configuration ---
PORT1=3003
FRPC_BIN="frpc"
FRPC_CONFIG="./frpc.toml"

echo "🧹 Cleaning up existing processes..."

# 1. Free only this app's dev port (do not kill other Next.js instances, e.g. on 3000)
pids=$(lsof -t -iTCP:"$PORT1" -sTCP:LISTEN 2>/dev/null)
if [ -n "$pids" ]; then
    echo "💀 Stopping listener(s) on port $PORT1..."
    kill -9 $pids 2>/dev/null
fi
echo "✅ Port $PORT1 cleared."

# 2. If FRPC is already running, ask before stopping it and starting this project's tunnel
START_FRPC=true
if pgrep -x "frpc" > /dev/null; then
    echo "⚠️  frpc is already running (maybe another project or session)."
    if [ -t 0 ]; then
        read -r -p "Stop it and start FRPC for this session (${FRPC_CONFIG})? [y/N] " reply
        case "$reply" in
            [yY]|[yY][eE][sS])
                echo "💀 Stopping existing FRPC..."
                pkill -9 frpc
                sleep 1
                echo "✅ Previous FRPC stopped."
                ;;
            *)
                echo "⏭️  Keeping existing FRPC; skipping FRPC startup for this session."
                START_FRPC=false
                ;;
        esac
    else
        echo "⏭️  Non-interactive shell — not stopping existing FRPC. Skipping FRPC for this run."
        START_FRPC=false
    fi
fi

# 3. Increase file limits (fixes EMFILE errors on macOS)
ulimit -n 65536 2>/dev/null
echo "🚀 Increased file limits (ulimit)."

# 4. Check if frpc exists (only when we start a tunnel this session)
if [ "$START_FRPC" = true ]; then
    if ! command -v $FRPC_BIN >/dev/null 2>&1; then
        echo "❌ frpc not found. Install with: brew install frp"
        exit 1
    fi
fi

# 5. Start FRPC in background (when this session owns the tunnel)
if [ "$START_FRPC" = true ] && [ -f "$FRPC_CONFIG" ]; then
    echo "🌐 Starting FRPC tunnel..."
    $FRPC_BIN -c $FRPC_CONFIG &
    sleep 2
    echo "✅ FRPC running in background."
elif [ "$START_FRPC" = true ]; then
    echo "⚠️  FRPC config file not found at $FRPC_CONFIG. Skipping FRPC."
fi

# 6. Start the dev server
echo "🔥 Starting MusclePals project..."
pnpm dev
