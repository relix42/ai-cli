/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { getCliVersion } from '../../utils/version.js';
import { CommandKind, SlashCommand } from './types.js';
import process from 'node:process';
import { MessageType, type HistoryItemAbout } from '../types.js';

/**
 * Maps technical model names to GrooveForge-branded display names
 */
function getGrooveForgeModelDisplayName(technicalModel: string): string {
  const modelMap: Record<string, string> = {
    'gemini-2.5-pro': 'GrooveForge Pro 2.5',
    'gemini-2.5-flash': 'GrooveForge Flash 2.5',
    'gemini-2.5-flash-lite': 'GrooveForge Flash Lite 2.5',
    'gemini-1.5-pro': 'GrooveForge Pro 1.5',
    'gemini-1.5-flash': 'GrooveForge Flash 1.5',
    'gemini-pro': 'GrooveForge Pro',
    'gemini-flash': 'GrooveForge Flash',
  };
  
  return modelMap[technicalModel] || `GrooveForge (${technicalModel})`;
}

export const aboutCommand: SlashCommand = {
  name: 'about',
  description: 'show version info',
  kind: CommandKind.BUILT_IN,
  action: async (context) => {
    const osVersion = process.platform;
    let sandboxEnv = 'no sandbox';
    if (process.env.SANDBOX && process.env.SANDBOX !== 'sandbox-exec') {
      sandboxEnv = process.env.SANDBOX;
    } else if (process.env.SANDBOX === 'sandbox-exec') {
      sandboxEnv = `sandbox-exec (${
        process.env.SEATBELT_PROFILE || 'unknown'
      })`;
    }
    const technicalModel = context.services.config?.getModel() || 'Unknown';
    const modelVersion = getGrooveForgeModelDisplayName(technicalModel);
    const cliVersion = await getCliVersion();
    const selectedAuthType =
      context.services.settings.merged.selectedAuthType || '';
    const gcpProject = process.env.GOOGLE_CLOUD_PROJECT || '';

    const aboutItem: Omit<HistoryItemAbout, 'id'> = {
      type: MessageType.ABOUT,
      cliVersion,
      osVersion,
      sandboxEnv,
      modelVersion,
      selectedAuthType,
      gcpProject,
    };

    context.ui.addItem(aboutItem, Date.now());
  },
};
