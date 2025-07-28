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
  description: 'show AI CLI fork information and enhancements',
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

🤖 **AI CLI Fork Details**

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
• Use \`ai-cli\` command for enhanced experience
• Use \`gemini\` command for original compatibility
• Run \`./start_ai_cli.sh\` for guided setup

**Agent Integration:**
This fork includes full integration with the ai-agent-workspace system for
collaborative AI development workflows.`
    }, Date.now());
  },
};