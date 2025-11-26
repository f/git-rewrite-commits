#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { GitCommitRewriter } from './index.js';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const packageJson = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf-8')
);

async function installCommitHooks(): Promise<void> {
  console.log(chalk.cyan.bold('\n🎯 Installing AI Commit Message Hooks\n'));

  // Check if in a git repository
  try {
    execSync('git rev-parse --git-dir', { stdio: 'ignore' });
  } catch {
    console.error(chalk.red('❌ Error: Not a git repository!'));
    console.error(chalk.yellow('Please run this command from within a git repository.'));
    process.exit(1);
  }

  // Detect operating system
  const isWindows = process.platform === 'win32';
  const fileExtension = isWindows ? '.bat' : '';
  
  // Get hooks directory paths
  const gitHooksDir = path.join(process.cwd(), '.git', 'hooks');
  const sourceHooksDir = path.join(__dirname, '..', 'hooks');
  
  // Create hooks directory if it doesn't exist
  if (!fs.existsSync(gitHooksDir)) {
    fs.mkdirSync(gitHooksDir, { recursive: true });
  }

  const hooks = [
    { name: 'pre-commit', description: 'Preview AI message before committing' },
    { name: 'prepare-commit-msg', description: 'Generate AI message automatically' }
  ];

  console.log(chalk.blue(`Installing hooks for ${isWindows ? 'Windows' : 'Unix/macOS'}:\n`));
  hooks.forEach(hook => {
    console.log(`  • ${chalk.bold(hook.name)} - ${hook.description}`);
  });
  console.log('');

  let installedCount = 0;
  let updatedCount = 0;

  for (const hook of hooks) {
    const sourceFile = hook.name + fileExtension;
    const sourcePath = path.join(sourceHooksDir, sourceFile);
    const targetPath = path.join(gitHooksDir, hook.name);

    // Check if source file exists
    if (!fs.existsSync(sourcePath)) {
      console.error(chalk.red(`  ✗ ${hook.name} - source not found`));
      continue;
    }

    // Check if hook already exists
    if (fs.existsSync(targetPath)) {
      // Back up existing hook if it's not our hook
      const existingContent = fs.readFileSync(targetPath, 'utf-8');
      if (!existingContent.includes('git-rewrite-commits')) {
        const backupPath = `${targetPath}.backup-${Date.now()}`;
        fs.copyFileSync(targetPath, backupPath);
        console.log(chalk.yellow(`  ⚠ ${hook.name} - backed up existing to ${path.basename(backupPath)}`));
      }
    }

    // Copy hook file
    try {
      const existedBefore = fs.existsSync(targetPath);
      const content = fs.readFileSync(sourcePath, 'utf-8');
      fs.writeFileSync(targetPath, content);
      
      // Make executable on Unix-like systems
      if (!isWindows) {
        fs.chmodSync(targetPath, 0o755);
      }
      
      if (existedBefore) {
        console.log(chalk.green(`  ✓ ${hook.name} - updated`));
        updatedCount++;
      } else {
        console.log(chalk.green(`  ✓ ${hook.name} - installed`));
        installedCount++;
      }
    } catch (error: any) {
      console.error(chalk.red(`  ✗ ${hook.name} - installation failed: ${error.message}`));
    }
  }

  // Summary
  console.log(chalk.cyan('\n📊 Summary:'));
  if (installedCount > 0) {
    console.log(chalk.green(`  ✓ Installed: ${installedCount} new hook(s)`));
  }
  if (updatedCount > 0) {
    console.log(chalk.blue(`  ↻ Updated: ${updatedCount} existing hook(s)`));
  }

  // Configuration instructions
  if (installedCount > 0 || updatedCount > 0) {
    console.log(chalk.blue('\n💡 Setup Instructions:'));
    console.log(chalk.yellow.bold('\n⚠️  IMPORTANT: Hooks are opt-in for security and privacy'));
    
    console.log('\n1. Enable the hooks you want (REQUIRED):');
    console.log(chalk.gray('   git config hooks.preCommitPreview true    # Enable preview before commit'));
    console.log(chalk.gray('   git config hooks.prepareCommitMsg true    # Enable auto-generation'));
    
    console.log('\n2. Set up your AI provider:');
    console.log(chalk.gray('   # Option A: OpenAI (sends data to remote API)'));
    if (isWindows) {
      console.log(chalk.gray('   set OPENAI_API_KEY="your-api-key"'));
    } else {
      console.log(chalk.gray('   export OPENAI_API_KEY="your-api-key"'));
    }
    console.log(chalk.gray('\n   # Option B: Ollama (processes data locally - recommended)'));
    console.log(chalk.gray('   ollama pull llama3.2'));
    console.log(chalk.gray('   ollama serve'));
    console.log(chalk.gray('   git config hooks.commitProvider ollama'));
    console.log(chalk.gray('\n   # Option C: Claude Code (uses your Claude subscription, no API key needed)'));
    console.log(chalk.gray('   npm install -g @anthropic-ai/claude-code'));
    console.log(chalk.gray('   claude login'));
    console.log(chalk.gray('   git config hooks.commitProvider claude-code'));
    
    console.log('\n3. Optional customizations:');
    console.log(chalk.gray('   git config hooks.commitTemplate "type(scope): message"'));
    console.log(chalk.gray('   git config hooks.commitLanguage "en"'));
    
    console.log(chalk.green('\n✨ You\'re all set! The hooks will work with your git commits.'));
  }
}

