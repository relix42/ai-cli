#!/bin/bash

# GrooveForge Ollama Setup Script
echo "🦙 Setting up GrooveForge with Ollama..."

# Check if Ollama is running
if ! command -v ollama &> /dev/null; then
    echo "❌ Ollama is not installed. Please install it first:"
    echo "   curl -fsSL https://ollama.ai/install.sh | sh"
    exit 1
fi

# Check if Ollama service is running
if ! ollama list &> /dev/null; then
    echo "❌ Ollama service is not running. Please start it:"
    echo "   ollama serve"
    exit 1
fi

echo "✅ Ollama is installed and running"

# Check if llama3.2 model is available
if ! ollama list | grep -q "llama3.2"; then
    echo "📥 Downloading llama3.2 model..."
    ollama pull llama3.2
    if [ $? -ne 0 ]; then
        echo "❌ Failed to download llama3.2. You can try a different model:"
        echo "   ollama pull llama3.1"
        echo "   ollama pull codellama"
        exit 1
    fi
fi

echo "✅ llama3.2 model is available"

# Create .env file in GrooveForge directory
mkdir -p ~/.grooveforge
cat > ~/.grooveforge/.env << EOF
# GrooveForge Configuration - Ollama Local AI
CHAT_CLI_PROVIDER=ollama
OLLAMA_MODEL=llama3.2
OLLAMA_URL=http://localhost:11434

# Uncomment to use Claude instead:
# CHAT_CLI_PROVIDER=claude
# CLAUDE_API_KEY=your_api_key_here

# Uncomment to use Gemini (legacy):
# GEMINI_API_KEY=your_api_key_here
EOF

echo "✅ Configuration saved to ~/.grooveforge/.env"

# Export for current session
export CHAT_CLI_PROVIDER=ollama
export OLLAMA_MODEL=llama3.2

echo "🚀 GrooveForge is now configured for Ollama!"
echo "   Starting GrooveForge..."

# Launch GrooveForge
./gf.sh