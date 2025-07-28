# AI CLI Configuration

This document outlines the custom configurations and enhancements made to this fork of the Gemini CLI.

## Fork Information

- **Original**: [Google Gemini CLI](https://github.com/google-gemini/gemini-cli)
- **Fork**: [relix42/grooveforge](https://github.com/relix42/grooveforge)
- **Version**: 0.1.13-fork.1

## Custom Features

### 1. Enhanced Startup Script
- `start_ai_cli.sh` - Custom startup script with dependency checking and environment validation
- Automatic dependency installation
- API key validation
- Build automation

### 2. Dual Binary Support
- `grooveforge` command (new)
- `gemini` command (original compatibility)

### 3. Custom Package Configuration
- Updated package name to `@relix42/grooveforge`
- Fork-specific versioning
- Updated repository references

## Installation

### Quick Start
```bash
# Clone the repository
git clone https://github.com/relix42/grooveforge.git
cd grooveforge

# Run the enhanced startup script
./start_ai_cli.sh
```

### Manual Installation
```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run the CLI
npm start
```

## Environment Variables

### Required for API Access
```bash
# Option 1: Gemini API Key (recommended for development)
export GEMINI_API_KEY="your_api_key_here"

# Option 2: Google Cloud API Key
export GOOGLE_API_KEY="your_api_key_here"
export GOOGLE_GENAI_USE_VERTEXAI=true
```

### Optional Configuration
```bash
# Enable debug mode
export DEBUG=1

# Custom sandbox configuration
export GEMINI_SANDBOX=docker  # or 'podman' or 'false'
```

## Development

### Building
```bash
npm run build:all    # Build everything
npm run build        # Build main package
npm run build:vscode # Build VSCode companion
```

### Testing
```bash
npm test             # Run all tests
npm run test:e2e     # Run end-to-end tests
npm run test:ci      # Run CI tests
```

### Linting and Formatting
```bash
npm run lint         # Check code style
npm run lint:fix     # Fix code style issues
npm run format       # Format code with Prettier
```

## Customization

This fork maintains compatibility with the original Gemini CLI while adding:

1. **Enhanced Documentation** - Better setup instructions and configuration guides
2. **Improved Startup Experience** - Automated dependency checking and setup
3. **Development Workflow** - Streamlined build and test processes
4. **Custom Branding** - AI CLI identity while maintaining Gemini functionality

## Contributing

1. Fork this repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Upstream Sync

To sync with the original Gemini CLI:

```bash
# Add upstream remote (if not already added)
git remote add upstream https://github.com/google-gemini/gemini-cli.git

# Fetch upstream changes
git fetch upstream

# Merge upstream changes
git merge upstream/main
```

## License

This project maintains the same license as the original Gemini CLI. See [LICENSE](./LICENSE) for details.