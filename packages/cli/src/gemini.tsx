/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render } from 'ink';
import { AppWrapper } from './ui/App.js';
import { loadCliConfig, parseArguments, CliArgs } from './config/config.js';
import { readStdin } from './utils/readStdin.js';
import { basename } from 'node:path';
import v8 from 'node:v8';
import os from 'node:os';
import { spawn } from 'node:child_process';
import { start_sandbox } from './utils/sandbox.js';
import {
  LoadedSettings,
  loadSettings,
  SettingScope,
} from './config/settings.js';
import { themeManager } from './ui/themes/theme-manager.js';
import { getStartupWarnings } from './utils/startupWarnings.js';
import { getUserStartupWarnings } from './utils/userStartupWarnings.js';
import { runNonInteractive } from './nonInteractiveCli.js';
import { loadExtensions, Extension } from './config/extension.js';
import { cleanupCheckpoints, registerCleanup } from './utils/cleanup.js';
import { getCliVersion } from './utils/version.js';
import {
  ApprovalMode,
  Config,
  EditTool,
  ShellTool,
  WriteFileTool,
  sessionId,
  logUserPrompt,
  AuthType,
  getOauthClient,
} from '@relix42/grooveforge-core';
import { validateAuthMethod } from './config/auth.js';
import { setMaxSizedBoxDebugging } from './ui/components/shared/MaxSizedBox.js';
import { validateNonInteractiveAuth } from './validateNonInterActiveAuth.js';
import { appEvents, AppEvent } from './utils/events.js';
import { parseInitialPrompts, validateInitialPrompts, formatPromptsForDisplay } from './utils/initialPrompts.js';

function getNodeMemoryArgs(config: Config): string[] {
  const totalMemoryMB = os.totalmem() / (1024 * 1024);
  const heapStats = v8.getHeapStatistics();
  const currentMaxOldSpaceSizeMb = Math.floor(
    heapStats.heap_size_limit / 1024 / 1024,
  );

  // Set target to 50% of total memory
  const targetMaxOldSpaceSizeInMB = Math.floor(totalMemoryMB * 0.5);
  if (config.getDebugMode()) {
    console.debug(
      `Current heap size ${currentMaxOldSpaceSizeMb.toFixed(2)} MB`,
    );
  }

  if (process.env.GEMINI_CLI_NO_RELAUNCH) {
    return [];
  }

  if (targetMaxOldSpaceSizeInMB > currentMaxOldSpaceSizeMb) {
    if (config.getDebugMode()) {
      console.debug(
        `Need to relaunch with more memory: ${targetMaxOldSpaceSizeInMB.toFixed(2)} MB`,
      );
    }
    return [`--max-old-space-size=${targetMaxOldSpaceSizeInMB}`];
  }

  return [];
}

async function relaunchWithAdditionalArgs(additionalArgs: string[]) {
  const nodeArgs = [...additionalArgs, ...process.argv.slice(1)];
  const newEnv = { ...process.env, GEMINI_CLI_NO_RELAUNCH: 'true' };

  const child = spawn(process.execPath, nodeArgs, {
    stdio: 'inherit',
    env: newEnv,
  });

  await new Promise((resolve) => child.on('close', resolve));
  process.exit(0);
}
import { runAcpPeer } from './acp/acpPeer.js';

export function setupUnhandledRejectionHandler() {
  let unhandledRejectionOccurred = false;
  process.on('unhandledRejection', (reason, _promise) => {
    const errorMessage = `=========================================
This is an unexpected error. Please file a bug report using the /bug tool.
CRITICAL: Unhandled Promise Rejection!
=========================================
Reason: ${reason}${
      reason instanceof Error && reason.stack
        ? `
Stack trace:
${reason.stack}`
        : ''
    }`;
    appEvents.emit(AppEvent.LogError, errorMessage);
    if (!unhandledRejectionOccurred) {
      unhandledRejectionOccurred = true;
      appEvents.emit(AppEvent.OpenDebugConsole);
    }
  });
}

