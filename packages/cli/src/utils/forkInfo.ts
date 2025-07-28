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
    name: 'GrooveForge',
    version: pkgJson?.version || 'unknown',
    originalName: 'Gemini CLI',
    originalRepo: 'https://github.com/google-gemini/gemini-cli',
    forkRepo: 'https://github.com/relix42/grooveforge',
    description: 'Find your groove, forge your future - Local AI development companion',
    features: [
      'Rhythmic workflow with AI assistance',
      'Ollama integration for local AI inference',
      'Claude API support for cloud AI',
      'Privacy-first - no Google dependencies',
      'Forge ideas into reality with AI collaboration',
      'Enhanced development environment',
      'Agent workspace integration'
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