/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  getErrorMessage,
  loadServerHierarchicalMemory,
} from '@relix42/grooveforge-core';
import { MessageType } from '../types.js';
import {
  CommandKind,
  SlashCommand,
  SlashCommandActionReturn,
} from './types.js';

export const memoryCommand: SlashCommand = {
  name: 'memory',
  description: '🧠 Manage GrooveForge memory system - makes AI responses smarter and more contextual.',
  kind: CommandKind.BUILT_IN,
  subCommands: [
    {
      name: 'show',
      description: '📜 Show current memory content - project context and personal preferences that make AI smarter.',
      kind: CommandKind.BUILT_IN,
      action: async (context) => {
        const memoryContent = context.services.config?.getUserMemory() || '';
        const fileCount = context.services.config?.getGeminiMdFileCount() || 0;

        if (memoryContent.length > 0) {
          const messageContent = `🧠 **GrooveForge Memory System Active**

📊 **Benefits**: AI understands your project context, coding style, and preferences
📁 **Sources**: ${fileCount} memory file${fileCount > 1 ? 's' : ''} loaded
📝 **Content Length**: ${memoryContent.length} characters

---
**Current Memory Content:**

${memoryContent}
---

💡 **Tip**: This context helps AI give better, more relevant responses!`;
          
          context.ui.addItem(
            {
              type: MessageType.INFO,
              text: messageContent,
            },
            Date.now(),
          );
        } else {
          const emptyMessage = `🧠 **GrooveForge Memory System**

⚠️  **Memory is currently empty**

📝 **What memory does**:
• **Project Context**: Loads coding guidelines and patterns
• **Personal Preferences**: Remembers your coding style
• **Smarter AI**: Provides more relevant, contextual responses

🛠️ **To activate memory**:
1. Create a \`GROOVEFORGE.md\` file in your project
2. Add coding guidelines, project info, or preferences
3. Run \`/memory refresh\` to load it

💡 **Example content**: Project structure, coding standards, preferred patterns`;
          
          context.ui.addItem(
            {
              type: MessageType.INFO,
              text: emptyMessage,
            },
            Date.now(),
          );
        }
      },
    },
    {
      name: 'add',
      description: '➕ Add personal facts or preferences to memory - helps AI remember your coding style and preferences.',
      kind: CommandKind.BUILT_IN,
      action: (context, args): SlashCommandActionReturn | void => {
        if (!args || args.trim() === '') {
          return {
            type: 'message',
            messageType: 'error',
            content: `🧠 **Memory Add Command**

**Usage**: \`/memory add <text to remember>\`

📝 **Examples**:
• \`/memory add I prefer TypeScript strict mode\`
• \`/memory add Use React functional components only\`
• \`/memory add My project uses Tailwind CSS\`

💡 **What to add**: Personal preferences, coding style, project-specific info`,
          };
        }

        context.ui.addItem(
          {
            type: MessageType.INFO,
            text: `🧠 **Saving to Memory**

📝 Adding: "${args.trim()}"

💡 This will help AI remember your preference for future interactions!`,
          },
          Date.now(),
        );

        return {
          type: 'tool',
          toolName: 'save_memory',
          toolArgs: { fact: args.trim() },
        };
      },
    },
    {
      name: 'refresh',
      description: '🔄 Reload memory from GROOVEFORGE.md and personal files - updates AI context with latest changes.',
      kind: CommandKind.BUILT_IN,
      action: async (context) => {
        context.ui.addItem(
          {
            type: MessageType.INFO,
            text: `🔄 **Refreshing GrooveForge Memory**

📁 Scanning for memory files...
• Personal memory: ~/.gemini/GEMINI.md
• Project memory: ./GROOVEFORGE.md
• Extension context files

💡 This updates AI context with your latest changes!`,
          },
          Date.now(),
        );

        try {
          const config = await context.services.config;
          if (config) {
            const { memoryContent, fileCount } =
              await loadServerHierarchicalMemory(
                config.getWorkingDir(),
                config.getDebugMode(),
                config.getFileService(),
                config.getExtensionContextFilePaths(),
                config.getFileFilteringOptions(),
                context.services.settings.merged.memoryDiscoveryMaxDirs,
              );
            config.setUserMemory(memoryContent);
            config.setGeminiMdFileCount(fileCount);

            const successMessage =
              memoryContent.length > 0
                ? `✅ **Memory Refresh Complete**

📊 **Results**:
• Loaded ${memoryContent.length} characters
• From ${fileCount} memory file${fileCount > 1 ? 's' : ''}

🧠 **AI is now updated** with your latest context and preferences!

💡 **Benefits**: More accurate responses, better code suggestions, contextual help`
                : `✅ **Memory Refresh Complete**

📁 **No memory files found**

🛠️ **To add memory**:
1. Create \`GROOVEFORGE.md\` in your project
2. Add project guidelines, coding standards
3. Run \`/memory refresh\` again

💡 **Personal memory**: Add to ~/.gemini/GEMINI.md for global preferences`;

            context.ui.addItem(
              {
                type: MessageType.INFO,
                text: successMessage,
              },
              Date.now(),
            );
          }
        } catch (error) {
          const errorMessage = getErrorMessage(error);
          context.ui.addItem(
            {
              type: MessageType.ERROR,
              text: `❌ **Memory Refresh Failed**

🚨 **Error**: ${errorMessage}

🛠️ **Troubleshooting**:
• Check if memory files exist and are readable
• Verify file permissions
• Try creating a simple GROOVEFORGE.md file

📝 **Example GROOVEFORGE.md**:
\`\`\`
# Project Guidelines
- Use TypeScript strict mode
- Prefer functional components
- Follow ESLint rules
\`\`\``,
            },
            Date.now(),
          );
        }
      },
    },
    {
      name: 'help',
      description: '📚 Learn about GrooveForge memory system - understand how it makes AI smarter.',
      kind: CommandKind.BUILT_IN,
      action: async (context) => {
        const helpMessage = `🧠 **GrooveForge Memory System Guide**

🎆 **What is Memory?**
Memory makes GrooveForge AI smarter by providing context about your project, coding style, and preferences.

📊 **Key Benefits**:
• **Contextual Responses**: AI understands your project structure
• **Consistent Style**: Follows your coding conventions
• **Personal Preferences**: Remembers your development workflow
• **Better Suggestions**: More relevant code recommendations

📁 **Memory Sources**:
1. **Project Memory**: \`GROOVEFORGE.md\` in your project root
2. **Personal Memory**: \`~/.gemini/GEMINI.md\` for global preferences
3. **Extension Context**: Additional context from extensions

🛠️ **Getting Started**:
1. \`/memory show\` - Check current memory status
2. Create \`GROOVEFORGE.md\` with project guidelines
3. \`/memory refresh\` - Load your memory files
4. \`/memory add <preference>\` - Add personal preferences

📝 **Example GROOVEFORGE.md**:
\`\`\`markdown
# My Project Guidelines

## Code Style
- Use TypeScript strict mode
- Prefer functional React components
- Follow ESLint configuration

## Architecture
- Use clean architecture patterns
- Separate business logic from UI
- Write comprehensive tests
\`\`\`

💡 **Pro Tips**:
• Update memory files regularly as your project evolves
• Include coding standards, preferred patterns, and project structure
• Add personal preferences like preferred libraries or tools
• Use \`/memory refresh\` after updating memory files

🎆 **Result**: AI gives more accurate, contextual, and helpful responses!`;
        
        context.ui.addItem(
          {
            type: MessageType.INFO,
            text: helpMessage,
          },
          Date.now(),
        );
      },
    },
  ],
};
