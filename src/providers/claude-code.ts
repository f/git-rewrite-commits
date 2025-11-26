import { execSync, spawnSync } from 'child_process';
import { AIProvider } from './types.js';

interface ClaudeResponse {
  type: 'result';
  subtype: 'success' | 'error_max_turns' | 'error_during_execution';
  result: string;
  total_cost_usd?: number;
  session_id?: string;
}

export class ClaudeCodeProvider implements AIProvider {
  private model: string;

  constructor(model: string = 'haiku') {
    this.model = model;
  }

  async generateCommitMessage(prompt: string, systemPrompt: string): Promise<string> {
    // Check if Claude CLI is installed
    this.checkClaudeInstalled();

    // Combine system prompt and user prompt
    const fullPrompt = `${systemPrompt}\n\n${prompt}`;

    try {
      // Use shell execution to properly handle --tools ""
      const escapedPrompt = fullPrompt.replace(/'/g, "'\\''");
      const command = `claude -p '${escapedPrompt}' --output-format json --model ${this.model} --tools ""`;

      const stdout = execSync(command, {
        encoding: 'utf-8',
        maxBuffer: 10 * 1024 * 1024, // 10MB buffer
        timeout: 120000, // 2 minute timeout
        env: { ...process.env },
      });

      // Parse the JSON response
      const response = JSON.parse(stdout.trim()) as ClaudeResponse;

      if (response.subtype !== 'success') {
        throw new Error(`Claude Code returned error: ${response.subtype}`);
      }

      const message = response.result?.trim();
      if (!message) {
        throw new Error('No commit message generated from Claude Code');
      }

      return message;
    } catch (error: any) {
      // Check for common errors
      if (error.message?.includes('not found') || error.message?.includes('command not found')) {
        throw new Error(
          'Claude Code CLI is not installed. Please install it with:\n' +
          '  npm install -g @anthropic-ai/claude-code\n' +
          'Then authenticate with:\n' +
          '  claude login'
        );
      }
      if (error.message?.includes('authenticate') || error.message?.includes('login') || error.message?.includes('unauthorized')) {
        throw new Error(
          'Claude Code CLI is not authenticated. Please run:\n' +
          '  claude login'
        );
      }

      // Try to parse stdout even if command failed
      if (error.stdout) {
        try {
          const response = JSON.parse(error.stdout.trim()) as ClaudeResponse;
          if (response.result) {
            return response.result.trim();
          }
        } catch {
          // Ignore parse errors
        }
      }

      throw error;
    }
  }

  private checkClaudeInstalled(): void {
    try {
      spawnSync('claude', ['--version'], { stdio: 'pipe' });
    } catch {
      throw new Error(
        'Claude Code CLI is not installed. Please install it with:\n' +
        '  npm install -g @anthropic-ai/claude-code\n' +
        'Then authenticate with:\n' +
        '  claude login'
      );
    }
  }

  getName(): string {
    return `Claude Code (${this.model})`;
  }
}
