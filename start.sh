#!/bin/bash

# Implied Volatility Surface Construction - Development Startup Script

echo "🚀 Starting Implied Volatility Surface Construction"
echo "=================================================="

# Get the directory where this script is located
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
cd "$DIR"

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if a port is available
port_available() {
    ! lsof -i:$1 >/dev/null 2>&1
}

# Check dependencies
echo "🔍 Checking dependencies..."

if ! command_exists python3; then
    echo "❌ Python 3 is required but not installed."
    exit 1
fi

if ! command_exists npm; then
    echo "❌ Node.js and npm are required but not installed."
    exit 1
fi

echo "✅ Dependencies found"

# Check if backend port is available
BACKEND_PORT=8000
if ! port_available $BACKEND_PORT; then
    echo "⚠️  Port $BACKEND_PORT is already in use. Trying to kill existing process..."
    lsof -ti:$BACKEND_PORT | xargs kill -9 2>/dev/null || true
    sleep 2
fi

# Check if frontend port is available
FRONTEND_PORT=3000
if ! port_available $FRONTEND_PORT; then
    echo "⚠️  Port $FRONTEND_PORT is already in use. Trying to kill existing process..."
    lsof -ti:$FRONTEND_PORT | xargs kill -9 2>/dev/null || true
    sleep 2
fi

# Install frontend dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
fi

# Function to cleanup on exit
cleanup() {
    echo -e "\n🛑 Shutting down servers..."
    jobs -p | xargs kill 2>/dev/null || true
    exit 0
}

trap cleanup SIGINT SIGTERM

# Start backend server
echo "🐍 Starting Python backend on port $BACKEND_PORT..."
python3 server.py $BACKEND_PORT &
BACKEND_PID=$!

# Wait for backend to start
echo "⏳ Waiting for backend to start..."
sleep 3

# Test backend health
if curl -s http://localhost:$BACKEND_PORT/api/health >/dev/null; then
    echo "✅ Backend is running"
else
    echo "❌ Backend failed to start"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

# Start frontend server
echo "⚛️  Starting React frontend on port $FRONTEND_PORT..."
npm start &
FRONTEND_PID=$!

echo ""
echo "🎉 Applications started successfully!"
echo "==============================================="
echo "📊 Frontend: http://localhost:$FRONTEND_PORT"
echo "🔧 Backend:  http://localhost:$BACKEND_PORT"
echo "📋 API Docs: http://localhost:$BACKEND_PORT/api/health"
echo ""
echo "Press Ctrl+C to stop all servers"
echo ""

# Wait for any background job to finish
wait