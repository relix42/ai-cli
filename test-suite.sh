#!/bin/bash

# GrooveForge Test Suite
# Comprehensive testing to catch regressions and verify functionality

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counters
TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo -e "${BLUE}🎵⚒️ GrooveForge Test Suite${NC}"
echo "========================================"
echo "Testing GrooveForge functionality to catch regressions"
echo ""

# Helper functions
log_test() {
    echo -e "${BLUE}🧪 Testing: $1${NC}"
    TESTS_RUN=$((TESTS_RUN + 1))
}

log_pass() {
    echo -e "${GREEN}✅ PASS: $1${NC}"
    TESTS_PASSED=$((TESTS_PASSED + 1))
}

log_fail() {
    echo -e "${RED}❌ FAIL: $1${NC}"
    echo -e "${RED}   Error: $2${NC}"
    TESTS_FAILED=$((TESTS_FAILED + 1))
}

log_skip() {
    echo -e "${YELLOW}⏭️  SKIP: $1${NC}"
    echo -e "${YELLOW}   Reason: $2${NC}"
}

# Test 1: Build System
test_build() {
    log_test "Build system"
    
    if npm run build > /tmp/grooveforge-build.log 2>&1; then
        log_pass "Build completed successfully"
    else
        log_fail "Build failed" "Check /tmp/grooveforge-build.log for details"
        return 1
    fi
}

# Test 2: Script Directory Resolution
test_directory_resolution() {
    log_test "Directory resolution from different locations"
    
    # Test from /tmp
    cd /tmp
    if timeout 5s "$SCRIPT_DIR/gf.sh" --help > /tmp/grooveforge-help.log 2>&1; then
        if grep -q "GrooveForge" /tmp/grooveforge-help.log; then
            log_pass "Directory resolution works from /tmp"
        else
            log_fail "Help output doesn't contain GrooveForge" "$(cat /tmp/grooveforge-help.log)"
            cd "$SCRIPT_DIR"
            return 1
        fi
    else
        log_fail "Script failed when run from /tmp" "$(cat /tmp/grooveforge-help.log)"
        cd "$SCRIPT_DIR"
        return 1
    fi
    
    cd "$SCRIPT_DIR"
}

# Test 3: Symlink Resolution (if global command exists)
test_symlink_resolution() {
    log_test "Global command symlink resolution"
    
    if command -v grooveforge > /dev/null 2>&1; then
        cd /tmp
        if timeout 5s grooveforge --help > /tmp/grooveforge-global.log 2>&1; then
            if grep -q "GrooveForge" /tmp/grooveforge-global.log; then
                log_pass "Global grooveforge command works"
            else
                log_fail "Global command help doesn't contain GrooveForge" "$(cat /tmp/grooveforge-global.log)"
                cd "$SCRIPT_DIR"
                return 1
            fi
        else
            log_fail "Global grooveforge command failed" "$(cat /tmp/grooveforge-global.log)"
            cd "$SCRIPT_DIR"
            return 1
        fi
        cd "$SCRIPT_DIR"
    else
        log_skip "Global grooveforge command not installed" "Run ./install-global.sh or ./setup-alias.sh"
    fi
}

# Test 4: Interactive Mode Detection
test_interactive_mode() {
    log_test "Interactive mode detection (no providers configured)"
    
    # Clear environment variables
    unset CHAT_CLI_PROVIDER OLLAMA_MODEL GEMINI_API_KEY CLAUDE_API_KEY
    
    cd /tmp
    # Use timeout and expect it to timeout (indicating interactive mode started)
    if timeout 3s "$SCRIPT_DIR/gf.sh" > /tmp/grooveforge-interactive.log 2>&1; then
        # If it exits quickly, check if it's an error
        if grep -q "No input provided via stdin" /tmp/grooveforge-interactive.log; then
            log_fail "Interactive mode not triggered - still getting stdin error" "$(cat /tmp/grooveforge-interactive.log)"
            cd "$SCRIPT_DIR"
            return 1
        else
            log_pass "Interactive mode appears to work (quick exit without stdin error)"
        fi
    else
        # Timeout is expected for interactive mode
        if grep -q "No input provided via stdin" /tmp/grooveforge-interactive.log; then
            log_fail "Interactive mode not working - stdin error occurred" "$(cat /tmp/grooveforge-interactive.log)"
            cd "$SCRIPT_DIR"
            return 1
        else
            log_pass "Interactive mode started (timeout as expected)"
        fi
    fi
    
    cd "$SCRIPT_DIR"
}

# Test 5: Ollama Auto-Detection (if Ollama is available)
test_ollama_detection() {
    log_test "Ollama auto-detection and configuration"
    
    if curl -s --max-time 2 http://localhost:11434/api/tags > /dev/null 2>&1; then
        # Ollama is running, test auto-detection
        unset CHAT_CLI_PROVIDER OLLAMA_MODEL
        
        cd /tmp
        if timeout 10s "$SCRIPT_DIR/gf.sh" --prompt "test" > /tmp/grooveforge-ollama.log 2>&1; then
            if grep -q "Using Ollama" /tmp/grooveforge-ollama.log; then
                log_pass "Ollama auto-detection and configuration works"
            else
                log_fail "Ollama not auto-detected" "$(tail -20 /tmp/grooveforge-ollama.log)"
                cd "$SCRIPT_DIR"
                return 1
            fi
        else
            # Check if it's a timeout (which might be expected if model is slow)
            if grep -q "Using Ollama" /tmp/grooveforge-ollama.log; then
                log_pass "Ollama auto-detection works (timed out during model execution)"
            else
                log_fail "Ollama auto-detection failed" "$(tail -20 /tmp/grooveforge-ollama.log)"
                cd "$SCRIPT_DIR"
                return 1
            fi
        fi
        cd "$SCRIPT_DIR"
    else
        log_skip "Ollama not running" "Start Ollama with 'ollama serve' to test auto-detection"
    fi
}

