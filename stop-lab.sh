#!/bin/bash

echo "🛑 Stopping Payment Bypass Lab..."

# Kill processes
lsof -ti:3000 2>/dev/null | xargs kill -9 2>/dev/null
lsof -ti:3001 2>/dev/null | xargs kill -9 2>/dev/null
pkill -f "ngrok http" 2>/dev/null

echo "✅ All servers stopped"

