/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { OllamaClient, OllamaMessage } from './OllamaClient.js';
import { ClaudeClient, ClaudeMessage } from './ClaudeClient.js';

export type ChatProvider = 'ollama' | 'claude';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatResponse {
  content: string;
  model: string;
  provider: ChatProvider;
}

export interface ChatStreamChunk {
  content: string;
  done: boolean;
  model: string;
  provider: ChatProvider;
}

export interface ChatClientConfig {
  provider: ChatProvider;
  ollama?: {
    host: string;
    model: string;
  };
  claude?: {
    apiKey: string;
    model: string;
    maxTokens: number;
  };
}

export class ChatClient {
  private config: ChatClientConfig;
  private ollamaClient?: OllamaClient;
  private claudeClient?: ClaudeClient;

  constructor(config: ChatClientConfig) {
    this.config = config;
    this.initializeClients();
  }

  private initializeClients() {
    if (this.config.provider === 'ollama' && this.config.ollama) {
      this.ollamaClient = new OllamaClient(this.config.ollama);
    } else if (this.config.provider === 'claude' && this.config.claude) {
      this.claudeClient = new ClaudeClient(this.config.claude);
    } else {
      throw new Error(`Invalid provider configuration: ${this.config.provider}`);
    }
  }

  async chat(messages: ChatMessage[]): Promise<ChatResponse> {
    if (this.config.provider === 'ollama' && this.ollamaClient) {
      const ollamaMessages: OllamaMessage[] = messages.map(msg => ({
        role: msg.role as 'user' | 'assistant' | 'system',
        content: msg.content,
      }));

      const response = await this.ollamaClient.chat(ollamaMessages);
      return {
        content: response.message.content,
        model: response.model,
        provider: 'ollama',
      };
    } else if (this.config.provider === 'claude' && this.claudeClient) {
      // Separate system messages from user/assistant messages for Claude
      const systemMessages = messages.filter(msg => msg.role === 'system');
      const chatMessages: ClaudeMessage[] = messages
        .filter(msg => msg.role !== 'system')
        .map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        }));

      const systemPrompt = systemMessages.map(msg => msg.content).join('\n');
      const response = await this.claudeClient.chat(chatMessages, systemPrompt || undefined);
      
      return {
        content: response.content[0]?.text || '',
        model: response.model,
        provider: 'claude',
      };
    } else {
      throw new Error(`No client available for provider: ${this.config.provider}`);
    }
  }

  async *chatStream(messages: ChatMessage[]): AsyncGenerator<ChatStreamChunk> {
    if (this.config.provider === 'ollama' && this.ollamaClient) {
      const ollamaMessages: OllamaMessage[] = messages.map(msg => ({
        role: msg.role as 'user' | 'assistant' | 'system',
        content: msg.content,
      }));

      for await (const chunk of this.ollamaClient.chatStream(ollamaMessages)) {
        yield {
          content: chunk.message.content,
          done: chunk.done,
          model: chunk.model,
          provider: 'ollama',
        };
      }
    } else if (this.config.provider === 'claude' && this.claudeClient) {
      const systemMessages = messages.filter(msg => msg.role === 'system');
      const chatMessages: ClaudeMessage[] = messages
        .filter(msg => msg.role !== 'system')
        .map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        }));

      const systemPrompt = systemMessages.map(msg => msg.content).join('\n');
      
      for await (const chunk of this.claudeClient.chatStream(chatMessages, systemPrompt || undefined)) {
        if (chunk.type === 'content_block_delta' && chunk.delta?.text) {
          yield {
            content: chunk.delta.text,
            done: false,
            model: this.claudeClient.getModel(),
            provider: 'claude',
          };
        } else if (chunk.type === 'message_stop') {
          yield {
            content: '',
            done: true,
            model: this.claudeClient.getModel(),
            provider: 'claude',
          };
        }
      }
    } else {
      throw new Error(`No client available for provider: ${this.config.provider}`);
    }
  }

  async isAvailable(): Promise<boolean> {
    if (this.config.provider === 'ollama' && this.ollamaClient) {
      return this.ollamaClient.isAvailable();
    } else if (this.config.provider === 'claude' && this.claudeClient) {
      return this.claudeClient.isAvailable();
    }
    return false;
  }

  getProvider(): ChatProvider {
    return this.config.provider;
  }

  getModel(): string {
    if (this.config.provider === 'ollama' && this.ollamaClient) {
      return this.ollamaClient.getModel();
    } else if (this.config.provider === 'claude' && this.claudeClient) {
      return this.claudeClient.getModel();
    }
    return 'unknown';
  }

  static createFromEnvironment(): ChatClient {
    const provider = process.env.CHAT_CLI_PROVIDER as ChatProvider;
    
    if (!provider) {
      throw new Error('CHAT_CLI_PROVIDER environment variable is required');
    }

    const config: ChatClientConfig = { provider };

    if (provider === 'ollama') {
      const model = process.env.OLLAMA_MODEL || 'llama2';
      const host = process.env.OLLAMA_HOST || 'http://localhost:11434';
      
      config.ollama = { host, model };
    } else if (provider === 'claude') {
      const apiKey = process.env.CLAUDE_API_KEY;
      if (!apiKey) {
        throw new Error('CLAUDE_API_KEY environment variable is required for Claude provider');
      }
      
      const model = process.env.CLAUDE_MODEL || 'claude-3-sonnet-20240229';
      const maxTokens = parseInt(process.env.CLAUDE_MAX_TOKENS || '4096');
      
      config.claude = { apiKey, model, maxTokens };
    } else {
      throw new Error(`Unsupported provider: ${provider}`);
    }

    return new ChatClient(config);
  }
}