export async function main() {
  setupUnhandledRejectionHandler();
  const workspaceRoot = process.cwd();
  const settings = loadSettings(workspaceRoot);

  await cleanupCheckpoints();
  if (settings.errors.length > 0) {
    for (const error of settings.errors) {
      let errorMessage = `Error in ${error.path}: ${error.message}`;
      if (!process.env.NO_COLOR) {
        errorMessage = `\x1b[31m${errorMessage}\x1b[0m`;
      }
      console.error(errorMessage);
      console.error(`Please fix ${error.path} and try again.`);
    }
    process.exit(1);
  }

  const argv = await parseArguments();
  const extensions = loadExtensions(workspaceRoot);
  const config = await loadCliConfig(
    settings.merged,
    extensions,
    sessionId,
    argv,
  );

  if (argv.promptInteractive && !process.stdin.isTTY) {
    console.error(
      'Error: The --prompt-interactive flag is not supported when piping input from stdin.',
    );
    process.exit(1);
  }

  if (config.getListExtensions()) {
    console.log('Installed extensions:');
    for (const extension of extensions) {
      console.log(`- ${extension.config.name}`);
    }
    process.exit(0);
  }

  // Set or override auth type based on environment variables
  // Environment variables take precedence over settings for better CLI experience
  if (process.env.CLOUD_SHELL === 'true') {
    settings.setValue(
      SettingScope.User,
      'selectedAuthType',
      AuthType.CLOUD_SHELL,
    );
  } else if (process.env.CHAT_CLI_PROVIDER === 'ollama') {
    settings.setValue(
      SettingScope.User,
      'selectedAuthType',
      'OLLAMA' as AuthType,
    );
  } else if (process.env.CHAT_CLI_PROVIDER === 'claude') {
    settings.setValue(
      SettingScope.User,
      'selectedAuthType',
      'CLAUDE' as AuthType,
    );
  } else if (process.env.GEMINI_API_KEY) {
    settings.setValue(
      SettingScope.User,
      'selectedAuthType',
      AuthType.USE_GEMINI,
    );
  } else if (!settings.merged.selectedAuthType) {
    // If no environment variables are set and no auth type in settings,
    // leave selectedAuthType as undefined to trigger auth selection
  }
  // If environment variables are set, they override the settings
  // If no environment variables are set, use the existing settings value

  setMaxSizedBoxDebugging(config.getDebugMode());

  await config.initialize();

  // Load custom themes from settings
  themeManager.loadCustomThemes(settings.merged.customThemes);

  if (settings.merged.theme) {
    if (!themeManager.setActiveTheme(settings.merged.theme)) {
      // If the theme is not found during initial load, log a warning and continue.
      // The useThemeCommand hook in App.tsx will handle opening the dialog.
      console.warn(`Warning: Theme "${settings.merged.theme}" not found.`);
    }
  }

  // hop into sandbox if we are outside and sandboxing is enabled
  if (!process.env.SANDBOX) {
    const memoryArgs = settings.merged.autoConfigureMaxOldSpaceSize
      ? getNodeMemoryArgs(config)
      : [];
    const sandboxConfig = config.getSandbox();
    if (sandboxConfig) {
      if (settings.merged.selectedAuthType) {
        // Validate authentication here because the sandbox will interfere with the Oauth2 web redirect.
        try {
          const err = await validateAuthMethod(settings.merged.selectedAuthType);
          if (err) {
            throw new Error(err);
          }
          await config.refreshAuth(settings.merged.selectedAuthType);
        } catch (err) {
          console.error('Error authenticating:', err);
          process.exit(1);
        }
      }
      await start_sandbox(sandboxConfig, memoryArgs);
      process.exit(0);
    } else {
      // Not in a sandbox and not entering one, so relaunch with additional
      // arguments to control memory usage if needed.
      if (memoryArgs.length > 0) {
        await relaunchWithAdditionalArgs(memoryArgs);
        process.exit(0);
      }
    }
  }

  if (
    settings.merged.selectedAuthType === AuthType.LOGIN_WITH_GOOGLE &&
    config.isBrowserLaunchSuppressed()
  ) {
    // Do oauth before app renders to make copying the link possible.
    await getOauthClient(settings.merged.selectedAuthType, config);
  }

  if (config.getExperimentalAcp()) {
    return runAcpPeer(config, settings);
  }

  let input = config.getQuestion();
  const startupWarnings = [
    ...(await getStartupWarnings()),
    ...(await getUserStartupWarnings(workspaceRoot)),
  ];

  // Parse and validate initial prompts BEFORE determining interactive mode
  // This ensures initial prompts work in both interactive and non-interactive modes
  let initialPromptsConfig: { prompts: string[]; quiet: boolean } = { prompts: [], quiet: false };
  try {
    initialPromptsConfig = parseInitialPrompts(argv);
    
    // Validate initial prompts
    if (initialPromptsConfig.prompts.length > 0) {
      const validation = validateInitialPrompts(initialPromptsConfig.prompts);
      if (!validation.valid) {
        console.error('❌ Initial prompts validation failed:');
        validation.errors.forEach(error => console.error(`  - ${error}`));
        process.exit(1);
      }
      
      if (!initialPromptsConfig.quiet) {
        console.log(`🚀 GrooveForge will execute ${initialPromptsConfig.prompts.length} initial prompt${initialPromptsConfig.prompts.length === 1 ? '' : 's'} before user interaction.`);
      }
    }
  } catch (error) {
    console.error(`❌ Error parsing initial prompts: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }

  const shouldBeInteractive =
    !!argv.promptInteractive || (process.stdin.isTTY && input?.length === 0);

  // Render UI, passing necessary config values. Check that there is no command line question.
  if (shouldBeInteractive) {
    const version = await getCliVersion();
    
    setWindowTitle(basename(workspaceRoot), settings);
    const instance = render(
      <React.StrictMode>
        <AppWrapper
          config={config}
          settings={settings}
          startupWarnings={startupWarnings}
          version={version}
          initialPrompts={initialPromptsConfig.prompts}
          quietInitialPrompts={initialPromptsConfig.quiet}
        />
      </React.StrictMode>,
      { exitOnCtrlC: false },
    );

    registerCleanup(() => instance.unmount());
    return;
  }
  // If not a TTY, read from stdin
  // This is for cases where the user pipes input directly into the command
  if (!process.stdin.isTTY && !input) {
    input += await readStdin();
  }
  if (!input) {
    console.error('No input provided via stdin.');
    process.exit(1);
  }

  const prompt_id = Math.random().toString(16).slice(2);
  logUserPrompt(config, {
    'event.name': 'user_prompt',
    'event.timestamp': new Date().toISOString(),
    prompt: input,
    prompt_id,
    auth_type: config.getContentGeneratorConfig()?.authType,
    prompt_length: input.length,
  });

  // Non-interactive mode handled by runNonInteractive
  const nonInteractiveConfig = await loadNonInteractiveConfig(
    config,
    extensions,
    settings,
    argv,
  );
  
  // Execute initial prompts in non-interactive mode if any
  if (initialPromptsConfig.prompts.length > 0) {
    for (let i = 0; i < initialPromptsConfig.prompts.length; i++) {
      const prompt = initialPromptsConfig.prompts[i];
      const promptId = Math.random().toString(16).slice(2);
      
      if (!initialPromptsConfig.quiet) {
        console.log(`🚀 Executing initial prompt ${i + 1}/${initialPromptsConfig.prompts.length}: ${prompt}`);
      }
      
      logUserPrompt(nonInteractiveConfig, {
        'event.name': 'user_prompt',
        'event.timestamp': new Date().toISOString(),
        prompt,
        prompt_id: promptId,
        auth_type: nonInteractiveConfig.getContentGeneratorConfig()?.authType,
        prompt_length: prompt.length,
      });
      
      await runNonInteractive(nonInteractiveConfig, prompt, promptId);
    }
    
    if (!initialPromptsConfig.quiet) {
      console.log(`✅ Completed ${initialPromptsConfig.prompts.length} initial prompt${initialPromptsConfig.prompts.length === 1 ? '' : 's'}`);
    }
  }
  
  await runNonInteractive(nonInteractiveConfig, input, prompt_id);
  process.exit(0);
}

function setWindowTitle(title: string, settings: LoadedSettings) {
  if (!settings.merged.hideWindowTitle) {
    const windowTitle = (process.env.CLI_TITLE || `Gemini - ${title}`).replace(
      // eslint-disable-next-line no-control-regex
      /[\x00-\x1F\x7F]/g,
      '',
    );
    process.stdout.write(`\x1b]2;${windowTitle}\x07`);

    process.on('exit', () => {
      process.stdout.write(`\x1b]2;\x07`);
    });
  }
}

async function loadNonInteractiveConfig(
  config: Config,
  extensions: Extension[],
  settings: LoadedSettings,
  argv: CliArgs,
) {
  let finalConfig = config;
  if (config.getApprovalMode() !== ApprovalMode.YOLO) {
    // Everything is not allowed, ensure that only read-only tools are configured.
    const existingExcludeTools = settings.merged.excludeTools || [];
    const interactiveTools = [
      ShellTool.Name,
      EditTool.Name,
      WriteFileTool.Name,
    ];

    const newExcludeTools = [
      ...new Set([...existingExcludeTools, ...interactiveTools]),
    ];

    const nonInteractiveSettings = {
      ...settings.merged,
      excludeTools: newExcludeTools,
    };
    finalConfig = await loadCliConfig(
      nonInteractiveSettings,
      extensions,
      config.getSessionId(),
      argv,
    );
    await finalConfig.initialize();
  }

  return await validateNonInteractiveAuth(
    settings.merged.selectedAuthType,
    finalConfig,
  );
}
