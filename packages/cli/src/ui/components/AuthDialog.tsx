/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { Colors } from '../colors.js';
import { RadioButtonSelect } from './shared/RadioButtonSelect.js';
import { LoadedSettings, SettingScope } from '../../config/settings.js';
import { AuthType } from '@relix42/grooveforge-core';
import { validateAuthMethod } from '../../config/auth.js';

interface AuthDialogProps {
  onSelect: (authMethod: AuthType | undefined, scope: SettingScope) => void;
  settings: LoadedSettings;
  initialErrorMessage?: string | null;
}

function parseDefaultAuthType(
  defaultAuthType: string | undefined,
): AuthType | null {
  if (
    defaultAuthType &&
    Object.values(AuthType).includes(defaultAuthType as AuthType)
  ) {
    return defaultAuthType as AuthType;
  }
  return null;
}

export function AuthDialog({
  onSelect,
  settings,
  initialErrorMessage,
}: AuthDialogProps): React.JSX.Element {
  const [errorMessage, setErrorMessage] = useState<string | null>(() => {
    if (initialErrorMessage) {
      return initialErrorMessage;
    }

    const defaultAuthType = parseDefaultAuthType(
      process.env.GEMINI_DEFAULT_AUTH_TYPE,
    );

    if (process.env.GEMINI_DEFAULT_AUTH_TYPE && defaultAuthType === null) {
      return (
        `Invalid value for GEMINI_DEFAULT_AUTH_TYPE: "${process.env.GEMINI_DEFAULT_AUTH_TYPE}". ` +
        `Valid values are: ${Object.values(AuthType).join(', ')}.`
      );
    }

    // Check for local AI provider configuration
    if (process.env.CHAT_CLI_PROVIDER === 'ollama') {
      return 'Ollama detected! Select "Local AI (Ollama)" to use your local models.';
    }
    
    if (process.env.CHAT_CLI_PROVIDER === 'claude') {
      return 'Claude API detected! Select "Claude API" to use Claude models.';
    }
    
    if (
      process.env.GEMINI_API_KEY &&
      (!defaultAuthType || defaultAuthType === AuthType.USE_GEMINI)
    ) {
      return 'Existing API key detected (GEMINI_API_KEY). Select "Gemini API Key" option to use it.';
    }
    return null;
  });
  // GrooveForge: Focus on local and independent AI providers
  const items: Array<{ label: string; value: string }> = [
    {
      label: 'Local AI (Ollama) - Recommended',
      value: 'OLLAMA',
    },
    {
      label: 'Claude API',
      value: 'CLAUDE',
    },
    {
      label: 'Use Gemini API Key (Legacy)',
      value: AuthType.USE_GEMINI,
    },
    ...(process.env.CLOUD_SHELL === 'true'
      ? [
          {
            label: 'Use Cloud Shell user credentials',
            value: AuthType.CLOUD_SHELL,
          },
        ]
      : []),
  ];
  
  // Debug: Log the items array
  console.log('[GrooveForge Debug] Auth items:', items.map(item => ({ label: item.label, value: item.value })));
  console.log('[GrooveForge Debug] Environment:', {
    CHAT_CLI_PROVIDER: process.env.CHAT_CLI_PROVIDER,
    GEMINI_API_KEY: !!process.env.GEMINI_API_KEY,
    CLOUD_SHELL: process.env.CLOUD_SHELL,
    selectedAuthType: settings.merged.selectedAuthType
  });

  const initialAuthIndex = items.findIndex((item) => {
    if (settings.merged.selectedAuthType) {
      return String(item.value) === String(settings.merged.selectedAuthType);
    }

    const defaultAuthType = parseDefaultAuthType(
      process.env.GEMINI_DEFAULT_AUTH_TYPE,
    );
    if (defaultAuthType) {
      return String(item.value) === String(defaultAuthType);
    }

    if (process.env.GEMINI_API_KEY) {
      return String(item.value) === String(AuthType.USE_GEMINI);
    }
    
    // Only default to OLLAMA if it's already configured
    if (process.env.CHAT_CLI_PROVIDER === 'ollama') {
      return String(item.value) === 'OLLAMA';
    }
    
    // Only default to CLAUDE if it's already configured
    if (process.env.CHAT_CLI_PROVIDER === 'claude') {
      return String(item.value) === 'CLAUDE';
    }

    // Default to OLLAMA as the recommended option
    return String(item.value) === 'OLLAMA';
  });
  
  console.log('[GrooveForge Debug] Initial auth index:', initialAuthIndex);
  
  // Ensure we have a valid index
  const safeInitialIndex = initialAuthIndex >= 0 ? initialAuthIndex : 0;

  const handleAuthSelect = (authMethod: AuthType | string) => {
    const error = validateAuthMethod(authMethod as string);
    if (error) {
      setErrorMessage(error);
    } else {
      setErrorMessage(null);
      onSelect(authMethod as AuthType, SettingScope.User);
    }
  };

  useInput((_input, key) => {
    if (key.escape) {
      // Prevent exit if there is an error message.
      // This means they user is not authenticated yet.
      if (errorMessage) {
        return;
      }
      if (settings.merged.selectedAuthType === undefined) {
        // Prevent exiting if no auth method is set
        setErrorMessage(
          'You must select an auth method to proceed. Press Ctrl+C twice to exit.',
        );
        return;
      }
      onSelect(undefined, SettingScope.User);
    }
  });

  return (
    <Box
      borderStyle="round"
      borderColor={Colors.Gray}
      flexDirection="column"
      padding={1}
      width="100%"
    >
      <Text bold>Get started</Text>
      <Box marginTop={1}>
        <Text>How would you like to connect to AI models?</Text>
      </Box>
      <Box marginTop={1}>
        <RadioButtonSelect
          items={items}
          initialIndex={safeInitialIndex}
          onSelect={handleAuthSelect}
          isFocused={true}
        />
      </Box>
      {errorMessage && (
        <Box marginTop={1}>
          <Text color={Colors.AccentRed}>{errorMessage}</Text>
        </Box>
      )}
      <Box marginTop={1}>
        <Text color={Colors.Gray}>(Use Enter to select)</Text>
      </Box>
      <Box marginTop={1}>
        <Text>GrooveForge - Independent AI CLI</Text>
      </Box>
      <Box marginTop={1}>
        <Text color={Colors.AccentBlue}>
          {
            'https://github.com/relix42/grooveforge/blob/main/docs/tos-privacy.md'
          }
        </Text>
      </Box>
    </Box>
  );
}
