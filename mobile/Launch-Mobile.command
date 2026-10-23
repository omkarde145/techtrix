#!/bin/bash
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

export PATH="/usr/local/bin:/opt/homebrew/bin:/opt/homebrew/sbin:$HOME/.nvm/versions/node/$(ls "$HOME/.nvm/versions/node" 2>/dev/null | tail -n 1)/bin:$HOME/.volta/bin:$HOME/.fnm/current/bin:$PATH"

WIFI_IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -n 1)

echo "=========================================================="
echo "  GraminVikas 360 v2.0 - Mobile App Runner (iOS & Android)"
echo "  Ministry of Rural Development • Government of India"
echo "=========================================================="
echo ""
echo "  📱 Mobile Simulator URL : http://localhost:8080"
if [ -n "$WIFI_IP" ]; then
  echo "  📲 Test on Phone Wi-Fi  : http://$WIFI_IP:8080"
fi
echo ""
echo "=========================================================="

if ! command -v node &> /dev/null; then
  echo "Error: Node.js is required. Please install Node.js from https://nodejs.org"
  read -p "Press [Enter] to exit..."
  exit 1
fi

node serve-preview.js
