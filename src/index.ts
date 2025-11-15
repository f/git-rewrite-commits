import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';
import chalk from 'chalk';
import ora from 'ora';
import { AIProvider, createProvider } from './providers/index.js';

export interface RewriteOptions {
  provider?: 'openai' | 'ollama';
  apiKey?: string;
  model?: string;
  ollamaUrl?: string;
  branch?: string;
  dryRun?: boolean;
  verbose?: boolean;
  maxCommits?: number;
  skipBackup?: boolean;
  skipWellFormed?: boolean;
  minQualityScore?: number;
  template?: string;
  language?: string;
  prompt?: string;
  skipRemoteConsent?: boolean; // Skip consent prompt for remote API calls (not recommended)
}

export interface CommitInfo {
  hash: string;
  message: string;
  files: string[];
  diff: string;
}

export class GitCommitRewriter {
  private provider: AIProvider;
  private options: RewriteOptions;

  constructor(options: RewriteOptions = {}) {
    const provider = options.provider || 'openai';
    const model = options.model || (provider === 'ollama' ? 'llama3.2' : 'gpt-3.5-turbo');
    
    // Check for API key if using OpenAI
    if (provider === 'openai') {
      const apiKey = options.apiKey || process.env.OPENAI_API_KEY;
      if (!apiKey) {
        throw new Error('OpenAI API key is required. Set OPENAI_API_KEY environment variable or pass it as an option.');
      }
    }

    this.provider = createProvider({
      provider: provider,
      apiKey: options.apiKey,
      model: model,
      ollamaUrl: options.ollamaUrl
    });
    
    this.options = {
      dryRun: false,
      verbose: false,
      skipBackup: false,
      skipWellFormed: true,
      minQualityScore: 7,
      language: 'en',
      ...options,
      provider: provider,
      model: model,
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

  private parseTemplate(template: string): { prefix: string; separator: string; example: string } {
    // Parse templates like "(feat): message" or "[JIRA-123] feat: message"
    const match = template.match(/^(.*?)(\s*[:\-]\s*)(.*)$/);
    if (match) {
      return {
        prefix: match[1],
        separator: match[2],
        example: match[3]
      };
    }
    return {
      prefix: '',
      separator: ': ',
      example: template
    };
  }

  private getLanguageInstructions(language: string): string {
    const languageMap: { [key: string]: string } = {
      'en': 'English',
      'es': 'Spanish',
      'fr': 'French',
      'de': 'German',
      'it': 'Italian',
      'pt': 'Portuguese',
      'ru': 'Russian',
      'ja': 'Japanese',
      'ko': 'Korean',
      'zh': 'Chinese',
      'zh-cn': 'Simplified Chinese',
      'zh-tw': 'Traditional Chinese',
      'ar': 'Arabic',
      'hi': 'Hindi',
      'nl': 'Dutch',
      'pl': 'Polish',
      'tr': 'Turkish',
      'sv': 'Swedish',
      'da': 'Danish',
      'no': 'Norwegian',
      'fi': 'Finnish'
    };
    
    const langName = languageMap[language.toLowerCase()] || language;
    return `Write the commit message in ${langName}.`;
  }

  private assessCommitQuality(message: string): { score: number; isWellFormed: boolean; reason: string } {
    let score = 0;
    const reasons: string[] = [];
    
    // Check for conventional commit format
    const conventionalPattern = /^(feat|fix|docs|style|refactor|test|chore|perf|ci|build|revert)(\([^)]+\))?: .+/;
    const hasConventionalFormat = conventionalPattern.test(message);
    if (hasConventionalFormat) {
      score += 4;
      reasons.push('follows conventional format');
    }

    // Check message length (should be between 10 and 72 chars for first line)
    const firstLine = message.split('\n')[0];
    if (firstLine.length >= 10 && firstLine.length <= 72) {
      score += 2;
      reasons.push('appropriate length');
    } else if (firstLine.length < 10) {
      reasons.push('too short');
    } else {
      reasons.push('too long');
    }

    // Check for descriptive content (not generic)
    const genericMessages = ['update', 'fix', 'change', 'modify', 'commit', 'initial', 'test', 'wip'];
    const isGeneric = genericMessages.some(generic => 
      message.toLowerCase() === generic || 
      message.toLowerCase() === `${generic}.` ||
      message.toLowerCase() === `${generic} commit`
    );
    if (!isGeneric) {
      score += 2;
      reasons.push('descriptive');
    } else {
      reasons.push('too generic');
    }

    // Check for present tense (good practice)
    const presentTensePattern = /^(feat|fix|docs|style|refactor|test|chore|perf|ci|build|revert)?(\([^)]+\))?: [a-z]/;
    if (presentTensePattern.test(message)) {
      score += 1;
      reasons.push('uses present tense');
    }

    // Check for no trailing period (conventional commits style)
    if (!firstLine.endsWith('.')) {
      score += 1;
      reasons.push('no trailing period');
    }

    const isWellFormed = score >= (this.options.minQualityScore || 7);
    const reason = reasons.join(', ');

    return { score, isWellFormed, reason };
  }

