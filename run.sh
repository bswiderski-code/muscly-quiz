#!/bin/bash

# --- Configuration ---
PORT1=3000

echo "🧹 Cleaning up existing processes..."

# 1. Kill by port
pkill -9 ^next-server

echo "✅ Port $PORT1 cleared."

# 3. Increase file limits (fixes EMFILE errors on macOS)
ulimit -n 65536 2>/dev/null
echo "🚀 Increased file limits (ulimit)."

# 4. Start the project
echo "🔥 Starting MusclePals project..."
pnpm dev
