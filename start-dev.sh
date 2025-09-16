#!/bin/bash

echo "🚀 Starting CryptoPay React Development Server..."
echo ""
echo "📋 Pre-flight checklist:"
echo "✅ Node.js 18+ installed"
echo "✅ npm dependencies installed"
echo "✅ Firebase config updated"
echo "✅ Contract addresses configured"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

echo "🔥 Starting Vite development server..."
echo "🌐 Application will be available at: http://localhost:3000"
echo ""

npm run dev