  private async checkRemoteAPIConsent(): Promise<boolean> {
    // Skip consent if using local Ollama provider
    if (this.options.provider === 'ollama') {
      return true;
    }

    // Skip consent if explicitly disabled (for hook usage)
    if (this.options.skipRemoteConsent) {
      return true;
    }

    console.log(chalk.yellow.bold('\n⚠️  Data Privacy Notice'));
    console.log(chalk.yellow('This tool will send the following data to a remote AI provider:'));
    console.log(chalk.yellow('  • List of changed files'));
    console.log(chalk.yellow('  • Git diff content (up to 8KB per commit)'));
    console.log(chalk.yellow(`  • Provider: ${this.options.provider}`));
    console.log(chalk.yellow(`  • Model: ${this.options.model}`));
    
    console.log(chalk.green.bold('\n✅ Security Measures:'));
    console.log(chalk.green('  • .env files are COMPLETELY HIDDEN from diffs'));
    console.log(chalk.green('  • API keys, tokens, and secrets are automatically REDACTED'));
    console.log(chalk.green('  • Private keys and certificates are REMOVED'));
    console.log(chalk.green('  • Database connection strings are SANITIZED'));
    
    console.log(chalk.yellow('\n⚠️  Still may include:'));
    console.log(chalk.yellow('  • Source code (non-sensitive files)'));
    console.log(chalk.yellow('  • Configuration files (with secrets redacted)'));
    console.log(chalk.yellow('  • Proprietary or confidential business logic'));
    
    const consent = await this.askConfirmation('\nDo you consent to sending this data to the remote AI provider?');
    
    if (!consent) {
      console.log(chalk.red('\n❌ Operation cancelled. No data was sent.'));
      console.log(chalk.blue('💡 Tip: Use --provider ollama to process data locally without sending to remote servers.'));
    }
    
    return consent;
  }

