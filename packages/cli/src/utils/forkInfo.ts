/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { getPackageJson } from './package.js';

export interface ForkInfo {
  name: string;
  version: string;
  originalName: string;
  originalRepo: string;
  forkRepo: string;
  description: string;
  features: string[];
}

export async function getForkInfo(): Promise<ForkInfo> {
  const pkgJson = await getPackageJson();
  
  return {
    name: 'Chat CLI',
    version: pkgJson?.version || 'unknown',
    originalName: 'Gemini CLI',
    originalRepo: 'https://github.com/google-gemini/gemini-cli',
    forkRepo: 'https://github.com/relix42/chat-cli',
    description: 'Local AI chat interface supporting Ollama and Claude models',
    features: [
      'Ollama model support for local AI inference',
      'Claude-code-router integration',
      'No Google dependencies or data collection',
      'Local-first AI interactions',
      'Enhanced startup script with dependency checking',
      'Agent workspace integration',
      'XDG compliance for configuration files'
    ]
  };
}

export async function getEnhancedVersionInfo(): Promise<string> {
  const forkInfo = await getForkInfo();
  
  return `${forkInfo.name} v${forkInfo.version} (fork of ${forkInfo.originalName})

Description: ${forkInfo.description}

Enhancements:
${forkInfo.features.map(feature => `  • ${feature}`).join('\n')}

Repositories:
  • Fork: ${forkInfo.forkRepo}
  • Original: ${forkInfo.originalRepo}

For more information, visit: ${forkInfo.forkRepo}`;
}

export function isFork(): boolean {
  return true; // This is always true for our AI CLI fork
}