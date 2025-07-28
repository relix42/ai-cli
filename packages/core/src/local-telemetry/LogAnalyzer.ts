/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as fs from 'fs';
import * as path from 'path';

export interface SessionStats {
  totalSessions: number;
  totalPrompts: number;
  totalToolCalls: number;
  totalApiCalls: number;
  totalErrors: number;
  averageSessionDuration: number;
  mostUsedTools: Array<{ name: string; count: number; avgDuration: number }>;
  modelUsage: Array<{ model: string; count: number; totalTokens: number }>;
  errorSummary: Array<{ error: string; count: number }>;
  performanceMetrics: {
    avgApiResponseTime: number;
    avgToolCallTime: number;
    slowestOperations: Array<{ operation: string; duration: number; timestamp: string }>;
  };
}

export class LogAnalyzer {
  private logDir: string;

  constructor(logDir: string) {
    this.logDir = logDir;
  }

  /**
   * Analyze logs and generate comprehensive usage statistics
   */
  async analyzeUsage(days: number = 7): Promise<SessionStats> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const sessionData: any[] = [];
    const performanceData: any[] = [];
    const errorData: any[] = [];

    // Read all log files
    try {
      const files = fs.readdirSync(this.logDir);
      
      for (const file of files) {
        const filePath = path.join(this.logDir, file);
        const stats = fs.statSync(filePath);
        
        // Skip files older than cutoff date
        if (stats.mtime < cutoffDate) continue;

        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n').filter(line => line.trim());

        for (const line of lines) {
          try {
            const entry = JSON.parse(line);
            const entryDate = new Date(entry.timestamp);
            
            if (entryDate < cutoffDate) continue;

            if (file.includes('session')) {
              sessionData.push(entry);
            } else if (file.includes('performance')) {
              performanceData.push(entry);
            } else if (file.includes('errors')) {
              errorData.push(entry);
            }
          } catch (e) {
            // Skip malformed lines
          }
        }
      }
    } catch (error) {
      console.error('Error reading log files:', error);
    }

    return this.generateStats(sessionData, performanceData, errorData);
  }

  private generateStats(sessionData: any[], performanceData: any[], errorData: any[]): SessionStats {
    // Count sessions
    const sessions = new Set(sessionData.map(entry => entry.sessionId));
    const totalSessions = sessions.size;

    // Count prompts
    const totalPrompts = sessionData.filter(entry => entry.event === 'user_prompt').length;

    // Analyze tool calls
    const toolCalls = performanceData.filter(entry => entry.event === 'tool_call');
    const totalToolCalls = toolCalls.length;

    // Tool usage analysis
    const toolUsage = new Map<string, { count: number; totalDuration: number }>();
    toolCalls.forEach(entry => {
      const toolName = entry.data.function_name;
      const duration = entry.data.duration_ms || 0;
      
      if (!toolUsage.has(toolName)) {
        toolUsage.set(toolName, { count: 0, totalDuration: 0 });
      }
      
      const usage = toolUsage.get(toolName)!;
      usage.count++;
      usage.totalDuration += duration;
    });

    const mostUsedTools = Array.from(toolUsage.entries())
      .map(([name, usage]) => ({
        name,
        count: usage.count,
        avgDuration: usage.count > 0 ? Math.round(usage.totalDuration / usage.count) : 0
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // API call analysis
    const apiResponses = performanceData.filter(entry => entry.event === 'api_response');
    const totalApiCalls = apiResponses.length;

    // Model usage analysis
    const modelUsage = new Map<string, { count: number; totalTokens: number }>();
    apiResponses.forEach(entry => {
      const model = entry.data.model;
      const tokens = entry.data.total_token_count || 0;
      
      if (!modelUsage.has(model)) {
        modelUsage.set(model, { count: 0, totalTokens: 0 });
      }
      
      const usage = modelUsage.get(model)!;
      usage.count++;
      usage.totalTokens += tokens;
    });

    const modelUsageArray = Array.from(modelUsage.entries())
      .map(([model, usage]) => ({
        model,
        count: usage.count,
        totalTokens: usage.totalTokens
      }))
      .sort((a, b) => b.count - a.count);

    // Error analysis
    const totalErrors = errorData.length;
    const errorCounts = new Map<string, number>();
    errorData.forEach(entry => {
      const error = entry.data.error || entry.data.loop_type || 'Unknown error';
      errorCounts.set(error, (errorCounts.get(error) || 0) + 1);
    });

    const errorSummary = Array.from(errorCounts.entries())
      .map(([error, count]) => ({ error, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Performance metrics
    const apiDurations = apiResponses.map(entry => entry.data.duration_ms || 0).filter(d => d > 0);
    const toolDurations = toolCalls.map(entry => entry.data.duration_ms || 0).filter(d => d > 0);
    
    const avgApiResponseTime = apiDurations.length > 0 
      ? Math.round(apiDurations.reduce((a, b) => a + b, 0) / apiDurations.length)
      : 0;
    
    const avgToolCallTime = toolDurations.length > 0
      ? Math.round(toolDurations.reduce((a, b) => a + b, 0) / toolDurations.length)
      : 0;

    // Find slowest operations
    const allOperations = [
      ...apiResponses.map(entry => ({
        operation: `API call to ${entry.data.model}`,
        duration: entry.data.duration_ms || 0,
        timestamp: entry.timestamp
      })),
      ...toolCalls.map(entry => ({
        operation: `Tool call: ${entry.data.function_name}`,
        duration: entry.data.duration_ms || 0,
        timestamp: entry.timestamp
      }))
    ];

    const slowestOperations = allOperations
      .filter(op => op.duration > 0)
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 5);

    return {
      totalSessions,
      totalPrompts,
      totalToolCalls,
      totalApiCalls,
      totalErrors,
      averageSessionDuration: 0, // Would need session start/end tracking
      mostUsedTools,
      modelUsage: modelUsageArray,
      errorSummary,
      performanceMetrics: {
        avgApiResponseTime,
        avgToolCallTime,
        slowestOperations
      }
    };
  }

  /**
   * Generate a human-readable report
   */
  generateReport(stats: SessionStats): string {
    const report = `
# GrooveForge Usage Report

## Overview
- **Total Sessions**: ${stats.totalSessions}
- **Total Prompts**: ${stats.totalPrompts}
- **Total Tool Calls**: ${stats.totalToolCalls}
- **Total API Calls**: ${stats.totalApiCalls}
- **Total Errors**: ${stats.totalErrors}

## Performance Metrics
- **Average API Response Time**: ${stats.performanceMetrics.avgApiResponseTime}ms
- **Average Tool Call Time**: ${stats.performanceMetrics.avgToolCallTime}ms

## Most Used Tools
${stats.mostUsedTools.map(tool => 
  `- **${tool.name}**: ${tool.count} calls (avg ${tool.avgDuration}ms)`
).join('\n')}

## Model Usage
${stats.modelUsage.map(model => 
  `- **${model.model}**: ${model.count} calls, ${model.totalTokens.toLocaleString()} tokens`
).join('\n')}

## Error Summary
${stats.errorSummary.length > 0 
  ? stats.errorSummary.map(error => `- **${error.error}**: ${error.count} occurrences`).join('\n')
  : '- No errors recorded'
}

## Slowest Operations
${stats.performanceMetrics.slowestOperations.map(op => 
  `- **${op.operation}**: ${op.duration}ms (${new Date(op.timestamp).toLocaleString()})`
).join('\n')}

---
*Report generated on ${new Date().toLocaleString()}*
`;

    return report.trim();
  }
}