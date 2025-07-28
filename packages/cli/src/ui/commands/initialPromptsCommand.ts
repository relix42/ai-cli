/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { CommandKind, SlashCommandActionReturn, CommandContext } from './types.js';
import { MessageType } from '../types.js';
import { createSampleInitialPromptsFile } from '../../utils/initialPrompts.js';
import * as path from 'path';

export const initialPromptsCommand = {
  name: 'initial-prompts',
  description: 'Manage initial prompts configuration',
  kind: CommandKind.BUILT_IN,
  action: async (context: CommandContext, args?: string): Promise<void | SlashCommandActionReturn> => {
    const subCommand = args?.trim().toLowerCase();

    if (!subCommand || subCommand === 'help') {
      context.ui.addItem({
        type: MessageType.INFO,
        text: `## 🚀 **Initial Prompts Management**

**Available commands:**
- \`/initial-prompts create\` - Create a sample initial prompts file
- \`/initial-prompts config\` - Show current configuration options
- \`/initial-prompts help\` - Show this help

**What are initial prompts?**
Initial prompts are commands that GrooveForge executes automatically when it starts, before user interaction begins. This is perfect for:
- Loading project context
- Setting up development environment
- Running startup diagnostics
- Initializing workspace state

**Configuration methods:**
1. **Command line:** \`--initial-prompt "prompt"\` or \`--initial-prompts "prompt1;prompt2"\`
2. **File:** \`--initial-prompts-file path/to/file.txt\`
3. **Environment:** \`GROOVEFORGE_INITIAL_PROMPTS="prompt1;prompt2"\`
4. **Config file:** \`.grooveforge/config.json\``,
      }, Date.now());
      return;
    }

    if (subCommand === 'create') {
      try {
        const filePath = path.join(process.cwd(), '.grooveforge', 'initial-prompts.txt');
        createSampleInitialPromptsFile(filePath);
        
        context.ui.addItem({
          type: MessageType.INFO,
          text: `✅ **Sample initial prompts file created!**

**File location:** \`${filePath}\`

**To use this file:**
\`\`\`bash
grooveforge --initial-prompts-file .grooveforge/initial-prompts.txt
\`\`\`

**Or add to your config file:**
\`\`\`json
{
  "initialPromptsFile": ".grooveforge/initial-prompts.txt"
}
\`\`\`

Edit the file to customize your startup prompts!`,
        }, Date.now());
      } catch (error) {
        context.ui.addItem({
          type: MessageType.ERROR,
          text: `❌ **Failed to create initial prompts file:** ${error instanceof Error ? error.message : String(error)}`,
        }, Date.now());
      }
      return;
    }

    if (subCommand === 'config') {
      const envPrompts = process.env.GROOVEFORGE_INITIAL_PROMPTS;
      const configPath = path.join(process.cwd(), '.grooveforge', 'config.json');
      
      let configInfo = '';
      try {
        const fs = await import('fs');
        if (fs.existsSync(configPath)) {
          const configContent = fs.readFileSync(configPath, 'utf8');
          const config = JSON.parse(configContent);
          if (config.initialPrompts || config.initialPromptsFile) {
            configInfo = `**Config file (${configPath}):**
- initialPrompts: ${config.initialPrompts ? JSON.stringify(config.initialPrompts) : 'not set'}
- initialPromptsFile: ${config.initialPromptsFile || 'not set'}`;
          } else {
            configInfo = `**Config file:** No initial prompts configured in ${configPath}`;
          }
        } else {
          configInfo = `**Config file:** ${configPath} does not exist`;
        }
      } catch (error) {
        configInfo = `**Config file:** Error reading ${configPath} - ${error instanceof Error ? error.message : String(error)}`;
      }

      context.ui.addItem({
        type: MessageType.INFO,
        text: `## 📋 **Current Initial Prompts Configuration**

**Environment variable:**
- GROOVEFORGE_INITIAL_PROMPTS: ${envPrompts || 'not set'}

${configInfo}

**Command line options:**
- \`--initial-prompt "single prompt"\`
- \`--initial-prompts "prompt1;prompt2;prompt3"\`
- \`--initial-prompts-file path/to/file.txt\`
- \`--quiet-initial-prompts\` (hide execution from display)

**Priority order:**
1. Command line options (highest)
2. Environment variable
3. Config file (lowest)`,
      }, Date.now());
      return;
    }

    context.ui.addItem({
      type: MessageType.ERROR,
      text: `❌ **Unknown subcommand:** "${subCommand}"

Use \`/initial-prompts help\` to see available commands.`,
    }, Date.now());
    return;
  },
};