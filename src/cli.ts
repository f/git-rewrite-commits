#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { GitCommitRewriter } from './index';
import * as fs from 'fs';
import * as path from 'path';

const packageJson = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf-8')
);

const program = new Command();

program
  .name('git-rewrite-commits')
  .description('AI-powered git commit message rewriter using OpenAI')
  .version(packageJson.version)
  .option('-k, --api-key <key>', 'OpenAI API key (defaults to OPENAI_API_KEY env var)')
  .option('-m, --model <model>', 'OpenAI model to use', 'gpt-3.5-turbo')
  .option('-b, --branch <branch>', 'Branch to rewrite (defaults to current branch)')
  .option('-d, --dry-run', 'Show what would be changed without modifying repository')
  .option('-v, --verbose', 'Show detailed output')
  .option('--max-commits <number>', 'Maximum number of commits to process', parseInt)
  .option('--skip-backup', 'Skip creating a backup branch (not recommended)')
  .action(async (options) => {
    try {
      // Check for API key
      const apiKey = options.apiKey || process.env.OPENAI_API_KEY;
      if (!apiKey) {
        console.error(chalk.red('\n❌ Error: OpenAI API key is required!'));
        console.error(chalk.yellow('\nPlease provide it using one of these methods:'));
        console.error(chalk.cyan('  1. Set environment variable: export OPENAI_API_KEY="your-api-key"'));
        console.error(chalk.cyan('  2. Pass as argument: git-rewrite-commits --api-key "your-api-key"'));
        console.error(chalk.dim('\nGet your API key at: https://platform.openai.com/api-keys'));
        process.exit(1);
      }

      const rewriter = new GitCommitRewriter({
        apiKey,
        model: options.model,
        branch: options.branch,
        dryRun: options.dryRun,
        verbose: options.verbose,
        maxCommits: options.maxCommits,
        skipBackup: options.skipBackup,
      });

      await rewriter.rewrite();
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
  ${chalk.gray('# Basic usage (uses OPENAI_API_KEY env var)')}
  $ git-rewrite-commits

  ${chalk.gray('# Dry run to preview changes')}
  $ git-rewrite-commits --dry-run

  ${chalk.gray('# Use a different model')}
  $ git-rewrite-commits --model gpt-4

  ${chalk.gray('# Process only first 10 commits')}
  $ git-rewrite-commits --max-commits 10

  ${chalk.gray('# With explicit API key')}
  $ git-rewrite-commits --api-key "sk-..."

${chalk.bold('Environment Variables:')}
  OPENAI_API_KEY    Your OpenAI API key

${chalk.bold('Important Notes:')}
  ${chalk.yellow('⚠️  This tool rewrites git history!')}
  - Always work on a separate branch
  - Create a backup before running
  - Coordinate with your team for shared repos
  - Use --force-with-lease when pushing changes
`);

program.parse(process.argv);
