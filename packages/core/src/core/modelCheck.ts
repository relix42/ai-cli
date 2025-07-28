/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { setGlobalDispatcher, ProxyAgent } from 'undici';
import {
  DEFAULT_GEMINI_MODEL,
  DEFAULT_GEMINI_FLASH_MODEL,
} from '../config/models.js';

/**
 * Returns the configured model without making any external API calls.
 * GrooveForge operates locally and does not check model availability with Google.
 * @param apiKey The API key (unused in local operation).
 * @param currentConfiguredModel The model currently configured in settings.
 * @returns The configured model as-is.
 */
export async function getEffectiveModel(
  apiKey: string,
  currentConfiguredModel: string,
  proxy?: string,
): Promise<string> {
  // GrooveForge operates locally - return configured model without external calls
  return currentConfiguredModel;
}
