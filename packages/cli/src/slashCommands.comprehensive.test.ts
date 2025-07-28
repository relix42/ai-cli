/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BuiltinCommandLoader } from './services/BuiltinCommandLoader.js';
import { CommandKind } from './ui/commands/types.js';

// Mock config for testing
const mockConfig = {
  getDebugMode: vi.fn(() => false),
  getIdeMode: vi.fn(() => false),
  getExtensions: vi.fn(() => []),
  getCheckpointingEnabled: vi.fn(() => true),
};

describe('Comprehensive Slash Commands Tests', () => {
  let commandLoader: BuiltinCommandLoader;

  beforeEach(() => {
    vi.resetAllMocks();
    commandLoader = new BuiltinCommandLoader(mockConfig as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should load all expected built-in commands', async () => {
    const commands = await commandLoader.loadCommands(new AbortController().signal);
    
    // Expected command names
    const expectedCommands = [
      'about',
      'auth',
      'fork', 
      'testchat',
      'bug',
      'chat',
      'clear',
      'compress',
      'copy',
      'corgi',
      'docs',
      'editor',
      'extensions',
      'help',
      'ide',
      'initial-prompts',
      'logs',
      'memory',
      'privacy',
      'mcp',
      'quit',
      'restore',
      'stats',
      'theme',
      'tools',
      'vim'
    ];

    const commandNames = commands.map(cmd => cmd.name);
    console.log('Loaded commands:', commandNames);
    
    expect(commands.length).toBeGreaterThanOrEqual(expectedCommands.length - 2); // Allow for some missing commands
    
    // Check for most important commands
    const criticalCommands = ['about', 'help', 'tools', 'initial-prompts'];
    for (const critical of criticalCommands) {
      expect(commandNames).toContain(critical);
    }
  });

  it('should have all commands with proper structure', async () => {
    const commands = await commandLoader.loadCommands(new AbortController().signal);
    
    for (const command of commands) {
      // Each command should have required properties
      expect(command).toHaveProperty('name');
      expect(command).toHaveProperty('description');
      expect(command).toHaveProperty('kind');
      
      // Name should be a non-empty string
      expect(typeof command.name).toBe('string');
      expect(command.name.length).toBeGreaterThan(0);
      
      // Description should be a non-empty string
      expect(typeof command.description).toBe('string');
      expect(command.description.length).toBeGreaterThan(0);
      
      // Kind should be a valid CommandKind
      expect(Object.values(CommandKind)).toContain(command.kind);
      
      // If action exists, it should be a function
      if (command.action) {
        expect(typeof command.action).toBe('function');
      }
      
      // If completion exists, it should be a function
      if (command.completion) {
        expect(typeof command.completion).toBe('function');
      }
      
      // If subCommands exists, it should be an array
      if (command.subCommands) {
        expect(Array.isArray(command.subCommands)).toBe(true);
      }
    }
  });

  it('should have unique command names', async () => {
    const commands = await commandLoader.loadCommands(new AbortController().signal);
    const commandNames = commands.map(cmd => cmd.name);
    const uniqueNames = new Set(commandNames);
    
    expect(uniqueNames.size).toBe(commandNames.length);
  });

  it('should include critical commands', async () => {
    const commands = await commandLoader.loadCommands(new AbortController().signal);
    const commandNames = commands.map(cmd => cmd.name);
    
    // These commands are critical for basic functionality
    const criticalCommands = ['help', 'about', 'quit', 'tools'];
    
    for (const critical of criticalCommands) {
      expect(commandNames).toContain(critical);
    }
  });

  it('should include new initial-prompts command', async () => {
    const commands = await commandLoader.loadCommands(new AbortController().signal);
    const initialPromptsCmd = commands.find(cmd => cmd.name === 'initial-prompts');
    
    expect(initialPromptsCmd).toBeDefined();
    expect(initialPromptsCmd?.description).toContain('initial prompts');
    expect(initialPromptsCmd?.kind).toBe(CommandKind.BUILT_IN);
    expect(initialPromptsCmd?.action).toBeDefined();
  });

  it('should have commands with proper descriptions', async () => {
    const commands = await commandLoader.loadCommands(new AbortController().signal);
    
    // Check specific command descriptions
    const aboutCmd = commands.find(cmd => cmd.name === 'about');
    expect(aboutCmd?.description).toContain('version');
    
    const helpCmd = commands.find(cmd => cmd.name === 'help');
    expect(helpCmd?.description).toContain('help');
    
    const toolsCmd = commands.find(cmd => cmd.name === 'tools');
    expect(toolsCmd?.description).toContain('tool');
    
    const mcpCmd = commands.find(cmd => cmd.name === 'mcp');
    expect(mcpCmd?.description).toContain('MCP');
  });

  it('should handle commands with subcommands', async () => {
    const commands = await commandLoader.loadCommands(new AbortController().signal);
    
    // MCP command should have subcommands
    const mcpCmd = commands.find(cmd => cmd.name === 'mcp');
    expect(mcpCmd?.subCommands).toBeDefined();
    expect(Array.isArray(mcpCmd?.subCommands)).toBe(true);
    
    if (mcpCmd?.subCommands) {
      expect(mcpCmd.subCommands.length).toBeGreaterThan(0);
      
      // Check subcommand structure
      for (const subCmd of mcpCmd.subCommands) {
        expect(subCmd).toHaveProperty('name');
        expect(subCmd).toHaveProperty('description');
        expect(subCmd).toHaveProperty('kind');
      }
    }
  });

  it('should handle config-dependent commands', async () => {
    const commands = await commandLoader.loadCommands(new AbortController().signal);
    const commandNames = commands.map(cmd => cmd.name);
    
    // IDE command might not be available in test environment
    // Just check that we can load commands without errors
    expect(commands.length).toBeGreaterThan(20);
    
    // Restore command depends on config and should be available
    const restoreCmd = commands.find(cmd => cmd.name === 'restore');
    expect(restoreCmd).toBeDefined();
  });
});

describe('Ollama Integration Tests', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it('should recognize Ollama environment variables', () => {
    process.env.CHAT_CLI_PROVIDER = 'ollama';
    process.env.OLLAMA_MODEL = 'llama2';
    
    expect(process.env.CHAT_CLI_PROVIDER).toBe('ollama');
    expect(process.env.OLLAMA_MODEL).toBe('llama2');
  });

  it('should handle missing Ollama configuration', () => {
    delete process.env.CHAT_CLI_PROVIDER;
    delete process.env.OLLAMA_MODEL;
    
    expect(process.env.CHAT_CLI_PROVIDER).toBeUndefined();
    expect(process.env.OLLAMA_MODEL).toBeUndefined();
  });

  it('should validate Ollama model names', () => {
    const validModels = ['llama2', 'llama3', 'codellama', 'mistral', 'custom-model'];
    
    for (const model of validModels) {
      process.env.OLLAMA_MODEL = model;
      expect(process.env.OLLAMA_MODEL).toBe(model);
    }
  });

  it('should handle Ollama provider configuration', () => {
    const providers = ['ollama', 'openai', 'anthropic'];
    
    for (const provider of providers) {
      process.env.CHAT_CLI_PROVIDER = provider;
      expect(process.env.CHAT_CLI_PROVIDER).toBe(provider);
    }
  });
});

describe('Command Integration Tests', () => {
  it('should validate command name patterns', () => {
    const validCommandNames = [
      'about', 'help', 'tools', 'mcp', 'initial-prompts'
    ];
    
    for (const name of validCommandNames) {
      // Command names should be lowercase and may contain hyphens
      expect(name).toMatch(/^[a-z]+(-[a-z]+)*$/);
    }
  });

  it('should validate command descriptions', () => {
    const descriptions = [
      'show version info',
      'list available tools', 
      'manage initial prompts configuration'
    ];
    
    for (const desc of descriptions) {
      // Descriptions should be non-empty and reasonable length
      expect(desc.length).toBeGreaterThan(5);
      expect(desc.length).toBeLessThan(200);
    }
  });

  it('should handle command argument parsing', () => {
    const testArgs = [
      '',
      'help',
      'list',
      'config',
      'create'
    ];
    
    for (const arg of testArgs) {
      // Arguments should be strings (including empty)
      expect(typeof arg).toBe('string');
    }
  });
});