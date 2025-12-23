#!/bin/bash

echo "🔓 Payment Bypass Lab - Automated Startup"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    exit 1
fi

# Check ngrok (optional, but recommended for Burp Suite testing)
if ! command -v ngrok &> /dev/null; then
    echo -e "${YELLOW}⚠️  Ngrok is not installed (optional)${NC}"
    echo "Install from: https://ngrok.com/download for Burp Suite testing"
    echo -e "${YELLOW}Continuing without ngrok - you can access the lab at http://localhost:3001${NC}"
    NGROK_AVAILABLE=false
else
    NGROK_AVAILABLE=true
fi

# Install dependencies if needed
if [ ! -d "backend/node_modules" ] || [ ! -d "backend/node_modules/express" ]; then
    echo -e "${YELLOW}📦 Installing backend dependencies...${NC}"
    cd backend && npm install && cd ..
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Backend dependency installation failed${NC}"
        exit 1
    fi
fi

if [ ! -d "frontend/node_modules" ] || [ ! -f "frontend/node_modules/.bin/react-scripts" ]; then
    echo -e "${YELLOW}📦 Installing frontend dependencies...${NC}"
    cd frontend && npm install && cd ..
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Frontend dependency installation failed${NC}"
        exit 1
    fi
fi

# Kill any existing processes on ports 3000 and 3001
echo -e "${YELLOW}🧹 Cleaning up existing processes...${NC}"
lsof -ti:3000 2>/dev/null | xargs kill -9 2>/dev/null
lsof -ti:3001 2>/dev/null | xargs kill -9 2>/dev/null
sleep 2

# Start backend
echo -e "${GREEN}🚀 Starting backend server...${NC}"
cd backend
npm start > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..
sleep 3

# Check if backend started
if ! curl -s http://localhost:3001/api/test > /dev/null; then
    echo -e "${RED}❌ Backend failed to start${NC}"
    cat backend.log
    exit 1
fi
echo -e "${GREEN}✅ Backend running on port 3001${NC}"

# Start frontend
echo -e "${GREEN}🎨 Starting frontend server...${NC}"
cd frontend
BROWSER=none npm start > ../frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..
sleep 8

# Check if frontend started (retry a few times as React can take time to compile)
FRONTEND_READY=false
for i in {1..20}; do
    # Check for critical errors first
    if grep -q "react-scripts: not found" frontend.log 2>/dev/null; then
        echo -e "${RED}❌ Frontend failed to start - react-scripts not found${NC}"
        echo "This should not happen. Checking frontend.log:"
        tail -10 frontend.log
        exit 1
    fi
    # Check if frontend is responding
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        FRONTEND_READY=true
        break
    fi
    sleep 2
done

if [ "$FRONTEND_READY" = false ]; then
    echo -e "${YELLOW}⚠️  Frontend is taking longer than expected to start...${NC}"
    echo "Checking frontend.log for issues:"
    tail -15 frontend.log
    echo -e "${YELLOW}Frontend may still be compiling. You can check progress in frontend.log${NC}"
else
    echo -e "${GREEN}✅ Frontend running on port 3000${NC}"
fi

# Start ngrok (if available)
NGROK_URL=""
NGROK_PID=""
if [ "$NGROK_AVAILABLE" = true ]; then
    echo -e "${GREEN}🌐 Starting ngrok...${NC}"
    ngrok http 3001 --log=stdout > ngrok.log 2>&1 &
    NGROK_PID=$!
    sleep 5

    # Get ngrok URL
    for i in {1..10}; do
        NGROK_URL=$(curl -s http://localhost:4040/api/tunnels 2>/dev/null | grep -o 'https://[^"]*\.ngrok[^"]*' | head -1)
        if [ ! -z "$NGROK_URL" ]; then
            break
        fi
        sleep 1
    done

    if [ -z "$NGROK_URL" ]; then
        echo -e "${YELLOW}⚠️  Failed to get ngrok URL (may still be starting)${NC}"
        NGROK_URL="http://localhost:3001 (ngrok starting, check ngrok.log)"
    fi
else
    NGROK_URL="http://localhost:3001"
fi

# Clean up function
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 Stopping servers...${NC}"
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    if [ ! -z "$NGROK_PID" ]; then
        kill $NGROK_PID 2>/dev/null
    fi
    lsof -ti:3000 2>/dev/null | xargs kill -9 2>/dev/null
    lsof -ti:3001 2>/dev/null | xargs kill -9 2>/dev/null
    pkill -f "ngrok http" 2>/dev/null
    exit
}

trap cleanup SIGINT SIGTERM

# Display results
echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Payment Bypass Lab is READY!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}🌐 Lab URL:${NC}"
echo -e "   ${GREEN}$NGROK_URL${NC}"
echo ""
if [ "$NGROK_AVAILABLE" = true ] && [[ "$NGROK_URL" == https://* ]]; then
    echo -e "${YELLOW}📚 Lab Pages:${NC}"
    echo -e "   Home:    ${GREEN}$NGROK_URL/${NC}"
    echo -e "   Lab 01:  ${GREEN}$NGROK_URL/lab01${NC}"
    echo -e "   Lab 02:  ${GREEN}$NGROK_URL/lab02${NC}"
    echo -e "   Lab 03:  ${GREEN}$NGROK_URL/lab03${NC}"
    echo ""
    echo -e "${YELLOW}🧪 Test API:${NC}"
    echo -e "   ${GREEN}$NGROK_URL/api/test${NC}"
    echo ""
    echo -e "${YELLOW}💡 All requests are interceptable in Burp Suite!${NC}"
else
    echo -e "${YELLOW}📚 Lab Pages (Local):${NC}"
    echo -e "   Home:    ${GREEN}http://localhost:3001/${NC}"
    echo -e "   Lab 01:  ${GREEN}http://localhost:3001/lab01${NC}"
    echo -e "   Lab 02:  ${GREEN}http://localhost:3001/lab02${NC}"
    echo -e "   Lab 03:  ${GREEN}http://localhost:3001/lab03${NC}"
    echo ""
    echo -e "${YELLOW}🧪 Test API:${NC}"
    echo -e "   ${GREEN}http://localhost:3001/api/test${NC}"
    echo ""
    if [ "$NGROK_AVAILABLE" = false ]; then
        echo -e "${YELLOW}💡 Install ngrok for Burp Suite testing: https://ngrok.com/download${NC}"
    fi
fi
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all servers${NC}"
echo ""

# Keep script running
wait