const program = new Command();

program
  .name('git-rewrite-commits')
  .description('AI-powered git commit message rewriter using OpenAI or Ollama')
  .version(packageJson.version)
  .option('--provider <provider>', 'AI provider to use: "openai", "ollama", or "claude-code"', 'openai')
  .option('-k, --api-key <key>', 'OpenAI API key (defaults to OPENAI_API_KEY env var)')
  .option('-m, --model <model>', 'AI model to use (default: gpt-3.5-turbo for OpenAI, llama3.2 for Ollama, haiku for Claude Code)')
  .option('--ollama-url <url>', 'Ollama server URL', 'http://localhost:11434')
  .option('-b, --branch <branch>', 'Branch to rewrite (defaults to current branch)')
  .option('-d, --dry-run', 'Show what would be changed without modifying repository')
  .option('-v, --verbose', 'Show detailed output including diffs and file changes')
  .option('--max-commits <number>', 'Process only the last N commits', parseInt)
  .option('--skip-backup', 'Skip creating a backup branch (not recommended)')
  .option('--no-skip-well-formed', 'Process all commits, even well-formed ones')
  .option('--min-quality-score <score>', 'Minimum quality score (1-10) to consider well-formed', parseFloat)
  .option('-t, --template <format>', 'Custom commit message template (e.g., "(feat): message" or "[JIRA-XXX] type: message")')
  .option('-l, --language <lang>', 'Language for commit messages (default: "en")', 'en')
  .option('-p, --prompt <text>', 'Custom prompt for AI message generation (overrides default instructions)')
  .option('--staged', 'Generate a message for staged changes (for git hooks)')
  .option('-q, --quiet', 'Suppress all informational output (useful for git hooks)')
  .option('--skip-remote-consent', 'Skip consent prompt for remote API calls (not recommended, use only in automated contexts)')
  .option('--install-hooks', 'Install AI commit message hooks (pre-commit and prepare-commit-msg)')
  .action(async (options) => {
    try {
      // Handle --install-hooks option
      if (options.installHooks) {
        await installCommitHooks();
        process.exit(0);
      }

      // Check for API key if using OpenAI
      const provider = options.provider || 'openai';
      const apiKey = options.apiKey || process.env.OPENAI_API_KEY;
      
      if (provider === 'openai' && !apiKey) {
        console.error(chalk.red('\n❌ Error: OpenAI API key is required!'));
        console.error(chalk.yellow('\nPlease provide it using one of these methods:'));
        console.error(chalk.cyan('  1. Set environment variable: export OPENAI_API_KEY="your-api-key"'));
        console.error(chalk.cyan('  2. Pass as argument: git-rewrite-commits --api-key "your-api-key"'));
        console.error(chalk.dim('\nGet your API key at: https://platform.openai.com/api-keys'));
        console.error(chalk.blue('\n💡 Tip: Use --provider ollama to use local models with Ollama instead'));
        process.exit(1);
      }
      
      // Only show informational messages when NOT in quiet mode
      if (provider === 'ollama' && !options.quiet) {
        console.log(chalk.blue('ℹ️  Using Ollama provider at ' + (options.ollamaUrl || 'http://localhost:11434')));
        console.log(chalk.gray('   Make sure Ollama is running: ollama serve'));
      }

      if (provider === 'claude-code' && !options.quiet) {
        console.log(chalk.blue('ℹ️  Using Claude Code CLI provider'));
        console.log(chalk.gray('   Make sure Claude Code is installed and authenticated: claude login'));
      }

      const rewriter = new GitCommitRewriter({
        provider: provider,
        apiKey,
        model: options.model,
        ollamaUrl: options.ollamaUrl,
        branch: options.branch,
        dryRun: options.dryRun,
        verbose: options.verbose,
        quiet: options.quiet,
        maxCommits: options.maxCommits,
        skipBackup: options.skipBackup,
        skipWellFormed: options.skipWellFormed !== false,
        minQualityScore: options.minQualityScore,
        template: options.template,
        language: options.language,
        prompt: options.prompt,
        skipRemoteConsent: options.skipRemoteConsent,
      });

      if (options.staged) {
        // Generate message for staged changes
        const message = await rewriter.generateForStaged();
        console.log(message);
      } else {
        await rewriter.rewrite();
      }
    } catch (error: any) {
      console.error(chalk.red(`\n❌ Error: ${error.message}`));
      if (options.verbose && error.stack) {
        console.error(chalk.gray(error.stack));
      }
      process.exit(1);
    }
  });

