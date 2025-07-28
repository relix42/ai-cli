#!/bin/bash

# GrooveForge Startup Script
# Find your groove, forge your future with AI
# Integrated with ai-agent-workspace

echo "🎵⚒️ Starting GrooveForge - Find Your Groove, Forge Your Future"
echo "========================================================"
echo "🔗 Agent Workspace Integration Enabled"

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

# Agent workspace integration
if [ -f "./scripts/agent-integration.sh" ]; then
    echo "🔧 Setting up agent workspace integration..."
    ./scripts/agent-integration.sh setup
else
    echo "⚠️  Agent integration script not found - continuing without workspace integration"
fi

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check for API key configuration
if [ -z "$CHAT_CLI_PROVIDER" ]; then
    echo "⚠️  No provider configured. Please set up Ollama or Claude:"
    echo "   For Ollama: export CHAT_CLI_PROVIDER=\"ollama\" && export OLLAMA_MODEL=\"llama2\""
    echo "   For Claude: export CHAT_CLI_PROVIDER=\"claude\" && export CLAUDE_API_KEY=\"your_key\""
    echo "   Then find your groove and start forging with AI!"
fi

# Build if needed
if [ ! -d "bundle" ]; then
    echo "🔨 Building GrooveForge..."
    npm run build
fi

echo "🚀 Launching GrooveForge..."
echo ""

# Start the CLI - use -- to separate npm args from application args
npm start -- "$@"