#!/usr/bin/env node

// grc - Short alias for git-rewrite-commits
// This package provides a shorter command name for git-rewrite-commits

import { spawn } from 'child_process';
import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Try to find git-rewrite-commits
let gitRewriteCommitsPath;

try {
  // Try to resolve the actual git-rewrite-commits package
  const packagePath = require.resolve('git-rewrite-commits/package.json');
  const packageDir = path.dirname(packagePath);
  const packageJson = require(packagePath);
  
  // Get the bin path from package.json
  const binPath = packageJson.bin?.['git-rewrite-commits'] || packageJson.bin;
  gitRewriteCommitsPath = path.join(packageDir, binPath);
} catch (error) {
  // Fallback to npx if package not found locally
  gitRewriteCommitsPath = 'npx';
  process.argv.splice(2, 0, 'git-rewrite-commits');
}

// Forward all arguments to git-rewrite-commits
const args = process.argv.slice(2);

// If using npx, the command is already in args
const command = gitRewriteCommitsPath === 'npx' ? 'npx' : gitRewriteCommitsPath;

const child = spawn(command, args, {
  stdio: 'inherit',
  shell: true
});

child.on('exit', (code) => {
  process.exit(code || 0);
});

child.on('error', (error) => {
  console.error('Error running git-rewrite-commits:', error.message);
  console.error('Please ensure git-rewrite-commits is installed:');
  console.error('  npm install -g git-rewrite-commits');
  process.exit(1);
});