// Add examples
program.addHelpText('after', `
${chalk.bold('Examples:')}
  ${chalk.gray('# Basic usage with OpenAI (uses OPENAI_API_KEY env var)')}
  $ git-rewrite-commits

  ${chalk.gray('# Dry run to preview changes')}
  $ git-rewrite-commits --dry-run

  ${chalk.gray('# Use a different model')}
  $ git-rewrite-commits --model gpt-4

  ${chalk.gray('# Process only the last 10 commits')}
  $ git-rewrite-commits --max-commits 10
  
  ${chalk.gray('# Process all commits, including well-formed ones')}
  $ git-rewrite-commits --no-skip-well-formed
  
  ${chalk.gray('# Show detailed output with diffs')}
  $ git-rewrite-commits --verbose --max-commits 5
  
  ${chalk.gray('# Set custom quality threshold (default is 7)')}
  $ git-rewrite-commits --min-quality-score 8

  ${chalk.gray('# Use a custom template format')}
  $ git-rewrite-commits --template "(feat): message"
  $ git-rewrite-commits --template "[JIRA-123] feat: message"
  $ git-rewrite-commits --template "🔧 fix: message"

  ${chalk.gray('# Generate messages in another language')}
  $ git-rewrite-commits --language es  ${chalk.gray('# Spanish')}
  $ git-rewrite-commits --language zh  ${chalk.gray('# Chinese')}
  $ git-rewrite-commits --language ja  ${chalk.gray('# Japanese')}

  ${chalk.gray('# Generate message for staged changes (for git hooks)')}
  $ git-rewrite-commits --staged
  $ git-rewrite-commits --staged --template "[JIRA-123] feat: message"

  ${chalk.gray('# Use custom prompt for message generation')}
  $ git-rewrite-commits --prompt "Generate a funny commit message with emojis"
  $ git-rewrite-commits --prompt "Write a haiku commit message"
  $ git-rewrite-commits --prompt "Be extremely detailed and technical"

  ${chalk.gray('# Use Ollama with local models')}
  $ git-rewrite-commits --provider ollama --model llama3.2

  ${chalk.gray('# Use Claude Code CLI (no API key needed, uses Claude subscription)')}
  $ git-rewrite-commits --provider claude-code
  $ git-rewrite-commits --provider claude-code --model opus

  ${chalk.gray('# Custom prompt for specific requirements')}
  $ git-rewrite-commits --prompt "generate humorous but professional messages"

  ${chalk.gray('# Explicitly pass API key for OpenAI')}
  $ git-rewrite-commits --api-key "sk-..."

${chalk.bold('Environment Variables:')}
  OPENAI_API_KEY    Your OpenAI API key (required when using OpenAI provider)

${chalk.bold('Important Notes:')}
  ${chalk.yellow('⚠️  This tool rewrites git history!')}
  - Always work on a separate branch
  - Create a backup before running
  - Use --force-with-lease when pushing changes
`);

program.parse(process.argv);
