/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  CountTokensResponse,
  GenerateContentResponse,
  GenerateContentParameters,
  CountTokensParameters,
  EmbedContentResponse,
  EmbedContentParameters,
  GoogleGenAI,
} from '@google/genai';
import { createCodeAssistContentGenerator } from '../code_assist/codeAssist.js';
import { DEFAULT_GEMINI_MODEL } from '../config/models.js';
import { Config } from '../config/config.js';
import { getEffectiveModel } from './modelCheck.js';
import { UserTierId } from '../code_assist/types.js';
import { OllamaContentGenerator } from '../local-ai/OllamaContentGenerator.js';
import { ClaudeContentGenerator } from '../local-ai/ClaudeContentGenerator.js';

/**
 * Interface abstracting the core functionalities for generating content and counting tokens.
 */
export interface ContentGenerator {
  generateContent(
    request: GenerateContentParameters,
  ): Promise<GenerateContentResponse>;

  generateContentStream(
    request: GenerateContentParameters,
  ): Promise<AsyncGenerator<GenerateContentResponse>>;

  countTokens(request: CountTokensParameters): Promise<CountTokensResponse>;

  embedContent(request: EmbedContentParameters): Promise<EmbedContentResponse>;

  userTier?: UserTierId;
}

export enum AuthType {
  LOGIN_WITH_GOOGLE = 'oauth-personal',
  USE_GEMINI = 'gemini-api-key',
  USE_VERTEX_AI = 'vertex-ai',
  CLOUD_SHELL = 'cloud-shell',
}

export type ContentGeneratorConfig = {
  model: string;
  apiKey?: string;
  vertexai?: boolean;
  authType?: AuthType | undefined;
  proxy?: string | undefined;
};

export function createContentGeneratorConfig(
  config: Config,
  authType: AuthType | string | undefined,
): ContentGeneratorConfig {
  const geminiApiKey = process.env.GEMINI_API_KEY || undefined;
  const googleApiKey = process.env.GOOGLE_API_KEY || undefined;
  const googleCloudProject = process.env.GOOGLE_CLOUD_PROJECT || undefined;
  const googleCloudLocation = process.env.GOOGLE_CLOUD_LOCATION || undefined;

  // Use runtime model from config if available; otherwise, fall back to parameter or default
  const effectiveModel = config.getModel() || DEFAULT_GEMINI_MODEL;

  const contentGeneratorConfig: ContentGeneratorConfig = {
    model: effectiveModel,
    authType: authType as AuthType,
    proxy: config?.getProxy(),
  };

  // GrooveForge: Handle local AI providers
  if (authType === 'OLLAMA') {
    // For Ollama, we'll use the configured model or default
    const ollamaModel = process.env.OLLAMA_MODEL || process.env.CHAT_CLI_MODEL || 'llama3.2';
    contentGeneratorConfig.model = ollamaModel;
    return contentGeneratorConfig;
  }

  if (authType === 'CLAUDE') {
    // For Claude, use the configured model or default
    const claudeModel = process.env.CLAUDE_MODEL || 'claude-3-5-sonnet-20241022';
    contentGeneratorConfig.model = claudeModel;
    contentGeneratorConfig.apiKey = process.env.CLAUDE_API_KEY;
    return contentGeneratorConfig;
  }

  // If we are using Google auth or we are in Cloud Shell, there is nothing else to validate for now
  if (
    authType === AuthType.LOGIN_WITH_GOOGLE ||
    authType === AuthType.CLOUD_SHELL
  ) {
    return contentGeneratorConfig;
  }

  if (authType === AuthType.USE_GEMINI && geminiApiKey) {
    contentGeneratorConfig.apiKey = geminiApiKey;
    contentGeneratorConfig.vertexai = false;
    getEffectiveModel(
      contentGeneratorConfig.apiKey,
      contentGeneratorConfig.model,
      contentGeneratorConfig.proxy,
    );

    return contentGeneratorConfig;
  }

  if (
    authType === AuthType.USE_VERTEX_AI &&
    (googleApiKey || (googleCloudProject && googleCloudLocation))
  ) {
    contentGeneratorConfig.apiKey = googleApiKey;
    contentGeneratorConfig.vertexai = true;

    return contentGeneratorConfig;
  }

  return contentGeneratorConfig;
}

export async function createContentGenerator(
  config: ContentGeneratorConfig,
  gcConfig: Config,
  sessionId?: string,
): Promise<ContentGenerator> {
  const version = process.env.CLI_VERSION || process.version;
  const httpOptions = {
    headers: {
      'User-Agent': `GrooveForge/${version} (${process.platform}; ${process.arch})`,
    },
  };

  try {
    // GrooveForge: Handle local AI providers
    if ((config.authType as any) === 'OLLAMA') {
      const ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434';
      console.log(`[GrooveForge] Using Ollama: ${config.model} at ${ollamaUrl}`);
      return new OllamaContentGenerator(config.model, ollamaUrl) as any;
    }

    if ((config.authType as any) === 'CLAUDE') {
      if (!config.apiKey) {
        throw new Error('CLAUDE_API_KEY is required for Claude authentication');
      }
      console.log(`[GrooveForge] Using Claude: ${config.model}`);
      return new ClaudeContentGenerator(config.apiKey, config.model) as any;
    }

    // Google-based providers
    if (
      config.authType === AuthType.LOGIN_WITH_GOOGLE ||
      config.authType === AuthType.CLOUD_SHELL
    ) {
      return createCodeAssistContentGenerator(
        httpOptions,
        config.authType,
        gcConfig,
        sessionId,
      );
    }

    if (
      config.authType === AuthType.USE_GEMINI ||
      config.authType === AuthType.USE_VERTEX_AI
    ) {
      const googleGenAI = new GoogleGenAI({
        apiKey: config.apiKey === '' ? undefined : config.apiKey,
        vertexai: config.vertexai,
        httpOptions,
      });

      return googleGenAI.models;
    }

    throw new Error(
      `Error creating contentGenerator: Unsupported authType: ${config.authType}`,
    );
  } catch (error) {
    console.error('[GrooveForge] Content generator creation error:', error);
    
    // Return a fallback error generator instead of crashing
    return {
      async generateContent() {
        return {
          candidates: [
            {
              content: {
                parts: [{ 
                  text: `❌ **Content Generator Error**: ${error instanceof Error ? error.message : String(error)}\n\n**Please check your configuration and try again.**` 
                }],
                role: 'model',
              },
              finishReason: 'STOP',
              index: 0,
            },
          ],
          usageMetadata: {
            promptTokenCount: 0,
            candidatesTokenCount: 0,
            totalTokenCount: 0,
          },
        } as any;
      },
      async generateContentStream() {
        const self = this;
        return (async function* () {
          yield {
            candidates: [
              {
                content: {
                  parts: [{ 
                    text: `❌ **Content Generator Error**: ${error instanceof Error ? error.message : String(error)}` 
                  }],
                  role: 'model',
                },
                finishReason: 'STOP',
                index: 0,
              },
            ],
          } as any;
        })();
      },
      async countTokens() {
        return { totalTokens: 0 };
      },
      async embedContent() {
        throw new Error('Embedding not available due to configuration error');
      },
    } as any;
  }
}
