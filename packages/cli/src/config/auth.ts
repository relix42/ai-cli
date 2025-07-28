/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { AuthType } from '@relix42/grooveforge-core';
import { loadEnvironment } from './settings.js';
import { OllamaClient } from '../clients/OllamaClient.js';

export const validateAuthMethod = async (authMethod: string): Promise<string | null> => {
  loadEnvironment();
  
  // GrooveForge: Handle local AI providers
  if (authMethod === 'OLLAMA') {
    // Check if Ollama is configured
    if (process.env.CHAT_CLI_PROVIDER !== 'ollama') {
      // Try to auto-detect and configure Ollama
      const autoConfigResult = await tryAutoConfigureOllama();
      if (autoConfigResult.success) {
        return null; // Successfully configured
      } else {
        return autoConfigResult.error || null;
      }
    }
    return null;
  }
  
  if (authMethod === 'CLAUDE') {
    // Check if Claude is configured
    if (process.env.CHAT_CLI_PROVIDER !== 'claude' || !process.env.CLAUDE_API_KEY) {
      // Return special marker to trigger setup dialog
      return 'SETUP_REQUIRED:CLAUDE';
    }
    return null;
  }
  
  // Legacy Google auth methods
  if (
    authMethod === AuthType.LOGIN_WITH_GOOGLE ||
    authMethod === AuthType.CLOUD_SHELL
  ) {
    return null;
  }

  if (authMethod === AuthType.USE_GEMINI) {
    if (!process.env.GEMINI_API_KEY) {
      return 'GEMINI_API_KEY environment variable not found. Add that to your environment and try again (no reload needed if using .env)!';
    }
    return null;
  }

  if (authMethod === AuthType.USE_VERTEX_AI) {
    const hasVertexProjectLocationConfig =
      !!process.env.GOOGLE_CLOUD_PROJECT && !!process.env.GOOGLE_CLOUD_LOCATION;
    const hasGoogleApiKey = !!process.env.GOOGLE_API_KEY;
    if (!hasVertexProjectLocationConfig && !hasGoogleApiKey) {
      return (
        'When using Vertex AI, you must specify either:\n' +
        '• GOOGLE_CLOUD_PROJECT and GOOGLE_CLOUD_LOCATION environment variables.\n' +
        '• GOOGLE_API_KEY environment variable (if using express mode).\n' +
        'Update your environment and try again (no reload needed if using .env)!'
      );
    }
    return null;
  }

  return 'Invalid auth method selected.';
};

/**
 * Try to auto-configure Ollama by detecting available models
 */
async function tryAutoConfigureOllama(): Promise<{ success: boolean; error?: string }> {
  try {
    const host = process.env.OLLAMA_URL || 'http://localhost:11434';
    const client = new OllamaClient({ host, model: 'temp' });
    
    // Check if Ollama is available
    const available = await client.isAvailable();
    if (!available) {
      return {
        success: false,
        error: `🦙 **Ollama Setup Required**

❌ **Ollama is not running**

🛠️ **To get started:**
1. **Install Ollama**: https://ollama.ai
2. **Start Ollama**: \`ollama serve\`
3. **Download a model**: \`ollama pull llama3.2\`

Then restart GrooveForge and select Ollama again.`
      };
    }

    // Get available models
    const response = await client.listModels();
    if (response.models.length === 0) {
      return {
        success: false,
        error: `🦙 **Ollama Models Required**

📥 **No models found**

🛠️ **Download recommended models:**
• \`ollama pull llama3.2\` - Latest Llama (recommended)
• \`ollama pull codellama\` - Code-specialized model
• \`ollama pull phi3\` - Smaller, faster model

After downloading, restart GrooveForge and select Ollama again.`
      };
    }

    // Auto-select the best available model
    const bestModel = selectBestModel(response.models);
    
    // Set environment variables for this session
    process.env.CHAT_CLI_PROVIDER = 'ollama';
    process.env.OLLAMA_MODEL = bestModel;
    process.env.OLLAMA_URL = host;
    
    console.log(`🦙 **Ollama Auto-Configured**`);
    console.log(`✅ Selected model: ${bestModel}`);
    console.log(`🔗 Host: ${host}`);
    console.log(`💡 To make this permanent, add to your shell profile:`);
    console.log(`   export CHAT_CLI_PROVIDER="ollama"`);
    console.log(`   export OLLAMA_MODEL="${bestModel}"`);
    
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: `🦙 **Ollama Connection Error**

❌ ${error instanceof Error ? error.message : 'Unknown error'}

🛠️ **Troubleshooting:**
• Make sure Ollama is installed and running
• Check if Ollama is accessible: \`curl http://localhost:11434/api/tags\`
• Restart Ollama service: \`ollama serve\``
    };
  }
}

/**
 * Select the best available model from the list
 */
function selectBestModel(models: Array<{ name: string; size: number }>): string {
  // Priority order for model selection
  const priorities = [
    'llama3.2',
    'llama3.1', 
    'codellama',
    'llama3',
    'llama2',
    'phi3',
    'mistral',
    'qwen',
    'gemma'
  ];
  
  // Find the first priority model that exists
  for (const priority of priorities) {
    const found = models.find(model => model.name.startsWith(priority));
    if (found) {
      return found.name;
    }
  }
  
  // If no priority models found, return the first available
  return models[0]?.name || 'llama3.2';
}
