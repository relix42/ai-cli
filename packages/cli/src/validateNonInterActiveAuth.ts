/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { AuthType, Config } from '@relix42/grooveforge-core';
import { USER_SETTINGS_PATH } from './config/settings.js';
import { validateAuthMethod } from './config/auth.js';

function getAuthTypeFromEnv(): AuthType | undefined {
  // Check for GrooveForge local AI providers first
  if (process.env.CHAT_CLI_PROVIDER === 'ollama') {
    return 'OLLAMA' as AuthType;
  }
  if (process.env.CHAT_CLI_PROVIDER === 'claude') {
    return 'CLAUDE' as AuthType;
  }
  
  // Check for Google AI providers
  if (process.env.GOOGLE_GENAI_USE_GCA === 'true') {
    return AuthType.LOGIN_WITH_GOOGLE;
  }
  if (process.env.GOOGLE_GENAI_USE_VERTEXAI === 'true') {
    return AuthType.USE_VERTEX_AI;
  }
  if (process.env.GEMINI_API_KEY) {
    return AuthType.USE_GEMINI;
  }
  return undefined;
}

export async function validateNonInteractiveAuth(
  configuredAuthType: AuthType | undefined,
  nonInteractiveConfig: Config,
) {
  const effectiveAuthType = configuredAuthType || getAuthTypeFromEnv();

  if (!effectiveAuthType) {
    console.error(
      `Please set an Auth method in your ${USER_SETTINGS_PATH} or specify one of the following environment variables before running:\n` +
      `  • CHAT_CLI_PROVIDER=ollama (for local Ollama)\n` +
      `  • CHAT_CLI_PROVIDER=claude (for Claude API)\n` +
      `  • GEMINI_API_KEY (for Google Gemini)\n` +
      `  • GOOGLE_GENAI_USE_VERTEXAI=true (for Vertex AI)\n` +
      `  • GOOGLE_GENAI_USE_GCA=true (for Google Cloud Auth)`,
    );
    process.exit(1);
  }

  const err = await validateAuthMethod(effectiveAuthType);
  if (err != null) {
    console.error(err);
    process.exit(1);
  }

  await nonInteractiveConfig.refreshAuth(effectiveAuthType);
  return nonInteractiveConfig;
}
