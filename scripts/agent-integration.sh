#!/bin/bash

# AI CLI Agent Integration Script
# Integrates with the ai-agent-workspace session management system

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
WORKSPACE_ROOT="/Users/dhahn/projects/ai-agent-workspace"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🎵⚒️ GrooveForge Agent Integration${NC}"
echo "======================================"

# Check if agent workspace exists
if [ ! -d "$WORKSPACE_ROOT" ]; then
    echo -e "${RED}❌ Agent workspace not found at: $WORKSPACE_ROOT${NC}"
    echo "Please ensure the ai-agent-workspace is available."
    exit 1
fi

echo -e "${GREEN}✅ Agent workspace found${NC}"

# Function to update session
update_session() {
    local message="$1"
    if [ -z "$message" ]; then
        echo -e "${YELLOW}⚠️  No message provided for session update${NC}"
        return 1
    fi
    
    echo -e "${BLUE}📝 Updating session: $message${NC}"
    cd "$WORKSPACE_ROOT"
    ./session-management/update-session.sh "$message" ai-cli
    cd "$PROJECT_ROOT"
}

# Function to check for changes
check_changes() {
    echo -e "${BLUE}🔍 Checking for changes...${NC}"
    cd "$WORKSPACE_ROOT"
    ./session-management/detect-changes.sh ai-cli
    cd "$PROJECT_ROOT"
}

# Function to start agent session
start_session() {
    local agent_name="$1"
    if [ -z "$agent_name" ]; then
        echo -e "${RED}❌ Agent name required${NC}"
        echo "Usage: $0 start <agent_name>"
        exit 1
    fi
    
    echo -e "${BLUE}🚀 Starting agent session for: $agent_name${NC}"
    cd "$WORKSPACE_ROOT"
    ./session-management/agent-startup-v2.sh "$agent_name" ai-cli
    cd "$PROJECT_ROOT"
}

# Function to validate agent compliance
validate_compliance() {
    echo -e "${BLUE}✅ Validating agent compliance...${NC}"
    
    # Check for .ai-agent-config.yml
    if [ ! -f "$PROJECT_ROOT/.ai-agent-config.yml" ]; then
        echo -e "${RED}❌ Missing .ai-agent-config.yml${NC}"
        return 1
    fi
    
    # Check for docs/start-here.md
    if [ ! -f "$PROJECT_ROOT/docs/start-here.md" ]; then
        echo -e "${RED}❌ Missing docs/start-here.md${NC}"
        return 1
    fi
    
    # Check XDG compliance (no files in home directory)
    if find "$HOME" -maxdepth 1 -name "grooveforge*" -type f 2>/dev/null | grep -q .; then
        echo -e "${YELLOW}⚠️  Found grooveforge files in home directory - should use XDG locations${NC}"
    fi
    
    echo -e "${GREEN}✅ Compliance validation passed${NC}"
}

# Function to setup development environment
setup_dev_env() {
    echo -e "${BLUE}🔧 Setting up development environment...${NC}"
    
    # Create XDG directories
    mkdir -p "$HOME/.config/grooveforge"
    mkdir -p "$HOME/.local/share/grooveforge"
    mkdir -p "$HOME/.cache/grooveforge"
    mkdir -p "$HOME/.local/state/grooveforge"
    
    echo -e "${GREEN}✅ XDG directories created${NC}"
    
    # Check Node.js version
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
        if [ "$NODE_VERSION" -ge 20 ]; then
            echo -e "${GREEN}✅ Node.js $(node --version) detected${NC}"
        else
            echo -e "${RED}❌ Node.js 20+ required. Current: $(node --version)${NC}"
            return 1
        fi
    else
        echo -e "${RED}❌ Node.js not found${NC}"
        return 1
    fi
    
    # Install dependencies if needed
    if [ ! -d "$PROJECT_ROOT/node_modules" ]; then
        echo -e "${BLUE}📦 Installing dependencies...${NC}"
        cd "$PROJECT_ROOT"
        npm install
    fi
    
    echo -e "${GREEN}✅ Development environment ready${NC}"
}

# Main command handling
case "$1" in
    "session")
        update_session "$2"
        ;;
    "check")
        check_changes
        ;;
    "start")
        start_session "$2"
        ;;
    "validate")
        validate_compliance
        ;;
    "setup")
        setup_dev_env
        ;;
    "help"|"--help"|"-h"|"")
        echo "AI CLI Agent Integration Script"
        echo ""
        echo "Usage: $0 <command> [arguments]"
        echo ""
        echo "Commands:"
        echo "  session <message>  - Update session with message"
        echo "  check             - Check for changes"
        echo "  start <agent>     - Start agent session"
        echo "  validate          - Validate compliance"
        echo "  setup             - Setup development environment"
        echo "  help              - Show this help"
        echo ""
        echo "Examples:"
        echo "  $0 setup"
        echo "  $0 start SamuelBlue"
        echo "  $0 session \"Added new feature\""
        echo "  $0 check"
        echo "  $0 validate"
        ;;
    *)
        echo -e "${RED}❌ Unknown command: $1${NC}"
        echo "Use '$0 help' for usage information"
        exit 1
        ;;
esac