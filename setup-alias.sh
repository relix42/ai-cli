#!/bin/bash

# GrooveForge Alias Setup Script
# Creates shell aliases so you can run 'grooveforge' from anywhere

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
GF_SCRIPT="$SCRIPT_DIR/gf.sh"

echo "🎵⚒️ Setting up GrooveForge alias..."
echo "📁 GrooveForge location: $GF_SCRIPT"
echo ""

# Make sure the script is executable
chmod +x "$GF_SCRIPT"

# Detect shell
SHELL_NAME=$(basename "$SHELL")
case "$SHELL_NAME" in
    "zsh")
        PROFILE_FILE="$HOME/.zshrc"
        ;;
    "bash")
        PROFILE_FILE="$HOME/.bashrc"
        ;;
    *)
        echo "⚠️  Unknown shell: $SHELL_NAME"
        echo "💡 Please manually add this alias to your shell profile:"
        echo "   alias grooveforge=\"$GF_SCRIPT\""
        exit 1
        ;;
esac

echo "🔍 Detected shell: $SHELL_NAME"
echo "📝 Profile file: $PROFILE_FILE"
echo ""

# Check if alias already exists
if grep -q "alias grooveforge=" "$PROFILE_FILE" 2>/dev/null; then
    echo "✅ GrooveForge alias already exists in $PROFILE_FILE"
    echo ""
    echo "🔄 To update it, run:"
    echo "   sed -i.bak '/alias grooveforge=/d' $PROFILE_FILE"
    echo "   echo 'alias grooveforge=\"$GF_SCRIPT\"' >> $PROFILE_FILE"
else
    # Add alias to profile
    echo "➕ Adding GrooveForge alias to $PROFILE_FILE..."
    echo "" >> "$PROFILE_FILE"
    echo "# GrooveForge - Find your groove, forge your future" >> "$PROFILE_FILE"
    echo "alias grooveforge=\"$GF_SCRIPT\"" >> "$PROFILE_FILE"
    echo "alias gf=\"$GF_SCRIPT\"" >> "$PROFILE_FILE"
    echo "" >> "$PROFILE_FILE"
    
    echo "✅ GrooveForge aliases added successfully!"
fi

echo ""
echo "🚀 Usage options:"
echo "   grooveforge --help"
echo "   grooveforge --prompt 'Hello GrooveForge'"
echo "   grooveforge --prompt-interactive"
echo "   gf --prompt 'Quick access with gf alias'"
echo ""
echo "🔄 To use the aliases immediately:"
echo "   source $PROFILE_FILE"
echo ""
echo "🎵⚒️ Find your groove, forge your future!"