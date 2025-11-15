# grc - git-rewrite-commits (short alias)

A short command alias for [git-rewrite-commits](https://www.npmjs.com/package/git-rewrite-commits) - AI-powered git commit message rewriter.

## Installation

```bash
npm install -g grc
```

This will give you the `grc` command as a shorter alternative to `git-rewrite-commits`.

## Usage

All commands work exactly the same as `git-rewrite-commits`, just shorter:

### Quick examples

```bash
# Rewrite commit history with AI
grc

# Preview changes (dry run)
grc --dry-run

# Install git hooks
grc --install-hooks

# Generate message for staged changes
grc --staged

# Use local AI with Ollama
grc --provider ollama
```

### Complete usage

```bash
# All options from git-rewrite-commits work:
grc [options]

Options:
  -h, --help               Show help
  -V, --version           Show version
  -d, --dry-run           Preview changes without applying
  -v, --verbose           Show detailed output
  -b, --branch <branch>   Target branch (default: current)
  -m, --max-commits <n>   Process only last n commits
  -s, --staged            Generate message for staged changes
  --skip-backup           Don't create backup branch
  --skip-well-formed      Skip already well-formed commits (default)
  --no-skip-well-formed   Process all commits
  --min-quality <n>       Min quality score (0-10, default: 7)
  --provider <provider>   AI provider: openai/ollama (default: openai)
  --model <model>         AI model to use
  --template <template>   Commit message template
  --language <lang>       Output language (default: en)
  --prompt <prompt>       Custom AI prompt
  --install-hooks         Install git hooks
  --skip-remote-consent   Skip consent prompt (for automation)
```

## Why grc?

- **Shorter to type**: `grc` vs `git-rewrite-commits`
- **Easier to remember**: Git Rewrite Commits = GRC
- **Same functionality**: 100% compatible, just an alias

## Documentation

For full documentation, examples, and setup guides, see:
- [git-rewrite-commits on GitHub](https://github.com/f/git-rewrite-commits)
- [git-rewrite-commits on npm](https://www.npmjs.com/package/git-rewrite-commits)

## License

MIT - Same as git-rewrite-commits
