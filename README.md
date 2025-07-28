# GrooveForge

[![GrooveForge CI](https://github.com/relix42/grooveforge/actions/workflows/ci.yml/badge.svg)](https://github.com/relix42/grooveforge/actions/workflows/ci.yml)

![GrooveForge Screenshot](./docs/assets/grooveforge-screenshot.png)

**🎵⚒️ Find your groove, forge your future with AI**

GrooveForge is a local-first AI development companion that helps you find your coding rhythm and forge ideas into reality.

## About GrooveForge

GrooveForge is a privacy-focused fork of the [Google Gemini CLI](https://github.com/google-gemini/gemini-cli) that removes all Google dependencies and focuses on local AI interactions. It supports Ollama for local model inference and Claude API for cloud-based assistance.

With GrooveForge you can:

- Find your development groove with rhythmic AI assistance
- Forge ideas into reality with local Ollama models
- Access Claude models for cloud-based AI collaboration
- Query and edit large codebases with AI guidance
- Generate code and documentation with creative AI help
- Use tools and MCP servers for extended capabilities
- Keep all interactions private (no Google data collection)

## Quickstart

### Installation

1. **Prerequisites:** Ensure you have [Node.js version 20](https://nodejs.org/en/download) or higher installed.
2. **Install GrooveForge:**

   ```bash
   npm install -g @relix42/grooveforge
   ```

   Then, run the CLI from anywhere:

   ```bash
   grooveforge
   # or
   groove
   ```

### Local Development

1. **Clone the repository:**

   ```bash
   git clone https://github.com/relix42/grooveforge.git
   cd grooveforge
   ```

2. **Install dependencies and build:**

   ```bash
   npm install
   npm run build
   ```

3. **Run locally:**

   ```bash
   npm start
   # or use the enhanced startup script
   ./start_grooveforge.sh
   ```

### Configuration

GrooveForge supports two main AI providers:

#### Option 1: Ollama (Local Models)

1. **Install Ollama:** Follow the [Ollama installation guide](https://ollama.ai/)
2. **Pull a model:**

   ```bash
   ollama pull llama2
   # or any other model you prefer
   ```

3. **Configure GrooveForge:**

   ```bash
   export CHAT_CLI_PROVIDER="ollama"
   export OLLAMA_MODEL="llama2"
   ```

#### Option 2: Claude (via claude-code-router)

1. **Set up claude-code-router:** Follow the [claude-code-router setup guide](https://github.com/anthropics/claude-code-router)
2. **Configure GrooveForge:**

   ```bash
   export CHAT_CLI_PROVIDER="claude"
   export CLAUDE_API_KEY="your_claude_api_key"
   ```

You are now ready to use GrooveForge!

## Examples

Once GrooveForge is configured, you can start forging with AI:

You can start a project from a new directory:

```sh
cd new-project/
grooveforge
> Help me forge a Discord bot that answers questions using a FAQ.md file
```

Or work with an existing project:

```sh
git clone https://github.com/relix42/grooveforge
cd grooveforge
groove
> Give me a summary of all of the changes that went in yesterday
```

### Next steps

- Learn how to [contribute to or build from the source](./CONTRIBUTING.md).
- Explore the available **[CLI Commands](./docs/cli/commands.md)**.
- If you encounter any issues, review the **[troubleshooting guide](./docs/troubleshooting.md)**.
- For more comprehensive documentation, see the [full documentation](./docs/index.md).
- Take a look at some [popular tasks](#popular-tasks) for more inspiration.
- Check out our **[Official Roadmap](./ROADMAP.md)**

### Troubleshooting

Head over to the [troubleshooting guide](docs/troubleshooting.md) if you're
having issues.

## Popular tasks

### Explore a new codebase

Start by `cd`ing into an existing or newly-cloned repository and running `gemini`.

```text
> Describe the main pieces of this system's architecture.
```

```text
> What security mechanisms are in place?
```

### Work with your existing code

```text
> Implement a first draft for GitHub issue #123.
```

```text
> Help me migrate this codebase to the latest version of Java. Start with a plan.
```

### Automate your workflows

Use MCP servers to integrate your local system tools with your enterprise collaboration suite.

```text
> Make me a slide deck showing the git history from the last 7 days, grouped by feature and team member.
```

```text
> Make a full-screen web app for a wall display to show our most interacted-with GitHub issues.
```

### Interact with your system

```text
> Convert all the images in this directory to png, and rename them to use dates from the exif data.
```

```text
> Organize my PDF invoices by month of expenditure.
```

### Uninstall

Head over to the [Uninstall](docs/Uninstall.md) guide for uninstallation instructions.

## Terms of Service and Privacy Notice

For details on the terms of service and privacy notice applicable to your use of Gemini CLI, see the [Terms of Service and Privacy Notice](./docs/tos-privacy.md).
