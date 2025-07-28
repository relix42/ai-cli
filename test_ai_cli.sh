#!/bin/bash

# Chat CLI Test Script
# Tests the basic functionality of Chat CLI

echo "🧪 Testing Chat CLI Functionality"
echo "=================================="

# Test 1: Check if CLI starts without errors
echo "📋 Test 1: CLI Help Command"
if node scripts/start.js --help > /dev/null 2>&1; then
    echo "✅ CLI help command works"
else
    echo "❌ CLI help command failed"
    exit 1
fi

# Test 2: Check version
echo "📋 Test 2: Version Check"
if node scripts/start.js --version > /dev/null 2>&1; then
    echo "✅ Version command works"
else
    echo "❌ Version command failed"
    exit 1
fi

# Test 3: Check list extensions
echo "📋 Test 3: List Extensions"
if node scripts/start.js --list-extensions > /dev/null 2>&1; then
    echo "✅ List extensions works"
else
    echo "❌ List extensions failed"
    exit 1
fi

# Test 4: Agent integration validation
echo "📋 Test 4: Agent Integration"
if ./scripts/agent-integration.sh validate > /dev/null 2>&1; then
    echo "✅ Agent integration validation passed"
else
    echo "❌ Agent integration validation failed"
    exit 1
fi

# Test 5: Build verification
echo "📋 Test 5: Build Verification"
if [ -d "bundle" ] && [ -f "bundle/gemini.js" ]; then
    echo "✅ Build output exists"
else
    echo "❌ Build output missing"
    exit 1
fi

echo ""
echo "🎉 All tests passed! Chat CLI is ready for development."
echo ""
echo "🚀 Next steps:"
echo "   1. Set up provider (CHAT_CLI_PROVIDER=ollama or claude)"
echo "   2. Run: ./start_chat_cli.sh"
echo "   3. Start chatting with AI models!"