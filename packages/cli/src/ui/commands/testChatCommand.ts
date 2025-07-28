/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { CommandKind, SlashCommand } from './types.js';
import { MessageType } from '../types.js';
import { ChatClient } from '../../clients/ChatClient.js';

export const testChatCommand: SlashCommand = {
  name: 'testchat',
  description: 'test Chat CLI functionality with Ollama or Claude',
  kind: CommandKind.BUILT_IN,
  action: async (context, args) => {
    try {
      // Check if Chat CLI is configured
      const provider = process.env.CHAT_CLI_PROVIDER;
      if (!provider) {
        context.ui.addItem({
          type: MessageType.ERROR,
          text: `Chat CLI not configured. Please set CHAT_CLI_PROVIDER environment variable.

For Ollama:
  export CHAT_CLI_PROVIDER="ollama"
  export OLLAMA_MODEL="llama2"

For Claude:
  export CHAT_CLI_PROVIDER="claude"
  export CLAUDE_API_KEY="your_api_key"`
        }, Date.now());
        return;
      }

      context.ui.addItem({
        type: MessageType.INFO,
        text: `Testing Chat CLI with provider: ${provider}`
      }, Date.now());

      // Create chat client
      const chatClient = ChatClient.createFromEnvironment();

      // Test availability
      const isAvailable = await chatClient.isAvailable();
      if (!isAvailable) {
        context.ui.addItem({
          type: MessageType.ERROR,
          text: `Chat CLI provider "${provider}" is not available. Please check your configuration:

For Ollama:
  - Ensure Ollama is running: ollama serve
  - Check if model is available: ollama list

For Claude:
  - Verify your API key is correct
  - Check your internet connection`
        }, Date.now());
        return;
      }

      context.ui.addItem({
        type: MessageType.INFO,
        text: `✅ Chat CLI provider "${provider}" is available!`
      }, Date.now());

      // Test a simple chat
      const testMessage = args || 'Hello! Can you tell me what you are?';
      
      context.ui.addItem({
        type: MessageType.INFO,
        text: `Sending test message: "${testMessage}"`
      }, Date.now());

      const messages = [
        { role: 'user' as const, content: testMessage }
      ];

      try {
        const response = await chatClient.chat(messages);
        
        context.ui.addItem({
          type: MessageType.INFO,
          text: `✅ Chat CLI Response (${response.provider}/${response.model}):\n\n${response.content}`
        }, Date.now());

        context.ui.addItem({
          type: MessageType.INFO,
          text: `🎉 Chat CLI is working! You can now use it as an alternative to Google Gemini.

To use Chat CLI in your workflow:
1. Set your preferred provider with CHAT_CLI_PROVIDER
2. Use the /testchat command to test functionality
3. Future versions will integrate Chat CLI as the primary interface`
        }, Date.now());

      } catch (error) {
        context.ui.addItem({
          type: MessageType.ERROR,
          text: `Failed to get response from Chat CLI: ${error instanceof Error ? error.message : String(error)}`
        }, Date.now());
      }

    } catch (error) {
      context.ui.addItem({
        type: MessageType.ERROR,
        text: `Chat CLI error: ${error instanceof Error ? error.message : String(error)}`
      }, Date.now());
    }
  },
};