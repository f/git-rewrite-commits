import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import OpenAI from 'openai';
import * as readline from 'readline';
import chalk from 'chalk';
import ora from 'ora';

export interface RewriteOptions {
  apiKey?: string;
  model?: string;
  branch?: string;
  dryRun?: boolean;
  verbose?: boolean;
  maxCommits?: number;
  skipBackup?: boolean;
}

export interface CommitInfo {
  hash: string;
  message: string;
  files: string[];
  diff: string;
}

export class GitCommitRewriter {
  private openai: OpenAI;
  private options: RewriteOptions;

  constructor(options: RewriteOptions = {}) {
    const apiKey = options.apiKey || process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      throw new Error('OpenAI API key is required. Set OPENAI_API_KEY environment variable or pass it as an option.');
    }

    this.openai = new OpenAI({ apiKey });
    this.options = {
      model: 'gpt-3.5-turbo',
      dryRun: false,
      verbose: false,
      skipBackup: false,
      ...options
    };
  }

  private execCommand(command: string): string {
    try {
      return execSync(command, { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 });
    } catch (error: any) {
      throw new Error(`Command failed: ${command}\n${error.message}`);
    }
  }

  private async askConfirmation(question: string): Promise<boolean> {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    return new Promise((resolve) => {
      rl.question(chalk.yellow(`${question} (y/n): `), (answer: string) => {
        rl.close();
        resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
      });
    });
  }

  private async generateCommitMessage(
    diff: string,
    files: string[],
    oldMessage: string
  ): Promise<string> {
    try {
      const prompt = `You are a git commit message generator. Analyze the following git diff and file changes, then generate a clear, concise commit message following conventional commit standards.

Old commit message: "${oldMessage}"

Files changed:
${files.join('\n')}

Git diff (truncated if too long):
${diff.substring(0, 8000)}

Generate a commit message that:
1. Follows the format: <type>(<scope>): <subject>
2. Types can be: feat, fix, docs, style, refactor, test, chore, perf, ci, build, revert
3. Scope is optional but recommended (e.g., auth, api, ui)
4. Subject should be clear and descriptive
5. Be concise but informative
6. Focus on WHAT was changed and WHY, not HOW
7. Use present tense ("add" not "added")
8. Don't end with a period
9. Maximum 72 characters for the first line

Return ONLY the commit message, nothing else.`;

      const response = await this.openai.chat.completions.create({
        model: this.options.model || 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that generates clear, conventional git commit messages.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 200,
      });

      const message = response.choices[0]?.message?.content?.trim();
      if (!message) {
        throw new Error('No commit message generated');
      }

      return message;
    } catch (error: any) {
      if (this.options.verbose) {
        console.error(chalk.red(`Error generating commit message: ${error.message}`));
      }
      return oldMessage; // Fallback to old message
    }
  }

  private checkGitRepository(): void {
    try {
      this.execCommand('git rev-parse --git-dir');
    } catch {
      throw new Error('Not a git repository!');
    }
  }

  private checkUncommittedChanges(): string {
    return this.execCommand('git status --porcelain');
  }

  private getCurrentBranch(): string {
    return this.execCommand('git rev-parse --abbrev-ref HEAD').trim();
  }

  private getCommits(): string[] {
    const commits = this.execCommand('git rev-list --reverse HEAD')
      .trim()
      .split('\n')
      .filter(Boolean);

    if (this.options.maxCommits && this.options.maxCommits > 0) {
      return commits.slice(0, this.options.maxCommits);
    }

    return commits;
  }

  private async getCommitInfo(hash: string, index: number): Promise<CommitInfo> {
    const oldMessage = this.execCommand(`git log -1 --format=%s ${hash}`).trim();
    const files = this.execCommand(`git diff-tree --no-commit-id --name-only -r ${hash}`)
      .trim()
      .split('\n')
      .filter(Boolean);

    let diff = '';
    if (index === 0) {
      // First commit - compare with empty tree
      diff = this.execCommand(`git diff-tree --no-commit-id -p 4b825dc642cb6eb9a060e54bf8d69288fbee4904 ${hash}`);
    } else {
      // Regular commit - compare with parent
      diff = this.execCommand(`git diff-tree --no-commit-id -p ${hash}^..${hash}`);
    }

    return { hash, message: oldMessage, files, diff };
  }

  private createBackupBranch(currentBranch: string): string {
    const backupBranch = `backup-${currentBranch}-${Date.now()}`;
    this.execCommand(`git branch ${backupBranch}`);
    return backupBranch;
  }

  private async rewriteHistory(mappingFile: string, counterFile: string): Promise<void> {
    // Initialize the counter file
    fs.writeFileSync(counterFile, '0');

    // Create a Node.js filter script
    const filterScript = path.join(process.cwd(), '.git', 'filter-msg.js');
    const scriptContent = `#!/usr/bin/env node
const fs = require('fs');

// Read the ordered messages array
const messages = JSON.parse(fs.readFileSync('${mappingFile}', 'utf8'));

// Read and update the counter
const counterFile = '${counterFile}';
let counter = parseInt(fs.readFileSync(counterFile, 'utf8'));
const newMessage = messages[counter];
fs.writeFileSync(counterFile, String(counter + 1));

// Read the original message from stdin (we need to consume it)
let oldMessage = '';
process.stdin.on('data', (chunk) => {
  oldMessage += chunk;
});

process.stdin.on('end', () => {
  // Output the new message for this commit
  if (newMessage) {
    process.stdout.write(newMessage);
  } else {
    // Fallback to original if something goes wrong
    process.stdout.write(oldMessage.trim());
  }
});`;

    fs.writeFileSync(filterScript, scriptContent, { mode: 0o755 });

    try {
      this.execCommand(`git filter-branch -f --msg-filter 'node ${filterScript}' HEAD`);
    } finally {
      // Clean up temporary files
      if (fs.existsSync(filterScript)) {
        fs.unlinkSync(filterScript);
      }
      if (fs.existsSync(mappingFile)) {
        fs.unlinkSync(mappingFile);
      }
      if (fs.existsSync(counterFile)) {
        fs.unlinkSync(counterFile);
      }
    }
  }

  public async rewrite(): Promise<void> {
    console.log(chalk.cyan.bold('\n🚀 Git Commit Message Rewriter with AI\n'));

    // Check git repository
    this.checkGitRepository();

    // Get current branch
    const currentBranch = this.getCurrentBranch();
    console.log(chalk.blue(`Current branch: ${currentBranch}`));

    // Check for uncommitted changes
    const status = this.checkUncommittedChanges();
    if (status) {
      console.log(chalk.yellow('\n⚠️  Warning: You have uncommitted changes!'));
      console.log(chalk.yellow('Please commit or stash them before proceeding.'));
      const proceed = await this.askConfirmation('Do you want to continue anyway?');
      if (!proceed) {
        process.exit(0);
      }
    }

    // Get commits
    const commits = this.getCommits();
    console.log(chalk.green(`\nFound ${commits.length} commits to process`));

    if (commits.length === 0) {
      console.log(chalk.yellow('No commits found to process.'));
      return;
    }

    // Warning about rewriting history
    if (!this.options.dryRun) {
      console.log(chalk.red.bold('\n⚠️  WARNING: This will REWRITE your git history!'));
      console.log(chalk.red('This is dangerous if you have already pushed to a remote repository.'));
      console.log(chalk.yellow('Make sure to:'));
      console.log(chalk.yellow('  1. Work on a separate branch'));
      console.log(chalk.yellow('  2. Have a backup of your repository'));
      console.log(chalk.yellow('  3. Coordinate with your team if this is a shared repository'));

      const confirm = await this.askConfirmation('\nDo you want to proceed?');
      if (!confirm) {
        console.log(chalk.yellow('Operation cancelled.'));
        process.exit(0);
      }
    }

    // Create backup branch
    let backupBranch: string | undefined;
    if (!this.options.skipBackup && !this.options.dryRun) {
      backupBranch = this.createBackupBranch(currentBranch);
      console.log(chalk.green(`\n✅ Created backup branch: ${backupBranch}`));
    }

    // Process commits
    const mappingFile = path.join(process.cwd(), '.git', 'commit-message-map.json');
    const counterFile = path.join(process.cwd(), '.git', 'commit-counter.txt');
    const messageMap: { [hash: string]: string } = {};

    console.log(chalk.cyan('\n📝 Generating new commit messages with AI...\n'));

    const spinner = ora();
    for (let i = 0; i < commits.length; i++) {
      const hash = commits[i];
      const progress = ((i + 1) / commits.length * 100).toFixed(1);
      
      try {
        const commitInfo = await this.getCommitInfo(hash, i);
        
        spinner.start(chalk.blue(`[${progress}%] Processing: ${hash.substring(0, 8)} - "${commitInfo.message}"`));

        // Generate new message with AI
        const newMessage = await this.generateCommitMessage(commitInfo.diff, commitInfo.files, commitInfo.message);
        
        if (newMessage !== commitInfo.message) {
          messageMap[hash] = newMessage;
          spinner.succeed(chalk.green(`[${progress}%] ${hash.substring(0, 8)}: "${newMessage}"`));
        } else {
          spinner.info(chalk.yellow(`[${progress}%] ${hash.substring(0, 8)}: Keeping original message`));
        }

        // Add a small delay to avoid rate limiting
        if (i < commits.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      } catch (error: any) {
        spinner.fail(chalk.red(`[${progress}%] Error processing ${hash.substring(0, 8)}: ${error.message}`));
      }
    }

    // Create ordered list of messages
    const orderedMessages: string[] = [];
    for (const commit of commits) {
      if (messageMap[commit]) {
        orderedMessages.push(messageMap[commit]);
      } else {
        const originalMessage = this.execCommand(`git log -1 --format=%B ${commit}`).trim();
        orderedMessages.push(originalMessage);
      }
    }

    fs.writeFileSync(mappingFile, JSON.stringify(orderedMessages, null, 2));
    console.log(chalk.green(`\n✅ Saved ${orderedMessages.length} commit messages`));

    // Summary
    const changedCount = Object.keys(messageMap).length;
    console.log(chalk.cyan(`\n📊 Summary: ${changedCount} out of ${commits.length} commits will be rewritten`));

    if (changedCount === 0) {
      console.log(chalk.yellow('\nNo commit messages to change. Exiting.'));
      return;
    }

    // Apply changes
    if (this.options.dryRun) {
      console.log(chalk.yellow('\n🔍 Dry run completed. No changes were made to your repository.'));
      console.log(chalk.blue('Review the proposed changes above and run without --dry-run to apply them.'));
      return;
    }

    const rewrite = await this.askConfirmation('\nDo you want to apply the new commit messages?');
    if (!rewrite) {
      console.log(chalk.yellow('Rewrite cancelled. Your history remains unchanged.'));
      if (backupBranch) {
        console.log(chalk.blue(`You can restore from backup branch: ${backupBranch}`));
      }
      return;
    }

    console.log(chalk.cyan('\n🔄 Rewriting git history...'));
    
    try {
      await this.rewriteHistory(mappingFile, counterFile);
      
      console.log(chalk.green.bold('\n✅ Successfully rewrote git history!'));
      console.log(chalk.yellow.bold('\n📌 Important next steps:'));
      console.log(chalk.yellow('  1. Review the changes: git log --oneline'));
      console.log(chalk.yellow('  2. If satisfied, force push: git push --force-with-lease'));
      if (backupBranch) {
        console.log(chalk.yellow(`  3. If something went wrong, restore: git reset --hard ${backupBranch}`));
        console.log(chalk.yellow(`  4. Clean up backup when done: git branch -D ${backupBranch}`));
      }
    } catch (error: any) {
      console.log(chalk.red(`\n❌ Error rewriting history: ${error.message}`));
      if (backupBranch) {
        console.log(chalk.yellow(`You can restore from backup: git reset --hard ${backupBranch}`));
      }
      throw error;
    }
  }
}

export default GitCommitRewriter;
