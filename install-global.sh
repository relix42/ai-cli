#!/bin/bash

# GrooveForge Global Installation Script
# Creates a global symlink so you can run 'grooveforge' from anywhere

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
GF_SCRIPT="$SCRIPT_DIR/gf.sh"

# Check if script exists
if [ ! -f "$GF_SCRIPT" ]; then
    echo "❌ GrooveForge script not found: $GF_SCRIPT"
    exit 1
fi

# Make sure the script is executable
chmod +x "$GF_SCRIPT"

# Create symlink in /usr/local/bin (requires sudo)
echo "🎵⚒️ Installing GrooveForge globally..."
echo "📁 Source: $GF_SCRIPT"
echo "🔗 Target: /usr/local/bin/grooveforge"
echo ""
echo "This will create a global 'grooveforge' command."
echo "You may be prompted for your password (sudo required)."
echo ""

# Remove existing symlink if it exists
if [ -L "/usr/local/bin/grooveforge" ]; then
    echo "🗑️  Removing existing symlink..."
    sudo rm "/usr/local/bin/grooveforge"
fi

# Create new symlink
if sudo ln -s "$GF_SCRIPT" "/usr/local/bin/grooveforge"; then
    echo "✅ GrooveForge installed globally!"
    echo ""
    echo "🚀 You can now run 'grooveforge' from any directory:"
    echo "   grooveforge --help"
    echo "   grooveforge --prompt 'Hello GrooveForge'"
    echo "   grooveforge --prompt-interactive"
    echo ""
    echo "🎵⚒️ Find your groove, forge your future!"
else
    echo "❌ Failed to create global symlink."
    echo "💡 Alternative: Add an alias to your shell profile:"
    echo "   echo 'alias grooveforge=\"$GF_SCRIPT\"' >> ~/.bashrc"
    echo "   echo 'alias grooveforge=\"$GF_SCRIPT\"' >> ~/.zshrc"
    exit 1
fi