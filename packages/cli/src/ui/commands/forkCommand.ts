/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { getForkInfo, getEnhancedVersionInfo } from '../../utils/forkInfo.js';
import { CommandKind, SlashCommand } from './types.js';
import { MessageType } from '../types.js';

export const forkCommand: SlashCommand = {
  name: 'fork',
  description: 'show Chat CLI information and features',
  kind: CommandKind.BUILT_IN,
  action: async (context) => {
    const forkInfo = await getForkInfo();
    const enhancedInfo = await getEnhancedVersionInfo();
    
    // Add an info message with fork information
    context.ui.addItem({
      type: MessageType.INFO,
      text: enhancedInfo
    }, Date.now());
    
    // Also add a structured message for better display
    context.ui.addItem({
      type: MessageType.INFO,
      text: `

💬 **Chat CLI Details**

**Name:** ${forkInfo.name}
**Version:** ${forkInfo.version}
**Based on:** ${forkInfo.originalName}
**Description:** ${forkInfo.description}

**Key Enhancements:**
${forkInfo.features.map(feature => `• ${feature}`).join('\n')}

**Links:**
• Fork Repository: ${forkInfo.forkRepo}
• Original Repository: ${forkInfo.originalRepo}

**Usage:**
• Use \`chat-cli\` command for full interface
• Use \`chat\` command for quick access
• Run \`./start_chat_cli.sh\` for guided setup

**Local AI Focus:**
Chat CLI is designed for local AI interactions without sending data to Google.
Supports Ollama for local models and Claude-code-router for Claude access.`
    }, Date.now());
  },
};