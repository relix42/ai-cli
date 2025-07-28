#!/bin/bash

# Setup Git Hooks for GrooveForge
# Installs pre-commit hooks to run tests before commits

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
HOOKS_DIR="$SCRIPT_DIR/.git/hooks"

echo "🎵⚒️ Setting up GrooveForge Git Hooks"
echo "===================================="

# Create pre-commit hook
cat > "$HOOKS_DIR/pre-commit" << 'EOF'
#!/bin/bash

# GrooveForge Pre-Commit Hook
# Runs quick tests before allowing commits

echo "🎵⚒️ Running GrooveForge pre-commit tests..."

# Get the repository root
REPO_ROOT="$(git rev-parse --show-toplevel)"
cd "$REPO_ROOT"

# Run quick tests
if ./test-quick.sh; then
    echo "✅ Pre-commit tests passed!"
    exit 0
else
    echo "❌ Pre-commit tests failed!"
    echo "💡 Fix the issues or run 'git commit --no-verify' to skip tests"
    exit 1
fi
EOF

# Make hook executable
chmod +x "$HOOKS_DIR/pre-commit"

echo "✅ Pre-commit hook installed!"
echo ""
echo "📋 What this does:"
echo "• Runs quick tests before each commit"
echo "• Prevents commits if tests fail"
echo "• Can be bypassed with 'git commit --no-verify'"
echo ""
echo "🚀 To test the hook:"
echo "   git add . && git commit -m 'test commit'"
echo ""
echo "🎵⚒️ Happy coding!"