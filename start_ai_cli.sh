#!/bin/bash

# AI CLI Startup Script
# Enhanced version of the Gemini CLI with custom configurations

echo "🤖 Starting AI CLI - Enhanced Gemini CLI Fork"
echo "=============================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 20+ first."
    echo "   Visit: https://nodejs.org/en/download"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo "❌ Node.js version 20+ required. Current version: $(node --version)"
    echo "   Please upgrade Node.js: https://nodejs.org/en/download"
    exit 1
fi

echo "✅ Node.js $(node --version) detected"

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check for API key configuration
if [ -z "$GEMINI_API_KEY" ] && [ -z "$GOOGLE_API_KEY" ]; then
    echo "⚠️  No API key detected. You'll need to authenticate when prompted."
    echo "   To set up an API key, visit: https://aistudio.google.com/apikey"
    echo "   Then run: export GEMINI_API_KEY=\"your_key_here\""
fi

# Build if needed
if [ ! -d "bundle" ]; then
    echo "🔨 Building AI CLI..."
    npm run build
fi

echo "🚀 Launching AI CLI..."
echo ""

# Start the CLI
npm start "$@"