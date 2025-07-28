# 🤖 AI CLI Agent Development Guide

**Comprehensive guide for AI agents working on the AI CLI project**

## 🚨 **CRITICAL COMPLIANCE REQUIREMENTS**

### **1. Signature Requirement**
Every response MUST end with: `🤖 Navigating with precision and care YourAgentName`

### **2. File Location Rules (XDG Standard)**
- **Config files**: `~/.config/ai-cli/`
- **Data files**: `~/.local/share/ai-cli/`
- **Cache files**: `~/.cache/ai-cli/`
- **State files**: `~/.local/state/ai-cli/`
- **NEVER create files in**: `~/` (home directory root)

### **3. Session Management**
```bash
# Update session after significant work
npm run agent:session \"description of work completed\"

# Check for changes before starting work
npm run agent:check

# Validate compliance
npm run agent:validate
```

### **4. Git Commit Format**
```bash
git commit -m \"Agent YourName: type: description\"

# Examples:
git commit -m \"Agent SamuelBlue: feat: add new CLI command\"
git commit -m \"Agent SamuelBlue: fix: resolve startup script issue\"
git commit -m \"Agent SamuelBlue: docs: update development guide\"
```

## 🚀 **Quick Start for Agents**

### **1. Initial Setup**
```bash
# Navigate to project
cd ai-cli

# Setup agent environment
npm run agent:setup

# Validate compliance
npm run agent:validate

# Start development
./start_ai_cli.sh
```

### **2. Development Workflow**
```bash
# 1. Check for changes
npm run agent:check

# 2. Make your changes
# ... edit files ...

# 3. Test changes
npm test
npm run lint

# 4. Update session
npm run agent:session \"implemented feature X\"

# 5. Commit with proper format
git add .
git commit -m \"Agent YourName: feat: description\"

# 6. Push changes
git push origin main
```

## 🛠️ **Development Commands**

### **Agent-Specific Commands**
```bash
npm run agent:setup      # Setup agent environment
npm run agent:session    # Update session (requires message)
npm run agent:check      # Check for changes
npm run agent:validate   # Validate compliance
```

### **Development Commands**
```bash
# Building
npm run build           # Build main package
npm run build:all       # Build everything
npm run bundle          # Create bundle

# Testing
npm test               # Run all tests
npm run test:e2e       # End-to-end tests
npm run test:ci        # CI tests

# Code Quality
npm run lint           # Check code style
npm run lint:fix       # Fix style issues
npm run format         # Format with Prettier
npm run typecheck      # Type checking

# Development
npm start              # Start CLI
npm run debug          # Debug mode
```

## 📁 **Project Structure Understanding**

```
ai-cli/
├── packages/                    # Source packages
│   ├── cli/                    # Main CLI package
│   ├── core/                   # Core functionality
│   └── shared/                 # Shared utilities
├── bundle/                     # Built output (generated)
├── docs/                       # Documentation
│   ├── start-here.md          # Project entry point
│   └── AGENT_DEVELOPMENT_GUIDE.md # This file
├── integration-tests/          # E2E tests
├── scripts/                    # Build and utility scripts
│   ├── agent-integration.sh   # Agent workspace integration
│   ├── build.js              # Build script
│   └── start.js              # Start script
├── .github/                    # GitHub workflows
├── .ai-agent-config.yml       # Agent configuration
├── start_ai_cli.sh           # Enhanced startup script
├── AI_CLI_CONFIG.md          # Fork documentation
└── package.json              # Project configuration
```

## 🔧 **Common Development Tasks**

### **Adding New Features**
1. **Plan**: Understand the feature requirements
2. **Location**: Determine which package to modify (`packages/cli/`, `packages/core/`, etc.)
3. **Implement**: Write the feature code
4. **Test**: Add tests in appropriate test files
5. **Document**: Update relevant documentation
6. **Session**: Update session with progress

### **Fixing Bugs**
1. **Reproduce**: Understand the bug and reproduce it
2. **Locate**: Find the source of the issue
3. **Fix**: Implement the fix
4. **Test**: Ensure the fix works and doesn't break other functionality
5. **Regression**: Add tests to prevent regression
6. **Session**: Update session with fix details

### **Updating Documentation**
1. **Identify**: What documentation needs updating
2. **Update**: Make the necessary changes
3. **Review**: Ensure accuracy and completeness
4. **Test**: Verify examples and instructions work
5. **Session**: Update session with documentation changes

