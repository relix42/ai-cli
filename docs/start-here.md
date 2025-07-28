# 🤖 AI CLI - Start Here

**Enhanced Gemini CLI Fork for AI Development Workflows**

## 🚨 **MANDATORY FIRST STEP FOR ALL AI AGENTS**

**Before working on this project, you MUST:**

1. ✅ **Complete agent registration** in the ai-agent-workspace
2. ✅ **Read system requirements** from `ai-agent-workspace/agent-initialization-essentials.md`
3. ✅ **Understand compliance requirements** (signatures, file locations, git format)
4. ✅ **Run startup script**: `/Users/dhahn/projects/ai-agent-workspace/session-management/agent-startup-v2.sh [agent_id] ai-cli`

## 📋 **Project Overview**

### **What is AI CLI?**
- **Fork of**: [Google Gemini CLI](https://github.com/google-gemini/gemini-cli)
- **Purpose**: Enhanced command-line AI workflow tool with custom features
- **Language**: TypeScript/Node.js
- **Build System**: ESBuild
- **Package Manager**: NPM

### **Key Features**
- 🔄 **Dual Binary Support**: `ai-cli` and `gemini` commands
- 🚀 **Enhanced Startup**: Automated dependency checking and setup
- 📚 **Improved Documentation**: Better setup guides and configuration
- 🔧 **Development Tools**: Streamlined build and test processes
- 🎨 **Custom Branding**: AI CLI identity with Gemini compatibility

## 🛠️ **Development Setup**

### **Prerequisites**
- Node.js 20+ (required)
- NPM 8+ (recommended)
- Git (for version control)

### **Quick Start**
```bash
# Navigate to project
cd ai-cli

# Enhanced startup (recommended)
./start_ai_cli.sh

# Or manual setup
npm install
npm run build
npm start
```

### **Development Commands**
```bash
# Building
npm run build           # Build main package
npm run build:all       # Build everything
npm run build:vscode    # Build VSCode companion

# Testing
npm test               # Run all tests
npm run test:e2e       # End-to-end tests
npm run test:ci        # CI tests

# Code Quality
npm run lint           # Check code style
npm run lint:fix       # Fix style issues
npm run format         # Format with Prettier

# Development
npm start              # Start CLI
npm run debug          # Debug mode
```

## 🏗️ **Project Structure**

```
ai-cli/
├── packages/          # Source packages
├── bundle/           # Built output
├── docs/             # Documentation
├── integration-tests/ # E2E tests
├── scripts/          # Build scripts
├── .github/          # GitHub workflows
├── start_ai_cli.sh   # Enhanced startup script
├── AI_CLI_CONFIG.md  # Fork documentation
└── package.json      # Project configuration
```

## 🔧 **Configuration**

### **Environment Variables**
```bash
# Required for API access
export GEMINI_API_KEY="your_api_key"
# OR
export GOOGLE_API_KEY="your_api_key"
export GOOGLE_GENAI_USE_VERTEXAI=true

# Optional
export DEBUG=1                    # Debug mode
export GEMINI_SANDBOX=docker      # Sandbox type
```

### **API Key Setup**
1. **Gemini API**: Get key from [Google AI Studio](https://aistudio.google.com/apikey)
2. **Vertex AI**: Get key from [Google Cloud](https://cloud.google.com/vertex-ai/generative-ai/docs/start/api-keys)

## 🤝 **Agent Collaboration**

### **Session Management**
```bash
# Update session (required)
cd /Users/dhahn/projects/ai-agent-workspace
./session-management/update-session.sh "your progress update" ai-cli

# Check for changes
./session-management/detect-changes.sh ai-cli
```

### **Git Workflow**
```bash
# Proper commit format (required)
git commit -m \"Agent YourName: feat: description of changes\"

# Common commit types
# feat: new features
# fix: bug fixes
# docs: documentation
# refactor: code restructuring
# test: testing changes
# chore: maintenance
```

## 🔄 **Upstream Synchronization**

### **Sync with Original Gemini CLI**
```bash
# Fetch upstream changes
git fetch upstream

# Merge upstream changes
git merge upstream/main

# Resolve conflicts if needed
# Test thoroughly after merge
npm test
```

### **Remote Configuration**
- `origin`: https://github.com/relix42/ai-cli.git (your fork)
- `upstream`: https://github.com/google-gemini/gemini-cli.git (original)

## 🎯 **Development Focus Areas**

### **Current Priorities**
1. **Enhanced User Experience**: Improve startup and setup process
2. **Custom Features**: Add AI development-specific functionality
3. **Documentation**: Better guides and examples
4. **Integration**: Seamless workspace integration
5. **Testing**: Comprehensive test coverage

### **Potential Enhancements**
- Custom AI model integrations
- Enhanced debugging tools
- Project template generation
- Workflow automation features
- Performance optimizations

## 🚨 **Compliance Requirements**

### **File Locations (XDG Standard)**
- Config files: `~/.config/ai-cli/`
- Data files: `~/.local/share/ai-cli/`
- Cache files: `~/.cache/ai-cli/`
- State files: `~/.local/state/ai-cli/`

### **Required Signature**
Every response must end with: `🤖 Navigating with precision and care YourAgentName`

### **Session Updates**
Update sessions regularly with progress and changes.

## 📚 **Resources**

### **Documentation**
- [AI CLI Configuration](../AI_CLI_CONFIG.md) - Fork-specific details
- [Original Gemini CLI Docs](https://github.com/google-gemini/gemini-cli/tree/main/docs) - Upstream documentation
- [Agent Workspace Guide](/Users/dhahn/projects/ai-agent-workspace/agent-initialization-essentials.md) - System requirements

### **Support**
- **Issues**: Report in GitHub issues
- **Discussions**: Use GitHub discussions
- **Development**: Follow contribution guidelines

## 🚀 **Getting Started Checklist**

- [ ] Agent registration completed
- [ ] System requirements understood
- [ ] Project cloned and dependencies installed
- [ ] API keys configured
- [ ] Enhanced startup script tested
- [ ] Development environment verified
- [ ] Session management configured
- [ ] Git workflow understood

---

**Ready to start developing? Run `./start_ai_cli.sh` and begin enhancing the AI CLI!**

🤖 Navigating with precision and care SamuelBlue