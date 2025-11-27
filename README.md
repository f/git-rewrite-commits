# $ npx git-rewrite-commits

> AI-powered git commit message rewriter using AI

![](./git-rewrite-commits.png)

[![npm version](https://img.shields.io/npm/v/git-rewrite-commits.svg)](https://www.npmjs.com/package/git-rewrite-commits)
[![Documentation](https://img.shields.io/badge/docs-live-blue)](https://f.github.io/git-rewrite-commits/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Blog Post](https://img.shields.io/badge/blog-read-orange)](https://blog.fka.dev/blog/2025-11-16-git-rewrite-commits-fix-your-messy-commit-history-with-ai/)

Automatically rewrite your entire git commit history with better, conventional commit messages using AI. Perfect for cleaning up messy commit histories before open-sourcing projects or improving repository maintainability.

📖 **[Read the blog post: Fix Your Messy Commit History with AI](https://blog.fka.dev/blog/2025-11-16-git-rewrite-commits-fix-your-messy-commit-history-with-ai/)**

## Important Disclaimer

> **This tool rewrites git history, which is generally NOT recommended for shared repositories!**
> 
> **When to use:**
> - Personal projects before making them public
> - Feature branches before merging (with team agreement)
> - Cleaning up local commits before pushing
> - Preparing repositories for open-sourcing
> 
> **When NOT to use:**
> - On shared branches without team coordination
> - After pushing commits that others have pulled
> - On main/master branches of team projects
> - In repositories where commit hashes are referenced
> 
> **Remember:** Rewriting history changes commit hashes and requires force-pushing, which can disrupt your team's workflow.

## Security & Privacy

🔒 **Important Privacy Notice**: When using remote AI providers (OpenAI), this tool sends your file lists and diffs to external APIs. 

**Security Features:**
- ✅ **Explicit consent required** before sending data to remote providers
- ✅ **Automatic redaction** of API keys, passwords, and private keys
- ✅ **Local processing option** via Ollama (no data leaves your machine)
- ✅ **Opt-in hooks** - all hooks require explicit enabling via git config
- ✅ **Secure argument handling** - prevents shell injection attacks
- ✅ **Always creates backups** before history rewrites

**Recommended for sensitive repositories:**
```bash
# Use local Ollama instead of remote APIs
git config hooks.commitProvider ollama
git config hooks.providerModel gemma3

ollama pull gemma3
ollama serve
```

> 📖 See [SECURITY.md](SECURITY.md) for complete security documentation

## Features
- **AI-powered commit message generation** using OpenAI GPT or local Ollama models
- **Rewrite entire git history** with better commit messages
- **Commit splitting** - Split large commits into smaller, focused commits for cleaner history
- **Conventional commits** format (feat, fix, chore, etc.)
- **Multi-language support** - generate commits in any language
- **Smart filtering** - skip already well-formed commits
- **Local AI option** with Ollama - no data leaves your machine
- **Git hooks integration** - automatic AI messages on every commit
- **Intelligent analysis** of code changes to generate meaningful messages
- **Batch processing** with rate limiting
- **Safe operation** with automatic backup branches
- **Custom templates** for team-specific formats
- **Quality scoring** to identify commits that need improvement
- **Verbose mode** with diff preview and detailed processing information
- **Custom prompts** - Override AI behavior with `--prompt` for unique styles
- **Efficient processing** - Process only the last N commits with `--max-commits`
- **Dry-run mode** - Preview changes before applying them
- **Progress tracking** - Real-time progress indicators with colored output
- **Custom context** - Project-specific guidelines via `COMMIT_MESSAGE.md` file

## Installation

### Quick Start (No Installation Required)
```bash
npx git-rewrite-commits
# or shorter:
npx grec
```

### Global Installation
```bash
# Full command name
npm install -g git-rewrite-commits

# Or install the short alias (grec = git-rewrite-commits)
npm install -g grec

# Both work identically:
git-rewrite-commits --help
grec --help  # Same thing, just shorter!
```

> ✅ **Works on all platforms**: Windows, macOS, Linux  
> 💡 **Tip**: `grec` is a shorter alias for `git-rewrite-commits` - use whichever you prefer!

## Quick Hook Installation

**Step 1: Install or update the AI commit message hooks**

```bash
npx git-rewrite-commits --install-hooks
# or with the short alias:
npx grec --install-hooks
```

> 💡 **Updates existing hooks**: If hooks already exist, they'll be updated to the latest version. Non-git-rewrite-commits hooks are backed up before replacement.

**Step 2: Enable the hooks you want (opt-in required for security):**

```bash
# Option A: Enable message preview before commit
git config hooks.preCommitPreview true

# Option B: Enable automatic message generation
git config hooks.prepareCommitMsg true

# Or enable both for the full experience!

# For privacy: use local Ollama instead of remote OpenAI
git config hooks.commitProvider ollama
git config hooks.providerModel llama3.2  # Optional: specify model
```

**Step 3: Configure your AI provider:**

```bash
# Option A: OpenAI (sends data to remote API)
export OPENAI_API_KEY="your-api-key"  # Unix/macOS
# set OPENAI_API_KEY="your-api-key"    # Windows

# Option B: Ollama (local processing, recommended for sensitive repos)
ollama pull llama3.2
ollama serve

# Option C: Ollama on a custom server/port
export OLLAMA_URL="http://192.168.1.100:11434"  # Unix/macOS
# set OLLAMA_URL=http://192.168.1.100:11434     # Windows
```

> **See [QUICK_START.md](QUICK_START.md) for detailed setup guide**

### Additional Configuration (Optional)

```bash
# Set your template format
git config hooks.commitTemplate "[JIRA-XXX] feat: message"

# Set language
git config hooks.commitLanguage "es"  # Spanish, French, etc.

# Set specific model
git config hooks.providerModel "gpt-4"  # or "gpt-3.5-turbo", "llama3.2", etc.

# Set custom Ollama server URL (if not using localhost:11434)
git config hooks.ollamaUrl "http://192.168.1.100:11434"
```

### Custom Project Guidelines with `COMMIT_MESSAGE.md`

You can provide project-specific commit message guidelines that the AI will follow by creating a `COMMIT_MESSAGE.md` file. The tool searches for this file in the following locations (in order):

1. **Project root** - `./COMMIT_MESSAGE.md`
2. **Git directory** - `./.git/COMMIT_MESSAGE.md`
3. **GitHub directory** - `./.github/COMMIT_MESSAGE.md`

Example `COMMIT_MESSAGE.md`:
```markdown
# Project Commit Guidelines

## Requirements
- Use conventional commits with these scopes: auth, api, ui, db
- Include ticket numbers when available (e.g., JIRA-123)
- Security changes must be clearly marked
- Breaking changes need BREAKING CHANGE in the message

## Project Context
This is a financial services API that handles sensitive data.
Emphasize security, compliance, and performance in commit messages.
```

See [`COMMIT_MESSAGE.md.example`](COMMIT_MESSAGE.md.example) in this repository for a complete example.

## Usage

### Command Examples

```bash
# Using the full command name
npx git-rewrite-commits [options]

# Or using the short alias (grec)
npx grec [options]
```

Common use cases:

```bash
# Rewrite entire git history
npx git-rewrite-commits

# Preview changes without applying (dry run)
npx git-rewrite-commits --dry-run

# Generate commit message for staged changes
npx git-rewrite-commits --staged

# Process only last 10 commits
npx git-rewrite-commits --max-commits 10

# Use custom AI model
npx git-rewrite-commits --model gpt-4

# Use local AI with Ollama
npx git-rewrite-commits --provider ollama

# Install/update git hooks
npx git-rewrite-commits --install-hooks

# Split commits into smaller, focused commits
npx git-rewrite-commits --split

# Preview splits without applying (dry run)
npx git-rewrite-commits --split --dry-run
```

## Real-World Examples

### Automatic Commit Message Generation

**Two Smart Hooks**: 
1. **pre-commit**: Preview AI message and optionally replace bad commit messages
2. **prepare-commit-msg**: Automatically generate or use approved messages

```bash
# Install the hooks (using either command)
npx git-rewrite-commits --install-hooks
# or
npx grec --install-hooks

# Enable them (opt-in for security)
git config hooks.preCommitPreview true    # Preview before commit
git config hooks.prepareCommitMsg true    # Auto-generate in editor

# Configure provider
git config hooks.commitProvider ollama  # or use OpenAI with OPENAI_API_KEY
git config hooks.providerModel llama3.2  # Optional: specify model
```

Now when you run `git commit`:
- With pre-commit: You'll see a preview of the AI message first
- With prepare-commit-msg: The AI message appears in your editor

### Manual Rewriting for Existing Commits

```bash
# Clean up the last 5 commits before pushing
echo "🔧 Improving commit messages before push..."
npx git-rewrite-commits --max-commits 5 --dry-run

echo "Apply changes? (y/n)"
read answer
if [ "$answer" = "y" ]; then
```

### Splitting Large Commits

The `--split` option analyzes your commits and suggests how to split them into smaller, more focused commits. This is useful for cleaning up messy commits that contain multiple unrelated changes.

```bash
# Analyze and split commits (with preview)
npx git-rewrite-commits --split --dry-run

# Apply splits to the last 5 commits
npx git-rewrite-commits --split --max-commits 5

# Limit maximum splits per commit
npx git-rewrite-commits --split --max-splits 3

# Use with Ollama for local processing
npx git-rewrite-commits --split --provider ollama
```

The AI analyzes each commit and determines if it should be split based on:
- Different files serving different purposes (source vs tests vs config)
- Different types of changes (feature + refactor + docs)
- Unrelated functionality grouped together
- Changes that could be logically separated for better history

Each split gets its own conventional commit message, making your git history cleaner and more rollback-friendly.

### Alias for Quick Fixes

Add to your `~/.gitconfig` or `~/.zshrc`/`~/.bashrc`:

```bash
# Git alias
git config --global alias.fix-commits '!npx git-rewrite-commits --max-commits'

# Usage: git fix-commits 3
```

```bash
# Shell alias
alias fix-last-commit='npx git-rewrite-commits --max-commits 1 --skip-backup'
alias fix-branch='npx git-rewrite-commits --max-commits 20'

# Usage: fix-last-commit
```

### Team Workflow: Feature Branch Cleanup

Before creating a pull request:

```bash
# 1. Check what needs fixing
npx git-rewrite-commits --dry-run --max-commits 10

# 2. Apply improvements
npx git-rewrite-commits --max-commits 10

# 3. Force push to your feature branch
git push --force-with-lease origin feature-branch
```

### CI/CD Integration

Add to your CI pipeline (e.g., GitHub Actions) for PR validation:

```yaml
- name: Check Commit Quality
  run: |
    npx git-rewrite-commits --dry-run --max-commits ${{ github.event.pull_request.commits }}
    # This will show which commits would be improved
```

### Preparing for Open Source

Before making a private repo public:

```bash
# Fix all commits with custom template
npx git-rewrite-commits \
  --template "feat(scope): message" \
  --language en \
  --no-skip-well-formed

# Review the changes
git log --oneline -20

# If satisfied, force push
git push --force-with-lease origin main
```

## How It Works

1. **Analyze**: Reads your staged changes or commit history
2. **Generate**: Uses AI to create meaningful, conventional commit messages
3. **Apply**: Updates your commits with better messages

### Smart Message Replacement
When you use `git commit -m "bad message"`, pre-commit can:
- Suggest a better AI-generated message
- **Replace your bad message** when you approve it
- Show what was replaced in the commit editor

### History Rewriting Process
1. **Creates backup**: Saves current branch state
2. **Rewrites history**: Uses `git filter-branch` to apply new messages
3. **Provides recovery**: Keeps backup branch for restoration if needed

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (using conventional commits!)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Bug Reports

If you discover any bugs, please create an issue [here](https://github.com/f/git-rewrite-commits/issues).

## Contact

For questions and support, please open an issue in the GitHub repository.

---

**Remember: Always backup your repository before rewriting history!** 🔒
