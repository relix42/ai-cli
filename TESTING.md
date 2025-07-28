# GrooveForge Testing Guide

## 🎯 Overview

GrooveForge includes comprehensive testing to catch regressions and ensure functionality works correctly after changes.

## 🚨 **CRITICAL REQUIREMENT: ALL CHANGES MUST INCLUDE TESTS**

**Every feature addition, bug fix, or modification MUST include corresponding tests.** This is non-negotiable for maintaining code quality and preventing regressions.

### 📝 **Test Requirements Checklist**

Before submitting any changes, ensure you have:

- ☐ **Added unit tests** for new functionality
- ☐ **Added integration tests** to `test-suite.sh` for CLI features
- ☐ **Updated existing tests** if modifying existing functionality
- ☐ **Added regression tests** for bug fixes
- ☐ **Verified all tests pass** with `./test-suite.sh`
- ☐ **Documented test coverage** in your PR description

### 🎯 **Test Coverage Standards**

| Change Type | Required Tests |
|-------------|----------------|
| **New Features** | Unit tests + Integration tests + Documentation |
| **Bug Fixes** | Regression tests that would have caught the bug |
| **API Changes** | Update all affected tests + New tests for changes |
| **UI Changes** | Component tests + User interaction tests |
| **CLI Changes** | Command-line integration tests in `test-suite.sh` |
| **Performance** | Benchmark tests + Regression tests |
| **Security** | Security-specific tests + Edge case tests |

## 🧪 Test Suites

### Quick Tests (`./test-quick.sh`)
**Purpose**: Fast feedback during development  
**Runtime**: ~10 seconds  
**Tests**:
- Build system
- Basic script execution
- Directory independence
- Argument parsing

```bash
./test-quick.sh
```

### Full Test Suite (`./test-suite.sh`)
**Purpose**: Comprehensive regression testing  
**Runtime**: ~60 seconds  
**Tests**:
- All quick tests
- Interactive mode detection
- Ollama auto-detection (if available)
- Memory system functionality
- Environment variable handling
- Symlink resolution
- File permissions

```bash
./test-suite.sh
```

## 🔧 Test Categories

### Core Functionality
- ✅ **Build System**: Ensures TypeScript compilation works
- ✅ **Script Execution**: Basic startup and help commands
- ✅ **Directory Resolution**: Works from any directory
- ✅ **Symlink Resolution**: Global command works correctly

### User Experience
- ⚠️ **Interactive Mode**: Auth dialog appears when no provider configured
- ✅ **Argument Parsing**: Command line flags work correctly
- ✅ **Environment Variables**: Provider detection and configuration

### AI Integration
- ✅ **Ollama Detection**: Auto-detects and configures Ollama models
- ✅ **Memory System**: Memory commands work correctly
- ⏭️ **Claude Integration**: API key validation (when configured)

### Development
- ✅ **File Permissions**: Scripts are executable
- ✅ **Dependencies**: Node.js version and npm packages

## 🚀 Automated Testing

### GitHub Actions
Tests run automatically on:
- Push to `main` or `develop` branches
- Pull requests to `main`
- Multiple Node.js versions (20.x, 22.x)
- With and without Ollama

### Pre-commit Hooks
Install with:
```bash
./setup-git-hooks.sh
```

This runs quick tests before each commit to catch issues early.

## 🐛 Debugging Failed Tests

### Check Test Logs
Failed tests create logs in `/tmp/grooveforge-*.log`:
```bash
ls /tmp/grooveforge-*.log
cat /tmp/grooveforge-interactive.log
```

### Common Issues

#### Interactive Mode Not Working
**Symptom**: "No input provided via stdin" error  
**Debug**: Check if `shouldBeInteractive` logic is correct
```bash
# Test manually
unset CHAT_CLI_PROVIDER OLLAMA_MODEL GEMINI_API_KEY
./gf.sh  # Should show auth dialog, not stdin error
```

