/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as fs from 'fs';
import * as path from 'path';
import { CliArgs } from '../config/config.js';

export interface InitialPromptConfig {
  prompts: string[];
  quiet: boolean;
}

/**
 * Parse initial prompts from CLI arguments and environment variables
 */
export function parseInitialPrompts(argv: CliArgs): InitialPromptConfig {
  const prompts: string[] = [];
  const quiet = argv.quietInitialPrompts || false;

  // 1. Check command line options
  if (argv.initialPrompt) {
    prompts.push(argv.initialPrompt);
  } else if (argv.initialPrompts) {
    // Split by semicolon and clean up
    const splitPrompts = argv.initialPrompts
      .split(';')
      .map(p => p.trim())
      .filter(p => p.length > 0);
    prompts.push(...splitPrompts);
  } else if (argv.initialPromptsFile) {
    // Read from file
    try {
      const filePath = path.resolve(argv.initialPromptsFile);
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const filePrompts = fileContent
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0 && !line.startsWith('#')); // Skip empty lines and comments
      prompts.push(...filePrompts);
    } catch (error) {
      throw new Error(`Failed to read initial prompts file "${argv.initialPromptsFile}": ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // 2. Check environment variable as fallback
  if (prompts.length === 0) {
    const envPrompts = process.env.GROOVEFORGE_INITIAL_PROMPTS;
    if (envPrompts) {
      const splitPrompts = envPrompts
        .split(';')
        .map(p => p.trim())
        .filter(p => p.length > 0);
      prompts.push(...splitPrompts);
    }
  }

  // 3. Check configuration file
  if (prompts.length === 0) {
    try {
      const configPath = path.join(process.cwd(), '.grooveforge', 'config.json');
      if (fs.existsSync(configPath)) {
        const configContent = fs.readFileSync(configPath, 'utf8');
        const config = JSON.parse(configContent);
        
        if (config.initialPrompts && Array.isArray(config.initialPrompts)) {
          prompts.push(...config.initialPrompts.filter((p: any) => typeof p === 'string' && p.trim().length > 0));
        } else if (config.initialPromptsFile && typeof config.initialPromptsFile === 'string') {
          const filePath = path.resolve(config.initialPromptsFile);
          const fileContent = fs.readFileSync(filePath, 'utf8');
          const filePrompts = fileContent
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0 && !line.startsWith('#'));
          prompts.push(...filePrompts);
        }
      }
    } catch (error) {
      // Silently ignore config file errors - it's optional
      console.warn(`[GrooveForge] Warning: Could not read initial prompts from config file: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  return { prompts, quiet };
}

/**
 * Create a sample initial prompts file
 */
export function createSampleInitialPromptsFile(filePath: string): void {
  const sampleContent = `# GrooveForge Initial Prompts
# Lines starting with # are comments and will be ignored
# Each non-empty line is treated as a separate prompt

# Example: Load project context
/tools list

# Example: Show current status
What files are in this project and what is the main purpose?

# Example: Set up development context
Please analyze the project structure and tell me what kind of project this is.

# Example: Custom initialization
# Add your own prompts here...
`;

  try {
    // Ensure directory exists
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(filePath, sampleContent, 'utf8');
    console.log(`[GrooveForge] Created sample initial prompts file: ${filePath}`);
  } catch (error) {
    throw new Error(`Failed to create sample file "${filePath}": ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Validate that initial prompts are reasonable
 */
export function validateInitialPrompts(prompts: string[]): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (prompts.length > 10) {
    errors.push(`Too many initial prompts (${prompts.length}). Maximum recommended is 10.`);
  }

  for (let i = 0; i < prompts.length; i++) {
    const prompt = prompts[i];
    
    if (prompt.length > 1000) {
      errors.push(`Prompt ${i + 1} is too long (${prompt.length} characters). Maximum recommended is 1000.`);
    }
    
    // Check for potentially dangerous commands
    const dangerousPatterns = [
      /rm\s+-rf/i,
      /del\s+\/[sq]/i,
      /format\s+c:/i,
      /shutdown/i,
      /reboot/i,
    ];
    
    for (const pattern of dangerousPatterns) {
      if (pattern.test(prompt)) {
        errors.push(`Prompt ${i + 1} contains potentially dangerous command: "${prompt.substring(0, 50)}..."`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Format prompts for display
 */
export function formatPromptsForDisplay(prompts: string[], quiet: boolean): string {
  if (quiet || prompts.length === 0) {
    return '';
  }

  const header = `🚀 **Executing ${prompts.length} initial prompt${prompts.length === 1 ? '' : 's'}:**\n`;
  const formattedPrompts = prompts
    .map((prompt, index) => `${index + 1}. ${prompt}`)
    .join('\n');
  
  return header + formattedPrompts + '\n';
}