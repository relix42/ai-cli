/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ClaudeResponse {
  id: string;
  type: 'message';
  role: 'assistant';
  content: Array<{
    type: 'text';
    text: string;
  }>;
  model: string;
  stop_reason: string | null;
  stop_sequence: string | null;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

export interface ClaudeStreamResponse {
  type: 'message_start' | 'content_block_start' | 'content_block_delta' | 'content_block_stop' | 'message_delta' | 'message_stop';
  message?: Partial<ClaudeResponse>;
  content_block?: {
    type: 'text';
    text: string;
  };
  delta?: {
    type: 'text_delta';
    text: string;
  };
  index?: number;
}

export interface ClaudeConfig {
  apiKey: string;
  model: string;
  maxTokens: number;
}

export class ClaudeClient {
  private config: ClaudeConfig;
  private baseUrl = 'https://api.anthropic.com/v1';

  constructor(config: ClaudeConfig) {
    this.config = config;
  }

  async chat(messages: ClaudeMessage[], systemPrompt?: string): Promise<ClaudeResponse> {
    const body: any = {
      model: this.config.model,
      max_tokens: this.config.maxTokens,
      messages,
    };

    if (systemPrompt) {
      body.system = systemPrompt;
    }

    const response = await fetch(`${this.baseUrl}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.config.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Claude API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return response.json();
  }

  async *chatStream(messages: ClaudeMessage[], systemPrompt?: string): AsyncGenerator<ClaudeStreamResponse> {
    const body: any = {
      model: this.config.model,
      max_tokens: this.config.maxTokens,
      messages,
      stream: true,
    };

    if (systemPrompt) {
      body.system = systemPrompt;
    }

    const response = await fetch(`${this.baseUrl}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.config.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Claude API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Failed to get response reader');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data.trim() === '[DONE]') {
              return;
            }
            try {
              const parsed = JSON.parse(data);
              yield parsed;
            } catch (e) {
              console.warn('Failed to parse Claude response line:', data);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      // Test with a minimal request
      const response = await fetch(`${this.baseUrl}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.config.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: this.config.model,
          max_tokens: 1,
          messages: [{ role: 'user', content: 'test' }],
        }),
        signal: AbortSignal.timeout(5000), // 5 second timeout
      });
      
      // Even if the request fails due to rate limits or other issues,
      // a 4xx response usually means the API is available
      return response.status < 500;
    } catch {
      return false;
    }
  }

  getModel(): string {
    return this.config.model;
  }
}