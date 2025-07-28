/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Gets the display model name, prioritizing Chat CLI providers over Gemini models
 */
export function getDisplayModel(geminiModel: string): string {
  const provider = process.env.CHAT_CLI_PROVIDER;
  
  if (provider === 'ollama') {
    const ollamaModel = process.env.OLLAMA_MODEL || 'llama2';
    return `ollama/${ollamaModel}`;
  } else if (provider === 'claude') {
    const claudeModel = process.env.CLAUDE_MODEL || 'claude-3-sonnet-20240229';
    return `claude/${claudeModel}`;
  }
  
  // Return actual technical model name for Gemini models
  return geminiModel;
}

/**
 * Formats token count for display
 */
export function formatTokenCount(inputTokens: number, outputTokens: number): string {
  if (inputTokens === 0 && outputTokens === 0) {
    return 'Ready';
  }
  return `↑${inputTokens} ↓${outputTokens}`;
}

/**
 * Gets token count information for the current provider
 */
export function getTokenCountInfo(inputTokens: number = 0, outputTokens: number = 0): { 
  showTokens: boolean; 
  inputTokens: number; 
  outputTokens: number; 
} {
  const provider = process.env.CHAT_CLI_PROVIDER;
  
  // Show token counts for Chat CLI providers
  if (provider === 'ollama' || provider === 'claude') {
    return {
      showTokens: true,
      inputTokens,
      outputTokens
    };
  }
  
  // For Gemini, we don't show separate token counts as it uses the existing context display
  return {
    showTokens: false,
    inputTokens: 0,
    outputTokens: 0
  };
}

/**
 * Checks if we're using a Chat CLI provider
 */
export function isUsingChatCLI(): boolean {
  const provider = process.env.CHAT_CLI_PROVIDER;
  return provider === 'ollama' || provider === 'claude';
}