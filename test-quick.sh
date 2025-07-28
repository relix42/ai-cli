#!/bin/bash

# Quick Test Suite - Essential tests only
# For rapid feedback during development

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "🎵⚒️ GrooveForge Quick Test Suite"
echo "================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

TESTS_PASSED=0
TESTS_FAILED=0

test_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        echo -e "${RED}❌ $2${NC}"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
}

# Test 1: Build
echo -e "${BLUE}🔨 Testing build...${NC}"
if npm run build > /dev/null 2>&1; then
    test_result 0 "Build successful"
else
    test_result 1 "Build failed"
fi

# Test 2: Basic script execution
echo -e "${BLUE}🚀 Testing basic execution...${NC}"
if timeout 3s ./gf.sh --help > /dev/null 2>&1; then
    test_result 0 "Script executes"
else
    test_result 1 "Script execution failed"
fi

# Test 3: Directory independence
echo -e "${BLUE}📁 Testing directory independence...${NC}"
cd /tmp
if timeout 3s "$SCRIPT_DIR/gf.sh" --help > /dev/null 2>&1; then
    test_result 0 "Works from different directory"
else
    test_result 1 "Directory independence failed"
fi
cd "$SCRIPT_DIR"

# Test 4: Argument parsing
echo -e "${BLUE}⚙️  Testing argument parsing...${NC}"
if timeout 3s ./gf.sh --version > /dev/null 2>&1; then
    test_result 0 "Argument parsing works"
else
    test_result 1 "Argument parsing failed"
fi

# Summary
echo ""
echo "================================="
if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All quick tests passed! ($TESTS_PASSED/4)${NC}"
    exit 0
else
    echo -e "${RED}💥 $TESTS_FAILED test(s) failed.${NC}"
    echo "Run ./test-suite.sh for detailed testing."
    exit 1
fi