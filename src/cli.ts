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

async function installGitHooks(): Promise<void> {
  console.log(chalk.cyan.bold('\n🔧 Installing Git Hooks\n'));

  // Check if in a git repository
  try {
    execSync('git rev-parse --git-dir', { stdio: 'ignore' });
  } catch {
    console.error(chalk.red('❌ Error: Not a git repository!'));
    console.error(chalk.yellow('Please run this command from within a git repository.'));
    process.exit(1);
  }

  // Get hooks directory paths
  const gitHooksDir = path.join(process.cwd(), '.git', 'hooks');
  const sourceHooksDir = path.join(__dirname, '..', 'hooks');
  
  // Create hooks directory if it doesn't exist
  if (!fs.existsSync(gitHooksDir)) {
    fs.mkdirSync(gitHooksDir, { recursive: true });
  }

  // Define available hooks
  const hooks = [
    { name: 'prepare-commit-msg', description: 'AI-powered commit message generation' },
    { name: 'post-commit', description: 'Automatic commit message improvement' },
    { name: 'pre-push', description: 'Review and fix before pushing' }
  ];

  console.log(chalk.blue('Available hooks:\n'));
  hooks.forEach((hook, i) => {
    console.log(`  ${i + 1}. ${chalk.bold(hook.name)} - ${hook.description}`);
  });

  // Install hooks
  console.log(chalk.yellow('\nInstalling hooks...'));
  let installedCount = 0;
  let skippedCount = 0;

  for (const hook of hooks) {
    const sourcePath = path.join(sourceHooksDir, hook.name);
    const targetPath = path.join(gitHooksDir, hook.name);

    // Skip README file
    if (hook.name === 'README.md') continue;

    // Check if source file exists
    if (!fs.existsSync(sourcePath)) {
      console.log(chalk.red(`  ✗ ${hook.name} - source not found`));
      continue;
    }

    // Check if hook already exists
    if (fs.existsSync(targetPath)) {
      console.log(chalk.yellow(`  ⚠ ${hook.name} - already exists (skipped)`));
      skippedCount++;
      continue;
    }

    // Copy hook file
    try {
      const content = fs.readFileSync(sourcePath, 'utf-8');
      fs.writeFileSync(targetPath, content);
      fs.chmodSync(targetPath, 0o755); // Make executable
      console.log(chalk.green(`  ✓ ${hook.name} - installed`));
      installedCount++;
    } catch (error: any) {
      console.log(chalk.red(`  ✗ ${hook.name} - installation failed: ${error.message}`));
    }
  }

  // Summary
  console.log(chalk.cyan('\n📊 Summary:'));
  console.log(chalk.green(`  ✓ Installed: ${installedCount} hook(s)`));
  if (skippedCount > 0) {
    console.log(chalk.yellow(`  ⚠ Skipped: ${skippedCount} hook(s) (already exist)`));
  }

  // Configuration instructions
  if (installedCount > 0) {
    console.log(chalk.blue('\n💡 Next steps:'));
    console.log(chalk.yellow.bold('\n  ⚠️  IMPORTANT: Hooks are opt-in for security and privacy'));
    console.log('  1. Enable hooks you want to use (REQUIRED):');
    console.log(chalk.gray('     git config hooks.prepareCommitMsg true  # Enable prepare-commit-msg'));
    console.log(chalk.gray('     git config hooks.postCommitRewrite true # Enable post-commit'));
    console.log(chalk.yellow('     Note: These hooks send data to AI providers. Use Ollama for local processing.'));
    
    console.log('\n  2. Set up your AI provider:');
    console.log(chalk.gray('     # For OpenAI (sends data to remote API):'));
    console.log(chalk.gray('     export OPENAI_API_KEY="your-api-key"'));
    console.log(chalk.gray('     # For Ollama (processes data locally):'));
    console.log(chalk.gray('     ollama pull llama3.2'));
    console.log(chalk.gray('     ollama serve'));
    console.log(chalk.gray('     git config hooks.commitProvider ollama'));
    
    console.log('\n  3. Optional: Configure template and language:');
    console.log(chalk.gray('     git config hooks.commitTemplate "(feat): message"'));
    console.log(chalk.gray('     git config hooks.commitLanguage "en"'));
    
    console.log('\n  4. Start committing! Enabled hooks will work automatically.');
    
    if (installedCount === hooks.length) {
      console.log(chalk.green('\n✨ All hooks installed successfully!'));
      console.log(chalk.yellow('Remember to enable them with git config (see step 1 above)'));
    }
  } else if (skippedCount === hooks.length) {
    console.log(chalk.yellow('\n⚠️  All hooks already installed. No changes made.'));
    console.log(chalk.gray('To reinstall, remove existing hooks from .git/hooks/ first.'));
  }
}

const program = new Command();

program
  .name('git-rewrite-commits')
  .description('AI-powered git commit message rewriter using OpenAI or Ollama')
  .version(packageJson.version)
  .option('--provider <provider>', 'AI provider to use: "openai" or "ollama"', 'openai')
  .option('-k, --api-key <key>', 'OpenAI API key (defaults to OPENAI_API_KEY env var)')
  .option('-m, --model <model>', 'AI model to use (default: gpt-3.5-turbo for OpenAI, llama3.2 for Ollama)')
  .option('--ollama-url <url>', 'Ollama server URL', 'http://localhost:11434')
  .option('-b, --branch <branch>', 'Branch to rewrite (defaults to current branch)')
  .option('-d, --dry-run', 'Show what would be changed without modifying repository')
  .option('-v, --verbose', 'Show detailed output')
  .option('--max-commits <number>', 'Process only the last N commits', parseInt)
  .option('--skip-backup', 'Skip creating a backup branch (not recommended)')
  .option('--no-skip-well-formed', 'Process all commits, even well-formed ones')
  .option('--min-quality-score <score>', 'Minimum quality score (1-10) to consider well-formed', parseFloat)
  .option('-t, --template <format>', 'Custom commit message template (e.g., "(feat): message" or "[JIRA-XXX] type: message")')
  .option('-l, --language <lang>', 'Language for commit messages (default: "en")', 'en')
  .option('-p, --prompt <text>', 'Custom prompt for AI message generation (overrides default instructions)')
  .option('--staged', 'Generate a message for staged changes (for git hooks)')
  .option('--skip-remote-consent', 'Skip consent prompt for remote API calls (not recommended, use only in automated contexts)')
  .option('--install-hooks', 'Install git hooks to the current repository')
  .action(async (options) => {
    try {
      // Handle --install-hooks option
      if (options.installHooks) {
        await installGitHooks();
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
      
      if (provider === 'ollama') {
        console.log(chalk.blue('ℹ️  Using Ollama provider at ' + (options.ollamaUrl || 'http://localhost:11434')));
        console.log(chalk.gray('   Make sure Ollama is running: ollama serve'));
      }

      const rewriter = new GitCommitRewriter({
        provider: provider,
        apiKey,
        model: options.model,
        ollamaUrl: options.ollamaUrl,
        branch: options.branch,
        dryRun: options.dryRun,
        verbose: options.verbose,
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
