/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

export interface OllamaMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface OllamaResponse {
  model: string;
  created_at: string;
  message: OllamaMessage;
  done: boolean;
}

export interface OllamaStreamResponse {
  model: string;
  created_at: string;
  message: {
    role: string;
    content: string;
  };
  done: boolean;
}

export interface OllamaConfig {
  host: string;
  model: string;
}

export class OllamaClient {
  private config: OllamaConfig;

  constructor(config: OllamaConfig) {
    this.config = config;
  }

  async chat(messages: OllamaMessage[]): Promise<OllamaResponse> {
    const response = await fetch(`${this.config.host}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.config.model,
        messages,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async *chatStream(messages: OllamaMessage[]): AsyncGenerator<OllamaStreamResponse> {
    const response = await fetch(`${this.config.host}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.config.model,
        messages,
        stream: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
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
          if (line.trim()) {
            try {
              const data = JSON.parse(line);
              yield data;
            } catch (e) {
              console.warn('Failed to parse Ollama response line:', line);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  async listModels(): Promise<{ models: Array<{ name: string; size: number; digest: string }> }> {
    const response = await fetch(`${this.config.host}/api/tags`);
    
    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.host}/api/tags`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000), // 5 second timeout
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  getModel(): string {
    return this.config.model;
  }

  getHost(): string {
    return this.config.host;
  }
}