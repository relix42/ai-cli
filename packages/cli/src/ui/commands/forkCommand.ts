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
  description: 'show GrooveForge information and features',
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

🎵⚒️ **GrooveForge Details**

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
• Use \`grooveforge\` command for full interface
• Use \`groove\` command for quick access
• Run \`./start_grooveforge.sh\` for guided setup

**Find Your Groove:**
GrooveForge helps you find your development rhythm with AI assistance.
Forge ideas into reality with local Ollama models or Claude API integration.`
    }, Date.now());
  },
};