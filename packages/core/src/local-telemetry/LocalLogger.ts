/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as fs from 'fs';
import * as path from 'path';
import { Config } from '../config/config.js';
import {
  StartSessionEvent,
  EndSessionEvent,
  UserPromptEvent,
  ToolCallEvent,
  ApiRequestEvent,
  ApiErrorEvent,
  ApiResponseEvent,
  FlashFallbackEvent,
  LoopDetectedEvent,
  FlashDecidedToContinueEvent,
  TelemetryEvent,
} from '../telemetry/types.js';

/**
 * Local logging system for GrooveForge that replaces Google telemetry.
 * Logs performance and debugging information to local files for analysis.
 */
export class LocalLogger {
  private static instance: LocalLogger;
  private config?: Config;
  private logDir: string;
  private sessionLogFile: string;
  private performanceLogFile: string;
  private errorLogFile: string;
  private enabled: boolean = true;

  private constructor(config?: Config) {
    this.config = config;
    
    // Create logs directory in the project's .grooveforge directory
    const projectRoot = config?.getProjectRoot() || process.cwd();
    this.logDir = path.join(projectRoot, '.grooveforge', 'logs');
    
    // Ensure logs directory exists
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }

    // Create log files with timestamps
    const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const sessionId = config?.getSessionId() || 'unknown';
    
    this.sessionLogFile = path.join(this.logDir, `session-${timestamp}-${sessionId.slice(0, 8)}.jsonl`);
    this.performanceLogFile = path.join(this.logDir, `performance-${timestamp}.jsonl`);
    this.errorLogFile = path.join(this.logDir, `errors-${timestamp}.jsonl`);

    // Check if local logging is disabled
    this.enabled = config?.getDebugMode() || process.env.GROOVEFORGE_LOCAL_LOGGING !== 'false';
    
    if (this.enabled) {
      console.log(`[GrooveForge] Local logging enabled. Logs: ${this.logDir}`);
    }
  }

  static getInstance(config?: Config): LocalLogger {
    if (!LocalLogger.instance) {
      LocalLogger.instance = new LocalLogger(config);
    }
    return LocalLogger.instance;
  }

  private writeToFile(filePath: string, data: any): void {
    if (!this.enabled) return;

    try {
      const logEntry = {
        timestamp: new Date().toISOString(),
        sessionId: this.config?.getSessionId(),
        ...data
      };
      
      const logLine = JSON.stringify(logEntry) + '\n';
      fs.appendFileSync(filePath, logLine, 'utf8');
    } catch (error) {
      // Silently fail to avoid disrupting the main application
      if (this.config?.getDebugMode()) {
        console.error('[GrooveForge] Local logging error:', error);
      }
    }
  }

  private logEvent(event: TelemetryEvent, category: 'session' | 'performance' | 'error' = 'session'): void {
    const logFile = category === 'performance' ? this.performanceLogFile :
                   category === 'error' ? this.errorLogFile : this.sessionLogFile;
    
    this.writeToFile(logFile, {
      category,
      event: event['event.name'],
      data: event
    });
  }

  // Session lifecycle events
  logStartSessionEvent(event: StartSessionEvent): void {
    this.logEvent(event, 'session');
    
    if (this.enabled && this.config?.getDebugMode()) {
      console.log(`[GrooveForge] Session started - Model: ${event.model}, Tools: ${event.core_tools_enabled}`);
    }
  }

  logEndSessionEvent(event: EndSessionEvent): void {
    this.logEvent(event, 'session');
    
    if (this.enabled && this.config?.getDebugMode()) {
      console.log(`[GrooveForge] Session ended - ID: ${event.session_id}`);
    }
  }

  // User interaction events
  logNewPromptEvent(event: UserPromptEvent): void {
    this.logEvent(event, 'session');
    
    if (this.enabled && this.config?.getDebugMode()) {
      console.log(`[GrooveForge] User prompt - Length: ${event.prompt_length} chars`);
    }
  }

  // Tool usage events
  logToolCallEvent(event: ToolCallEvent): void {
    this.logEvent(event, 'performance');
    
    if (this.enabled && this.config?.getDebugMode()) {
      const status = event.success ? 'SUCCESS' : 'FAILED';
      console.log(`[GrooveForge] Tool call - ${event.function_name}: ${status} (${event.duration_ms}ms)`);
    }
  }

  // API performance events
  logApiRequestEvent(event: ApiRequestEvent): void {
    this.logEvent(event, 'performance');
  }

  logApiResponseEvent(event: ApiResponseEvent): void {
    this.logEvent(event, 'performance');
    
    if (this.enabled && this.config?.getDebugMode()) {
      console.log(`[GrooveForge] API response - ${event.model}: ${event.duration_ms}ms, ${event.total_token_count} tokens`);
    }
  }

  logApiErrorEvent(event: ApiErrorEvent): void {
    this.logEvent(event, 'error');
    
    if (this.enabled) {
      console.warn(`[GrooveForge] API error - ${event.model}: ${event.error} (${event.duration_ms}ms)`);
    }
  }

  // System events
  logFlashFallbackEvent(event: FlashFallbackEvent): void {
    this.logEvent(event, 'session');
    
    if (this.enabled) {
      console.log(`[GrooveForge] Model fallback triggered - Auth: ${event.auth_type}`);
    }
  }

  logLoopDetectedEvent(event: LoopDetectedEvent): void {
    this.logEvent(event, 'error');
    
    if (this.enabled) {
      console.warn(`[GrooveForge] Loop detected - Type: ${event.loop_type}, Prompt: ${event.prompt_id}`);
    }
  }

  logFlashDecidedToContinueEvent(event: FlashDecidedToContinueEvent): void {
    this.logEvent(event, 'session');
  }

  // Utility methods for log analysis
  getLogDirectory(): string {
    return this.logDir;
  }

  getSessionLogFile(): string {
    return this.sessionLogFile;
  }

  getPerformanceLogFile(): string {
    return this.performanceLogFile;
  }

  getErrorLogFile(): string {
    return this.errorLogFile;
  }

  // Clean up old log files (keep last 30 days)
  cleanupOldLogs(): void {
    if (!this.enabled) return;

    try {
      const files = fs.readdirSync(this.logDir);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      files.forEach(file => {
        const filePath = path.join(this.logDir, file);
        const stats = fs.statSync(filePath);
        
        if (stats.mtime < thirtyDaysAgo) {
          fs.unlinkSync(filePath);
          if (this.config?.getDebugMode()) {
            console.log(`[GrooveForge] Cleaned up old log file: ${file}`);
          }
        }
      });
    } catch (error) {
      if (this.config?.getDebugMode()) {
        console.error('[GrooveForge] Log cleanup error:', error);
      }
    }
  }

  shutdown(): void {
    const event = new EndSessionEvent(this.config);
    this.logEndSessionEvent(event);
    this.cleanupOldLogs();
  }
}