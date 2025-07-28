#!/bin/bash

# GrooveForge Test Template
# Copy this template when adding new integration tests to test-suite.sh

# Test function template - replace 'my_feature' with your feature name
test_my_feature() {
    log_test "My feature functionality description"
    
    # Setup phase
    cd /tmp  # Always test from different directory
    export TEST_ENV_VAR=value  # Set any needed environment variables
    
    # Test execution phase
    if timeout 10s "$SCRIPT_DIR/gf.sh" --my-flag > /tmp/grooveforge-mytest.log 2>&1; then
        # Check for expected output
        if grep -q "Expected Success Message" /tmp/grooveforge-mytest.log; then
            log_pass "My feature works correctly"
        else
            log_fail "Unexpected output" "$(cat /tmp/grooveforge-mytest.log)"
            cd "$SCRIPT_DIR"
            return 1
        fi
    else
        # Command failed
        log_fail "My feature command failed" "$(cat /tmp/grooveforge-mytest.log)"
        cd "$SCRIPT_DIR"
        return 1
    fi
    
    # Cleanup phase
    unset TEST_ENV_VAR
    cd "$SCRIPT_DIR"
}

# Test function for error conditions
test_my_feature_error_handling() {
    log_test "My feature error handling"
    
    cd /tmp
    
    # Test with invalid input
    if timeout 5s "$SCRIPT_DIR/gf.sh" --my-flag invalid-input > /tmp/grooveforge-mytest-error.log 2>&1; then
        # Should not succeed with invalid input
        log_fail "Command should have failed with invalid input" "$(cat /tmp/grooveforge-mytest-error.log)"
        cd "$SCRIPT_DIR"
        return 1
    else
        # Check for proper error message
        if grep -q "Expected Error Message" /tmp/grooveforge-mytest-error.log; then
            log_pass "Error handling works correctly"
        else
            log_fail "Unexpected error message" "$(cat /tmp/grooveforge-mytest-error.log)"
            cd "$SCRIPT_DIR"
            return 1
        fi
    fi
    
    cd "$SCRIPT_DIR"
}

# Instructions for adding to test-suite.sh:
# 1. Copy your test functions to test-suite.sh
# 2. Add them to the main() function call list:
#    test_my_feature
#    test_my_feature_error_handling
# 3. Test your new tests:
#    ./test-suite.sh
# 4. Commit with your feature changes

echo "This is a template file - copy functions to test-suite.sh"