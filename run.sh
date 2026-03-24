#!/bin/bash

# --- Configuration ---
PORT1=3000
FRPC_BIN="frpc"
FRPC_CONFIG="./frpc.toml"

echo "🧹 Cleaning up existing processes..."

# 1. Kill existing dev server
pkill -9 ^next-server 2>/dev/null
echo "✅ Port $PORT1 cleared."

# 2. Kill any existing FRPC processes
if pgrep -x "frpc" > /dev/null; then
    echo "💀 Killing existing FRPC tunnels..."
    pkill -9 frpc
    sleep 1
    echo "✅ Old FRPC processes stopped."
fi

# 3. Increase file limits (fixes EMFILE errors on macOS)
ulimit -n 65536 2>/dev/null
echo "🚀 Increased file limits (ulimit)."

# 4. Check if frpc exists (from brew)
if ! command -v $FRPC_BIN >/dev/null 2>&1; then
    echo "❌ frpc not found. Install with: brew install frp"
    exit 1
fi

# 5. Start FRPC in background
if [ -f "$FRPC_CONFIG" ]; then
    echo "🌐 Starting FRPC tunnel..."
    $FRPC_BIN -c $FRPC_CONFIG &
    sleep 2
    echo "✅ FRPC running in background."
else
    echo "⚠️ FRPC config file not found at $FRPC_CONFIG. Skipping FRPC."
fi

# 6. Start the dev server
echo "🔥 Starting MusclePals project..."
pnpm dev