  private redactSensitivePatterns(text: string): string {
    // Completely hide .env files content
    let redacted = text.replace(/^(diff --git a\/.*\.env.*?$[\s\S]*?)(?=^diff --git |$)/gm, 
      '$1[.ENV FILE CONTENT COMPLETELY HIDDEN FOR SECURITY]\n');
    
    // Also hide other common secret files
    const sensitiveFiles = [
      /\.env(\.[a-z]+)?$/i,  // .env, .env.local, .env.production
      /\.pem$/i,              // Certificate files
      /\.key$/i,              // Private key files
      /\.p12$/i,              // PKCS12 files
      /\.pfx$/i,              // Personal Information Exchange
      /id_rsa/i,              // SSH private keys
      /credentials/i,         // Various credential files
      /secrets?\.(json|ya?ml|toml|ini)$/i,  // Secret config files
    ];
    
    // Check if content is from a sensitive file and hide it
    for (const pattern of sensitiveFiles) {
      const filePattern = new RegExp(`^(diff --git a/.*${pattern.source}.*?$[\\s\\S]*?)(?=^diff --git |$)`, 'gmi');
      redacted = redacted.replace(filePattern, (_match, header) => {
        const fileName = header.match(/a\/(.*?) b\//)?.[1] || 'sensitive file';
        return `${header.split('\n')[0]}\n[${fileName.toUpperCase()} CONTENT COMPLETELY HIDDEN FOR SECURITY]\n`;
      });
    }
    
    // Redact API keys and tokens (common patterns)
    redacted = redacted.replace(/(['"]?)(sk-[a-zA-Z0-9]{32,}|sk_[a-zA-Z0-9_-]{32,})(['"]?)/g, '$1[REDACTED_OPENAI_KEY]$3');
    redacted = redacted.replace(/(['"]?)(ghp_[a-zA-Z0-9]{36,}|ghs_[a-zA-Z0-9]{36,}|gho_[a-zA-Z0-9]{36,})(['"]?)/g, '$1[REDACTED_GITHUB_TOKEN]$3');
    redacted = redacted.replace(/(['"]?)(xox[pboa]-[a-zA-Z0-9-]{10,})(['"]?)/g, '$1[REDACTED_SLACK_TOKEN]$3');
    redacted = redacted.replace(/(['"]?)([a-zA-Z0-9]{32,})\.apps\.googleusercontent\.com(['"]?)/g, '$1[REDACTED_GOOGLE_CLIENT_ID]$3');
    
    // Redact AWS credentials
    redacted = redacted.replace(/(AKIA[0-9A-Z]{16})/g, '[REDACTED_AWS_ACCESS_KEY]');
    redacted = redacted.replace(/(['"]?)([0-9a-zA-Z/+=]{40})(['"]?)/g, (match, q1, content, q2) => {
      // Only redact if it looks like AWS secret key (base64-ish, 40 chars)
      if (/^[A-Za-z0-9/+=]{40}$/.test(content)) {
        return `${q1}[REDACTED_AWS_SECRET_KEY]${q2}`;
      }
      return match;
    });
    
    // Redact Stripe keys
    redacted = redacted.replace(/(['"]?)(sk_live_[a-zA-Z0-9]{24,}|pk_live_[a-zA-Z0-9]{24,}|sk_test_[a-zA-Z0-9]{24,}|pk_test_[a-zA-Z0-9]{24,})(['"]?)/g, 
      '$1[REDACTED_STRIPE_KEY]$3');
    
    // Redact private keys
    redacted = redacted.replace(/-----BEGIN (RSA |DSA |EC |OPENSSH )?PRIVATE KEY-----[\s\S]*?-----END (RSA |DSA |EC |OPENSSH )?PRIVATE KEY-----/g, 
      '[REDACTED_PRIVATE_KEY]');
    
    // Redact JWT tokens
    redacted = redacted.replace(/(['"]?)(eyJ[a-zA-Z0-9_-]+\.eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+)(['"]?)/g, 
      '$1[REDACTED_JWT_TOKEN]$3');
    
    // Redact passwords in common formats
    redacted = redacted.replace(/(password|passwd|pwd|secret|api_key|apikey|auth_token|access_token|private_key)[\s]*[=:][\s]*['"]([^'"]{8,})['"]/gi, 
      '$1=[REDACTED]');
    
    // Redact database connection strings
    redacted = redacted.replace(/(mongodb(\+srv)?|postgres(ql)?|mysql|redis):\/\/[^@\s]+@[^\s]+/gi, 
      '$1://[REDACTED_CONNECTION_STRING]');
    
    // Redact Bearer tokens
    redacted = redacted.replace(/Bearer\s+[a-zA-Z0-9_\-\.]+/gi, 'Bearer [REDACTED_TOKEN]');
    
    return redacted;
  }

  private async generateCommitMessage(
    diff: string,
    files: string[],
    oldMessage: string
  ): Promise<string> {
    try {
      // Redact sensitive data from diff before sending to AI provider
      const redactedDiff = this.redactSensitivePatterns(diff);
      
      let formatInstructions = '';
      
      if (this.options.template) {
        const parsed = this.parseTemplate(this.options.template);
        if (parsed.prefix) {
          // Template has specific format like "(feat)" or "[JIRA-123] feat"
          formatInstructions = `Follow this EXACT format: ${this.options.template}
Where the message part should describe what was changed.
Example: If template is "(feat): message", generate something like "(feat): add user authentication"
Example: If template is "[JIRA-XXX] type: message", generate something like "[JIRA-123] fix: resolve null pointer exception"`;
        } else {
          formatInstructions = `Use this format as a guide: ${this.options.template}`;
        }
      } else {
        formatInstructions = `1. Follows the format: <type>(<scope>): <subject>
2. Types can be: feat, fix, docs, style, refactor, test, chore, perf, ci, build, revert
3. Scope is optional but recommended (e.g., auth, api, ui)
4. All should be in lowercase`;
      }

      const languageInstruction = this.options.language && this.options.language !== 'en' 
        ? this.getLanguageInstructions(this.options.language)
        : 'Write the commit message in English.';

      // Allow custom prompt to override default instructions
      let prompt: string;
      
      if (this.options.prompt) {
        // User provided custom prompt - use it with basic context
        prompt = `You are a git commit message generator. Analyze the following git diff and file changes, then ${this.options.prompt}

Old commit message: "${oldMessage}"

Files changed:
${files.join('\n')}

Git diff (truncated if too long, sensitive data redacted):
${redactedDiff.substring(0, 8000)}

${this.options.template ? `Format: ${this.options.template}` : ''}
${languageInstruction}

Return ONLY the commit message, nothing else.`;
      } else {
        // Use default prompt with all standard instructions
        prompt = `You are a git commit message generator. Analyze the following git diff and file changes, then generate a clear, concise commit message.

Old commit message: "${oldMessage}"

Files changed:
${files.join('\n')}

Git diff (truncated if too long, sensitive data redacted):
${redactedDiff.substring(0, 8000)}

Generate a commit message that:
${formatInstructions}
4. Subject should be clear and descriptive
5. Be concise but informative
6. Focus on WHAT was changed and WHY, not HOW
7. Use present tense ("add" not "added")
8. Don't end with a period
9. Maximum 72 characters for the first line
10. Lowercase the first letter
11. ${languageInstruction}

Return ONLY the commit message, nothing else. No explanations, just the message.`;
      }

      const systemPrompt = 'You are a helpful assistant that generates clear, conventional git commit messages.';
      const message = await this.provider.generateCommitMessage(prompt, systemPrompt);
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
      // Get the last N commits instead of first N
      const startIndex = Math.max(0, commits.length - this.options.maxCommits);
      return commits.slice(startIndex);
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

    // Create a Node.js filter script (use .cjs extension for CommonJS in ES module project)
    const filterScript = path.join(process.cwd(), '.git', 'filter-msg.cjs');
    
    // Escape backslashes for use in JavaScript string literals
    const escapedMappingFile = mappingFile.replace(/\\/g, '\\\\');
    const escapedCounterFile = counterFile.replace(/\\/g, '\\\\');
    
    const scriptContent = `#!/usr/bin/env node
const fs = require('fs');

// Read the ordered messages array
const messages = JSON.parse(fs.readFileSync('${escapedMappingFile}', 'utf8'));

// Read and update the counter
const counterFile = '${escapedCounterFile}';
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
      // Properly escape the filter script path for Windows paths with spaces
      // Use double quotes around the entire msg-filter command
      const escapedFilterScript = filterScript.replace(/\\/g, '/');
      this.execCommand(`git filter-branch -f --msg-filter "node \\"${escapedFilterScript}\\"" HEAD`);
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

  public async generateForStaged(): Promise<string> {
    // Check git repository
    this.checkGitRepository();

    // Check for consent to send data to remote AI provider (if applicable)
    const hasConsent = await this.checkRemoteAPIConsent();
    if (!hasConsent) {
      throw new Error('User declined to send data to remote AI provider');
    }

    // Get staged changes
    const stagedFiles = this.execCommand('git diff --cached --name-only')
      .trim()
      .split('\n')
      .filter(Boolean);

    if (stagedFiles.length === 0) {
      throw new Error('No staged changes found. Stage your changes with: git add <files>');
    }

    // Get staged diff
    const stagedDiff = this.execCommand('git diff --cached');

    if (!stagedDiff || stagedDiff.trim().length === 0) {
      throw new Error('No staged changes found');
    }

    // Generate commit message based on staged changes
    const message = await this.generateCommitMessage(
      stagedDiff,
      stagedFiles,
      '' // No old message for new commits
    );

    return message;
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

    // Check for consent to send data to remote AI provider (if applicable)
    const hasConsent = await this.checkRemoteAPIConsent();
    if (!hasConsent) {
      process.exit(0);
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
    let skippedCount = 0;
    let improvedCount = 0;
    
    for (let i = 0; i < commits.length; i++) {
      const hash = commits[i];
      const progress = ((i + 1) / commits.length * 100).toFixed(1);
      
      try {
        const commitInfo = await this.getCommitInfo(hash, i);
        
        // Check if the commit message is already well-formed
        if (this.options.skipWellFormed) {
          const quality = this.assessCommitQuality(commitInfo.message);
          
          if (quality.isWellFormed) {
            skippedCount++;
            spinner.info(chalk.cyan(`[${progress}%] ${hash.substring(0, 8)}: ✓ Already well-formed (score: ${quality.score}/10) - ${quality.reason}`));
            continue;
          } else {
            spinner.start(chalk.blue(`[${progress}%] Processing: ${hash.substring(0, 8)} - "${commitInfo.message}" (needs improvement: ${quality.reason})`));
          }
        } else {
          spinner.start(chalk.blue(`[${progress}%] Processing: ${hash.substring(0, 8)} - "${commitInfo.message}"`));
        }

        // Generate new message with AI
        const newMessage = await this.generateCommitMessage(commitInfo.diff, commitInfo.files, commitInfo.message);
        
        if (newMessage !== commitInfo.message) {
          messageMap[hash] = newMessage;
          improvedCount++;
          spinner.succeed(chalk.green(`[${progress}%] ${hash.substring(0, 8)}: ✨ "${commitInfo.message}" → "${newMessage}"`));
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

    // Enhanced Summary
    const changedCount = Object.keys(messageMap).length;
    console.log(chalk.cyan('\n📊 Summary:'));
    console.log(chalk.blue(`  • Total commits analyzed: ${commits.length}`));
    if (this.options.skipWellFormed) {
      console.log(chalk.cyan(`  • Well-formed commits (skipped): ${skippedCount}`));
    }
    console.log(chalk.green(`  • Commits improved: ${improvedCount}`));
    console.log(chalk.yellow(`  • Commits to be rewritten: ${changedCount}`));

    if (changedCount === 0) {
      if (skippedCount > 0) {
        console.log(chalk.green('\n✨ All commits are already well-formed! No changes needed.'));
      } else {
        console.log(chalk.yellow('\nNo commit messages to change. Exiting.'));
      }
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
