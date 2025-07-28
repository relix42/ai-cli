/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { ContentGenerator } from '../core/contentGenerator.js';

/**
 * Simple Claude content generator for GrooveForge
 */
export class ClaudeContentGenerator implements ContentGenerator {
  private apiKey: string;
  private model: string;
  private baseUrl: string;

  constructor(apiKey: string, model: string = 'claude-3-5-sonnet-20241022') {
    this.apiKey = apiKey;
    this.model = model;
    this.baseUrl = 'https://api.anthropic.com';
  }

  async generateContent(request: any): Promise<any> {
    try {
      const prompt = this.extractPrompt(request);
      
      const response = await fetch(`${this.baseUrl}/v1/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: this.model,
          max_tokens: 4096,
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Claude API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const responseText = data.content?.[0]?.text || 'No response from Claude';
      
      return {
        candidates: [{
          content: {
            parts: [{ text: responseText }],
            role: 'model',
          },
          finishReason: 'STOP',
          index: 0,
        }],
        usageMetadata: {
          promptTokenCount: data.usage?.input_tokens || Math.ceil(prompt.length / 3.5),
          candidatesTokenCount: data.usage?.output_tokens || Math.ceil(responseText.length / 3.5),
          totalTokenCount: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0),
        },
      };
    } catch (error) {
      return {
        candidates: [{
          content: {
            parts: [{ text: `❌ Claude API Error: ${error instanceof Error ? error.message : String(error)}\\n\\nTroubleshooting:\\n- Check CLAUDE_API_KEY\\n- Verify API key is valid\\n- Check network connectivity` }],
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
        
        const response = await fetch(`${self.baseUrl}/v1/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': self.apiKey,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: self.model,
            max_tokens: 4096,
            stream: true,
            messages: [{ role: 'user', content: prompt }],
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Claude API error: ${response.status} - ${errorText}`);
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
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') break;
                
                try {
                  const parsed = JSON.parse(data);
                  if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
                    yield {
                      candidates: [{
                        content: {
                          parts: [{ text: parsed.delta.text }],
                          role: 'model',
                        },
                        finishReason: undefined,
                        index: 0,
                      }],
                    };
                  }
                } catch (parseError) {
                  console.warn('Failed to parse Claude chunk:', parseError);
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
              parts: [{ text: `❌ Claude Streaming Error: ${error instanceof Error ? error.message : String(error)}` }],
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
    return { totalTokens: Math.ceil(prompt.length / 3.5) };
  }

  async embedContent(_request: any): Promise<any> {
    throw new Error('Embedding not supported for Claude');
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