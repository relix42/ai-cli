/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { 
  parseInitialPrompts, 
  validateInitialPrompts, 
  formatPromptsForDisplay,
  createSampleInitialPromptsFile 
} from './initialPrompts.js';
import { CliArgs } from '../config/config.js';

// Mock fs
vi.mock('fs', () => ({
  readFileSync: vi.fn(),
  writeFileSync: vi.fn(),
  existsSync: vi.fn(),
  mkdirSync: vi.fn(),
}));

describe('parseInitialPrompts', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetAllMocks();
    process.env = { ...originalEnv };
    delete process.env.GROOVEFORGE_INITIAL_PROMPTS;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should parse single initial prompt from CLI args', () => {
    const argv: Partial<CliArgs> = {
      initialPrompt: 'Hello world',
    };

    const result = parseInitialPrompts(argv as CliArgs);

    expect(result).toEqual({
      prompts: ['Hello world'],
      quiet: false,
    });
  });

  it('should parse multiple initial prompts from CLI args', () => {
    const argv: Partial<CliArgs> = {
      initialPrompts: 'prompt1;prompt2;prompt3',
    };

    const result = parseInitialPrompts(argv as CliArgs);

    expect(result).toEqual({
      prompts: ['prompt1', 'prompt2', 'prompt3'],
      quiet: false,
    });
  });

  it('should handle quiet mode', () => {
    const argv: Partial<CliArgs> = {
      initialPrompt: 'Hello world',
      quietInitialPrompts: true,
    };

    const result = parseInitialPrompts(argv as CliArgs);

    expect(result).toEqual({
      prompts: ['Hello world'],
      quiet: true,
    });
  });

  it('should parse prompts from file', () => {
    const argv: Partial<CliArgs> = {
      initialPromptsFile: '/path/to/prompts.txt',
    };

    vi.mocked(fs.readFileSync).mockReturnValue(`
# This is a comment
prompt1

prompt2
# Another comment
prompt3
`);

    const result = parseInitialPrompts(argv as CliArgs);

    expect(result).toEqual({
      prompts: ['prompt1', 'prompt2', 'prompt3'],
      quiet: false,
    });
    expect(fs.readFileSync).toHaveBeenCalledWith(path.resolve('/path/to/prompts.txt'), 'utf8');
  });

  it('should handle file read errors gracefully', () => {
    const argv: Partial<CliArgs> = {
      initialPromptsFile: '/nonexistent/file.txt',
    };

    vi.mocked(fs.readFileSync).mockImplementation(() => {
      throw new Error('File not found');
    });

    expect(() => parseInitialPrompts(argv as CliArgs)).toThrow(
      'Failed to read initial prompts file "/nonexistent/file.txt": File not found'
    );
  });

  it('should fall back to environment variable', () => {
    const argv: Partial<CliArgs> = {};
    process.env.GROOVEFORGE_INITIAL_PROMPTS = 'env1;env2';

    const result = parseInitialPrompts(argv as CliArgs);

    expect(result).toEqual({
      prompts: ['env1', 'env2'],
      quiet: false,
    });
  });

  it('should fall back to config file', () => {
    const argv: Partial<CliArgs> = {};
    
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({
      initialPrompts: ['config1', 'config2']
    }));

    const result = parseInitialPrompts(argv as CliArgs);

    expect(result).toEqual({
      prompts: ['config1', 'config2'],
      quiet: false,
    });
    expect(fs.existsSync).toHaveBeenCalledWith(path.join(process.cwd(), '.grooveforge', 'config.json'));
  });

  it('should handle config file with initialPromptsFile', () => {
    const argv: Partial<CliArgs> = {};
    
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync)
      .mockReturnValueOnce(JSON.stringify({
        initialPromptsFile: '.grooveforge/startup.txt'
      }))
      .mockReturnValueOnce('file1\nfile2\n');

    const result = parseInitialPrompts(argv as CliArgs);

    expect(result).toEqual({
      prompts: ['file1', 'file2'],
      quiet: false,
    });
  });

  it('should prioritize CLI args over environment and config', () => {
    const argv: Partial<CliArgs> = {
      initialPrompt: 'cli-prompt',
    };
    process.env.GROOVEFORGE_INITIAL_PROMPTS = 'env-prompt';
    
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({
      initialPrompts: ['config-prompt']
    }));

    const result = parseInitialPrompts(argv as CliArgs);

    expect(result).toEqual({
      prompts: ['cli-prompt'],
      quiet: false,
    });
  });

  it('should handle empty prompts gracefully', () => {
    const argv: Partial<CliArgs> = {
      initialPrompts: ';;; ; ;',
    };

    const result = parseInitialPrompts(argv as CliArgs);

    expect(result).toEqual({
      prompts: [],
      quiet: false,
    });
  });

  it('should handle config file errors gracefully', () => {
    const argv: Partial<CliArgs> = {};
    
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockImplementation(() => {
      throw new Error('Permission denied');
    });

    // Should not throw, just warn and return empty
    const result = parseInitialPrompts(argv as CliArgs);

    expect(result).toEqual({
      prompts: [],
      quiet: false,
    });
  });
});

