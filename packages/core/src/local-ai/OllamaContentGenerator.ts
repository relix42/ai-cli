/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { ContentGenerator } from '../core/contentGenerator.js';

/**
 * Simple Ollama content generator for GrooveForge
 */
export class OllamaContentGenerator implements ContentGenerator {
  private model: string;
  private baseUrl: string;

  constructor(model: string = 'llama3.2', baseUrl: string = 'http://localhost:11434') {
    this.model = model;
    this.baseUrl = baseUrl;
  }

  async generateContent(request: any): Promise<any> {
    try {
      const prompt = this.extractPrompt(request);
      
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.model,
          prompt: prompt,
          stream: false,
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        candidates: [{
          content: {
            parts: [{ text: data.response || 'No response from Ollama' }],
            role: 'model',
          },
          finishReason: 'STOP',
          index: 0,
        }],
        usageMetadata: {
          promptTokenCount: Math.ceil(prompt.length / 4),
          candidatesTokenCount: Math.ceil((data.response || '').length / 4),
          totalTokenCount: Math.ceil((prompt + (data.response || '')).length / 4),
        },
      };
    } catch (error) {
      return {
        candidates: [{
          content: {
            parts: [{ text: `❌ Ollama Error: ${error instanceof Error ? error.message : String(error)}\\n\\nTroubleshooting:\\n- Ensure Ollama is running: ollama serve\\n- Check model: ollama list` }],
            role: 'model',
          },
          finishReason: 'STOP',
          index: 0,
        }],
        usageMetadata: { promptTokenCount: 0, candidatesTokenCount: 0, totalTokenCount: 0 },
      };
    }
  }

  async generateContentStream(request: any): Promise<AsyncGenerator<any>> {
    const self = this;
    return (async function* () {
      try {
        const prompt = self.extractPrompt(request);
        
        const response = await fetch(`${self.baseUrl}/api/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: self.model,
            prompt: prompt,
            stream: true,
          }),
        });

        if (!response.ok) {
          throw new Error(`Ollama API error: ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error('No response body');

        const decoder = new TextDecoder();
        let buffer = '';

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (line.trim()) {
                try {
                  const data = JSON.parse(line);
                  if (data.response) {
                    yield {
                      candidates: [{
                        content: {
                          parts: [{ text: data.response }],
                          role: 'model',
                        },
                        finishReason: data.done ? 'STOP' : undefined,
                        index: 0,
                      }],
                    };
                  }
                } catch (parseError) {
                  console.warn('Failed to parse Ollama chunk:', parseError);
                }
              }
            }
          }
        } finally {
          reader.releaseLock();
        }
      } catch (error) {
        yield {
          candidates: [{
            content: {
              parts: [{ text: `❌ Ollama Streaming Error: ${error instanceof Error ? error.message : String(error)}` }],
              role: 'model',
            },
            finishReason: 'STOP',
            index: 0,
          }],
        };
      }
    })();
  }

  async countTokens(request: any): Promise<any> {
    const prompt = this.extractPrompt(request);
    return { totalTokens: Math.ceil(prompt.length / 4) };
  }

  async embedContent(_request: any): Promise<any> {
    throw new Error('Embedding not supported for Ollama');
  }

  private extractPrompt(request: any): string {
    try {
      if (!request.contents || !Array.isArray(request.contents)) return '';
      
      const parts = request.contents.flatMap((content: any) => content.parts || []);
      const textParts = parts.filter((part: any) => 'text' in part && part.text);
      
      return textParts.map((part: any) => part.text).join('\\n');
    } catch (error) {
      console.warn('Failed to extract prompt:', error);
      return '';
    }
  }
}