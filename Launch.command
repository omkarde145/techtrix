#!/bin/bash
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

# Ensure common Node/NPM paths are in PATH for macOS Finder double-click
export PATH="/usr/local/bin:/opt/homebrew/bin:/opt/homebrew/sbin:$HOME/.nvm/versions/node/$(ls "$HOME/.nvm/versions/node" 2>/dev/null | tail -n 1)/bin:$HOME/.volta/bin:$HOME/.fnm/current/bin:$PATH"

# Auto-detect local Wi-Fi IP address for mobile devices
WIFI_IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -n 1)

echo "=========================================================="
echo "  GraminVikas 360 v2.0 - Final Production GovTech Suite"
echo "  Ministry of Rural Development • Government of India"
echo "=========================================================="
echo ""
echo "  💻 Local Desktop URL : http://localhost:3000"
if [ -n "$WIFI_IP" ]; then
  echo "  📱 Mobile Wi-Fi URL  : http://$WIFI_IP:3000"
  echo "  📲 Mobile Field PWA  : http://$WIFI_IP:3000/field"
fi
echo ""
echo "=========================================================="

# Check if npm is found
if ! command -v npm &> /dev/null; then
  echo "Error: 'npm' could not be found in your PATH."
  echo "Please make sure Node.js is installed from https://nodejs.org"
  read -p "Press [Enter] to exit..."
  exit 1
fi

# Clean up any stale process holding port 3000 or 5001
STALE_FRONTEND=$(lsof -ti :3000 2>/dev/null)
if [ -n "$STALE_FRONTEND" ]; then
  echo "Freeing port 3000 (releasing stale process $STALE_FRONTEND)..."
  kill -9 $STALE_FRONTEND 2>/dev/null || true
  sleep 1
fi

STALE_BACKEND=$(lsof -ti :5001 2>/dev/null)
if [ -n "$STALE_BACKEND" ]; then
  echo "Freeing port 5001 (releasing stale backend $STALE_BACKEND)..."
  kill -9 $STALE_BACKEND 2>/dev/null || true
  sleep 1
fi

# Auto-install dependencies if missing on fresh clone
if [ ! -d "frontend/node_modules" ] && [ ! -d "node_modules" ]; then
  echo "Installing project dependencies..."
  npm install
fi

# Clean stale Next.js dev cache if corrupted
if [ -d "frontend/.next/cache" ]; then
  rm -rf frontend/.next/cache
fi

# Build backend if dist/server.js is missing
if [ ! -f "backend/dist/server.js" ]; then
  echo "Building backend microservice..."
  npm run build --prefix backend
fi

# Start Backend API Server
echo "Starting Backend Microservice on port 5001..."
node backend/dist/server.js &
BACKEND_PID=$!

# Trap cleanup on exit
cleanup() {
  echo ""
  echo "Shutting down GraminVikas 360 servers..."
  kill $BACKEND_PID 2>/dev/null || true
  kill $(lsof -ti :3000 2>/dev/null) 2>/dev/null || true
  exit 0
}
trap cleanup SIGINT SIGTERM EXIT

echo "Launching GraminVikas 360 on http://localhost:3000..."

# Background browser launcher: wait until port 3000 is actually listening before opening browser
(
  for i in {1..50}; do
    if lsof -i :3000 >/dev/null 2>&1; then
      sleep 1.2
      echo ""
      echo ">>> App is LIVE! Opening browser at http://localhost:3000 <<<"
      if [ -n "$WIFI_IP" ]; then
        echo ">>> To test on Mobile, open: http://$WIFI_IP:3000 on your phone <<<"
      fi
      echo ""
      open "http://localhost:3000"
      break
    fi
    sleep 0.5
  done
) &

# Run Next.js server bound to 0.0.0.0 (all network interfaces)
npm run dev --prefix frontend