describe('validateInitialPrompts', () => {
  it('should validate normal prompts', () => {
    const prompts = ['Hello', 'What is this project?'];
    const result = validateInitialPrompts(prompts);

    expect(result).toEqual({
      valid: true,
      errors: [],
    });
  });

  it('should reject too many prompts', () => {
    const prompts = Array(15).fill('prompt');
    const result = validateInitialPrompts(prompts);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Too many initial prompts (15). Maximum recommended is 10.');
  });

  it('should reject prompts that are too long', () => {
    const prompts = ['a'.repeat(1500)];
    const result = validateInitialPrompts(prompts);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Prompt 1 is too long (1500 characters). Maximum recommended is 1000.');
  });

  it('should detect dangerous commands', () => {
    const prompts = ['rm -rf /', 'shutdown now', 'format c:'];
    const result = validateInitialPrompts(prompts);

    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors.some(e => e.includes('dangerous command'))).toBe(true);
  });

  it('should allow safe commands', () => {
    const prompts = ['/tools list', 'What files are in this project?', 'Please analyze the code'];
    const result = validateInitialPrompts(prompts);

    expect(result).toEqual({
      valid: true,
      errors: [],
    });
  });
});

describe('formatPromptsForDisplay', () => {
  it('should format prompts for display', () => {
    const prompts = ['prompt1', 'prompt2'];
    const result = formatPromptsForDisplay(prompts, false);

    expect(result).toContain('🚀 **Executing 2 initial prompts:**');
    expect(result).toContain('1. prompt1');
    expect(result).toContain('2. prompt2');
  });

  it('should handle single prompt', () => {
    const prompts = ['single prompt'];
    const result = formatPromptsForDisplay(prompts, false);

    expect(result).toContain('🚀 **Executing 1 initial prompt:**');
    expect(result).toContain('1. single prompt');
  });

  it('should return empty string in quiet mode', () => {
    const prompts = ['prompt1', 'prompt2'];
    const result = formatPromptsForDisplay(prompts, true);

    expect(result).toBe('');
  });

  it('should return empty string for no prompts', () => {
    const prompts: string[] = [];
    const result = formatPromptsForDisplay(prompts, false);

    expect(result).toBe('');
  });
});

describe('createSampleInitialPromptsFile', () => {
  it('should create sample file with proper content', () => {
    const filePath = '/test/path/prompts.txt';
    
    vi.mocked(fs.existsSync).mockReturnValue(false);

    createSampleInitialPromptsFile(filePath);

    expect(fs.mkdirSync).toHaveBeenCalledWith('/test/path', { recursive: true });
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      filePath,
      expect.stringContaining('# GrooveForge Initial Prompts'),
      'utf8'
    );
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      filePath,
      expect.stringContaining('/tools list'),
      'utf8'
    );
  });

  it('should handle directory creation errors', () => {
    const filePath = '/test/path/prompts.txt';
    
    vi.mocked(fs.mkdirSync).mockImplementation(() => {
      throw new Error('Permission denied');
    });

    expect(() => createSampleInitialPromptsFile(filePath)).toThrow(
      'Failed to create sample file "/test/path/prompts.txt": Permission denied'
    );
  });
});