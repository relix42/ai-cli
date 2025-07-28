/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { CommandKind, SlashCommand } from './types.js';
import { MessageType } from '../types.js';
import { LogAnalyzer } from '@google/gemini-cli-core';
import * as path from 'path';
import * as fs from 'fs';

export const logsCommand: SlashCommand = {
  name: 'logs',
  description: 'analyze local GrooveForge usage logs and performance',
  kind: CommandKind.BUILT_IN,
  action: async (context, args) => {
    const config = context.services.config;
    if (!config) {
      context.ui.addItem(
        {
          type: MessageType.INFO,
          text: '❌ Configuration not available',
        },
        Date.now(),
      );
      return;
    }

    try {
      // Parse arguments
      const argParts = args.trim().split(' ').filter(part => part.length > 0);
      const command = argParts[0] || 'report';
      const days = parseInt(argParts[1]) || 7;

      const projectRoot = config.getProjectRoot();
      const logDir = path.join(projectRoot, '.grooveforge', 'logs');

      // Check if logs directory exists
      if (!fs.existsSync(logDir)) {
        context.ui.addItem(
          {
            type: MessageType.INFO,
            text: `📁 **No logs found**\n\nLogs directory: \`${logDir}\`\n\nLogs are created automatically when you use GrooveForge. Try running some commands first!`,
          },
          Date.now(),
        );
        return;
      }

      const analyzer = new LogAnalyzer(logDir);

      switch (command) {
        case 'report':
        case 'analyze':
          const stats = await analyzer.analyzeUsage(days);
          const report = analyzer.generateReport(stats);
          
          context.ui.addItem(
            {
              type: MessageType.INFO,
              text: `📊 **GrooveForge Usage Analysis** (Last ${days} days)\n\n${report}`,
            },
            Date.now(),
          );
          break;

        case 'dir':
        case 'directory':
          const files = fs.readdirSync(logDir);
          const fileList = files.map(file => {
            const filePath = path.join(logDir, file);
            const stats = fs.statSync(filePath);
            const size = (stats.size / 1024).toFixed(1);
            const modified = stats.mtime.toLocaleDateString();
            return `- \`${file}\` (${size} KB, modified ${modified})`;
          }).join('\n');

          context.ui.addItem(
            {
              type: MessageType.INFO,
              text: `📁 **Log Files Directory**\n\nLocation: \`${logDir}\`\n\n${fileList || 'No log files found'}`,
            },
            Date.now(),
          );
          break;

        case 'help':
          context.ui.addItem(
            {
              type: MessageType.INFO,
              text: `📋 **GrooveForge Logs Command Help**

**Usage:**
- \`/logs\` or \`/logs report\` - Show usage analysis for last 7 days
- \`/logs report 30\` - Show usage analysis for last 30 days  
- \`/logs dir\` - List all log files
- \`/logs help\` - Show this help

**Log Types:**
- **Session logs**: User interactions, prompts, model usage
- **Performance logs**: Tool calls, API response times, token usage
- **Error logs**: Failures, loops, debugging information

**Privacy:**
All logs are stored locally in \`.grooveforge/logs/\` and never sent anywhere.
Logs are automatically cleaned up after 30 days.

**Environment Variables:**
- \`GROOVEFORGE_LOCAL_LOGGING=false\` - Disable local logging
- Debug mode (\`--debug\`) enables verbose console output`,
            },
            Date.now(),
          );
          break;

        default:
          context.ui.addItem(
            {
              type: MessageType.INFO,
              text: `❓ **Unknown logs command: \`${command}\`**\n\nUse \`/logs help\` to see available commands.`,
            },
            Date.now(),
          );
      }
    } catch (error) {
      context.ui.addItem(
        {
          type: MessageType.INFO,
          text: `❌ **Error analyzing logs**: ${error instanceof Error ? error.message : String(error)}`,
        },
        Date.now(),
      );
    }
  },
};