#### Directory Resolution Failed
**Symptom**: npm package.json errors from wrong directory  
**Debug**: Check symlink resolution in `gf.sh`
```bash
# Test from different directory
cd /tmp && /path/to/grooveforge/gf.sh --help
```

#### Ollama Detection Failed
**Symptom**: Auto-detection not working  
**Debug**: Check Ollama availability
```bash
curl -s http://localhost:11434/api/tags
ollama list
```

## 📊 Test Results Interpretation

### Exit Codes
- `0`: All tests passed
- `1`: One or more tests failed

### Output Colors
- 🟢 **Green**: Test passed
- 🔴 **Red**: Test failed
- 🟡 **Yellow**: Test skipped (dependency not available)
- 🔵 **Blue**: Test running

### Expected Skips
Some tests may be skipped in certain environments:
- **Global Command**: If `grooveforge` symlink not installed
- **Ollama Tests**: If Ollama not running
- **Interactive Mode**: In CI environments without TTY

## 🔄 Continuous Integration

### Local Development Workflow
1. Make changes
2. Run `./test-quick.sh` for fast feedback
3. Run `./test-suite.sh` before committing
4. Commit (pre-commit hook runs quick tests)
5. Push (GitHub Actions runs full suite)

### CI/CD Pipeline
1. **Quick Tests**: Fast validation on all Node.js versions
2. **Full Tests**: Comprehensive testing without external dependencies
3. **Ollama Tests**: Full integration testing with local AI
4. **Artifact Upload**: Test logs saved for debugging failures

## 🎵⚒️ Best Practices

### When to Run Tests
- **Before committing**: Always run quick tests
- **Before pushing**: Run full test suite
- **After major changes**: Run full suite multiple times
- **Before releases**: Full suite + manual testing

### Adding New Tests

#### **For Unit Tests (Vitest)**
1. Create `*.test.ts` or `*.test.tsx` files co-located with source
2. Follow existing patterns in the codebase
3. Mock external dependencies appropriately
4. Test both success and failure cases
5. Run with `npm test`

#### **For Integration Tests (test-suite.sh)**
1. Add test function to `test-suite.sh`
2. Follow naming convention: `test_feature_name()`
3. Use helper functions: `log_test()`, `log_pass()`, `log_fail()`
4. Include cleanup and error handling
5. Test real CLI interactions and workflows
6. Example template:
   ```bash
   test_my_new_feature() {
       log_test "My new feature functionality"
       
       # Setup
       cd /tmp
       export TEST_VAR=value
       
       # Test execution
       if timeout 10s "$SCRIPT_DIR/gf.sh" --my-flag > /tmp/test-output.log 2>&1; then
           if grep -q "Expected Output" /tmp/test-output.log; then
               log_pass "My new feature works correctly"
           else
               log_fail "Unexpected output" "$(cat /tmp/test-output.log)"
               return 1
           fi
       else
           log_fail "Command failed" "$(cat /tmp/test-output.log)"
           return 1
       fi
       
       # Cleanup
       unset TEST_VAR
       cd "$SCRIPT_DIR"
   }
   ```
7. Add your test function to the `main()` function call list

### Test Maintenance
- Keep tests fast and reliable
- Update tests when functionality changes
- Remove obsolete tests
- Add tests for new features
- Document test requirements

## 🎯 Current Status

| Test Category | Status | Notes |
|---------------|--------|-------|
| Build System | ✅ Pass | TypeScript compilation works |
| Directory Resolution | ✅ Pass | Works from any location |
| Symlink Resolution | ✅ Pass | Global command works |
| Argument Parsing | ✅ Pass | All flags work correctly |
| Environment Variables | ✅ Pass | Provider detection works |
| Interactive Mode | ❌ Fail | Still shows stdin error |
| Ollama Detection | ✅ Pass | Auto-configuration works |
| Memory System | ✅ Pass | Commands work correctly |

**Priority Fix**: Interactive mode detection needs to be resolved to ensure new users can set up GrooveForge without manual configuration.