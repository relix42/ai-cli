# GrooveForge Environment Configuration
# Add this to your ~/.bashrc, ~/.zshrc, or ~/.profile

# Ollama Configuration (Local AI - Recommended)
export CHAT_CLI_PROVIDER="ollama"
export OLLAMA_MODEL="llama3.2"
export OLLAMA_URL="http://localhost:11434"

# Alternative: Claude API Configuration
# export CHAT_CLI_PROVIDER="claude"
# export CLAUDE_API_KEY="your_api_key_here"

# Alternative: Gemini API Configuration (Legacy)
# export GEMINI_API_KEY="your_api_key_here"

echo "🎵⚒️ GrooveForge environment configured for $CHAT_CLI_PROVIDER"