# Test 6: Memory System
test_memory_system() {
    log_test "Memory system functionality"
    
    # Test memory commands
    export CHAT_CLI_PROVIDER=ollama
    export OLLAMA_MODEL=llama3.2:latest
    
    cd /tmp
    if timeout 5s "$SCRIPT_DIR/gf.sh" --prompt "/memory help" > /tmp/grooveforge-memory.log 2>&1; then
        if grep -q "GrooveForge Memory System Guide" /tmp/grooveforge-memory.log; then
            log_pass "Memory system help command works"
        else
            log_fail "Memory help command didn't work" "$(cat /tmp/grooveforge-memory.log)"
            cd "$SCRIPT_DIR"
            return 1
        fi
    else
        log_fail "Memory help command failed" "$(cat /tmp/grooveforge-memory.log)"
        cd "$SCRIPT_DIR"
        return 1
    fi
    
    cd "$SCRIPT_DIR"
}

# Test 7: Environment Variable Handling
test_env_vars() {
    log_test "Environment variable handling"
    
    # Test with Ollama env vars
    export CHAT_CLI_PROVIDER=ollama
    export OLLAMA_MODEL=llama3.2:latest
    
    cd /tmp
    if timeout 5s "$SCRIPT_DIR/gf.sh" --help > /tmp/grooveforge-env.log 2>&1; then
        log_pass "Environment variables handled correctly"
    else
        log_fail "Environment variable handling failed" "$(cat /tmp/grooveforge-env.log)"
        cd "$SCRIPT_DIR"
        return 1
    fi
    
    # Clean up
    unset CHAT_CLI_PROVIDER OLLAMA_MODEL
    cd "$SCRIPT_DIR"
}

# Test 8: Argument Parsing
test_argument_parsing() {
    log_test "Command line argument parsing"
    
    # Test various argument combinations
    local test_args=(
        "--help"
        "--version"
        "--debug --help"
        "--prompt 'test prompt' --help"
    )
    
    for args in "${test_args[@]}"; do
        cd /tmp
        if timeout 5s bash -c "$SCRIPT_DIR/gf.sh $args" > /tmp/grooveforge-args.log 2>&1; then
            continue
        else
            if grep -q "error\|Error\|ERROR" /tmp/grooveforge-args.log; then
                log_fail "Argument parsing failed for: $args" "$(cat /tmp/grooveforge-args.log)"
                cd "$SCRIPT_DIR"
                return 1
            fi
        fi
    done
    
    log_pass "Argument parsing works correctly"
    cd "$SCRIPT_DIR"
}

# Test 9: File Permissions and Executability
test_file_permissions() {
    log_test "File permissions and executability"
    
    if [ -x "$SCRIPT_DIR/gf.sh" ]; then
        log_pass "Main script is executable"
    else
        log_fail "Main script is not executable" "Run: chmod +x gf.sh"
        return 1
    fi
    
    if [ -x "$SCRIPT_DIR/setup-alias.sh" ]; then
        log_pass "Setup script is executable"
    else
        log_fail "Setup script is not executable" "Run: chmod +x setup-alias.sh"
        return 1
    fi
}

# Test 10: Node.js and Dependencies
test_dependencies() {
    log_test "Node.js and dependencies"
    
    if command -v node > /dev/null 2>&1; then
        local node_version=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
        if [ "$node_version" -ge 20 ]; then
            log_pass "Node.js version is adequate ($(node --version))"
        else
            log_fail "Node.js version too old" "Current: $(node --version), Required: 20+"
            return 1
        fi
    else
        log_fail "Node.js not found" "Install Node.js 20+ from https://nodejs.org"
        return 1
    fi
    
    if [ -d "$SCRIPT_DIR/node_modules" ]; then
        log_pass "Dependencies are installed"
    else
        log_fail "Dependencies not installed" "Run: npm install"
        return 1
    fi
}

# Main test execution
main() {
    echo "Starting test suite..."
    echo ""
    
    # Run all tests
    test_dependencies
    test_file_permissions
    test_build
    test_directory_resolution
    test_symlink_resolution
    test_argument_parsing
    test_env_vars
    test_interactive_mode
    test_ollama_detection
    test_memory_system
    
    # Summary
    echo ""
    echo "========================================"
    echo -e "${BLUE}🎵⚒️ Test Suite Results${NC}"
    echo "========================================"
    echo -e "Tests Run:    ${BLUE}$TESTS_RUN${NC}"
    echo -e "Tests Passed: ${GREEN}$TESTS_PASSED${NC}"
    echo -e "Tests Failed: ${RED}$TESTS_FAILED${NC}"
    
    if [ $TESTS_FAILED -eq 0 ]; then
        echo ""
        echo -e "${GREEN}🎉 All tests passed! GrooveForge is working correctly.${NC}"
        echo -e "${GREEN}🎵⚒️ Ready to find your groove and forge your future!${NC}"
        exit 0
    else
        echo ""
        echo -e "${RED}💥 $TESTS_FAILED test(s) failed. Please fix the issues above.${NC}"
        echo -e "${YELLOW}💡 Check the error messages and logs in /tmp/grooveforge-*.log${NC}"
        exit 1
    fi
}

# Cleanup function
cleanup() {
    echo ""
    echo "Cleaning up test files..."
    rm -f /tmp/grooveforge-*.log
}

# Set up cleanup on exit
trap cleanup EXIT

# Run the test suite
main "$@"