## 🧪 **Testing Guidelines**

### **Running Tests**
```bash
# All tests
npm test

# Specific test types
npm run test:ci         # CI tests
npm run test:e2e        # End-to-end tests

# Integration tests with different sandbox modes
npm run test:integration:sandbox:none
npm run test:integration:sandbox:docker
npm run test:integration:sandbox:podman
```

### **Writing Tests**
- **Unit tests**: In `packages/*/tests/` directories
- **Integration tests**: In `integration-tests/` directory
- **Follow existing patterns**: Look at existing tests for examples
- **Test coverage**: Aim for good coverage of new features

## 🔄 **Upstream Synchronization**

### **Syncing with Original Gemini CLI**
```bash
# Fetch upstream changes
git fetch upstream

# Check what's new
git log HEAD..upstream/main --oneline

# Merge upstream changes
git merge upstream/main

# Resolve conflicts if any
# Test thoroughly after merge
npm test
npm run test:e2e

# Update session
npm run agent:session \"synced with upstream\"

# Commit merge
git commit -m \"Agent YourName: chore: sync with upstream\"
```

### **Handling Conflicts**
1. **Identify conflicts**: Git will mark conflicted files
2. **Resolve manually**: Edit files to resolve conflicts
3. **Test thoroughly**: Ensure everything still works
4. **Commit resolution**: Use proper commit format

## 🚨 **Common Pitfalls and Solutions**

### **File Location Violations**
❌ **Wrong**: Creating files in `~/`
```bash
# DON'T DO THIS
echo "config" > ~/ai-cli-config.json
```

✅ **Correct**: Using XDG locations
```bash
# DO THIS INSTEAD
mkdir -p ~/.config/ai-cli
echo "config" > ~/.config/ai-cli/config.json
```

### **Missing Session Updates**
❌ **Wrong**: Working without session updates
```bash
# Make changes...
git commit -m "Agent YourName: feat: new feature"
# No session update!
```

✅ **Correct**: Regular session updates
```bash
# Make changes...
npm run agent:session "implemented new feature X"
git commit -m "Agent YourName: feat: new feature"
```

### **Incorrect Git Format**
❌ **Wrong**: Improper commit messages
```bash
git commit -m "fixed bug"
git commit -m "SamuelBlue: added feature"
```

✅ **Correct**: Proper agent format
```bash
git commit -m "Agent SamuelBlue: fix: resolve startup issue"
git commit -m "Agent SamuelBlue: feat: add new CLI command"
```

## 🎯 **Development Best Practices**

### **Code Quality**
- **Lint before commit**: `npm run lint:fix`
- **Format code**: `npm run format`
- **Type checking**: `npm run typecheck`
- **Test coverage**: Write tests for new features

### **Documentation**
- **Update docs**: Keep documentation current
- **Code comments**: Add meaningful comments
- **Examples**: Provide usage examples
- **README updates**: Update README for significant changes

### **Collaboration**
- **Check for changes**: Before starting work
- **Session updates**: Regular progress updates
- **Clear commits**: Descriptive commit messages
- **Test thoroughly**: Before pushing changes

## 🆘 **Troubleshooting**

### **Build Issues**
```bash
# Clean and rebuild
npm run clean
npm install
npm run build
```

### **Test Failures**
```bash
# Run specific tests
npm test -- --grep "test name"

# Debug mode
npm run debug
```

### **Agent Integration Issues**
```bash
# Validate setup
npm run agent:validate

# Re-setup environment
npm run agent:setup
```

### **Upstream Sync Issues**
```bash
# Check remote configuration
git remote -v

# Re-add upstream if missing
git remote add upstream https://github.com/google-gemini/gemini-cli.git
```

## 📚 **Additional Resources**

- **[AI CLI Configuration](../AI_CLI_CONFIG.md)** - Fork-specific details
- **[Original Gemini CLI](https://github.com/google-gemini/gemini-cli)** - Upstream repository
- **[Agent Workspace](../../ai-agent-workspace/agent-initialization-essentials.md)** - System requirements
- **[TypeScript Docs](https://www.typescriptlang.org/docs/)** - Language reference
- **[Node.js Docs](https://nodejs.org/docs/)** - Runtime reference

---

**Remember**: Always end responses with your signature and follow all compliance requirements!

🤖 Navigating with precision and care SamuelBlue