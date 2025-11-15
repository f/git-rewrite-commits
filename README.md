# $ npx git-rewrite-commits

> AI-powered git commit message rewriter using AI

![](./git-rewrite-commits.png)

[![npm version](https://img.shields.io/npm/v/git-rewrite-commits.svg)](https://www.npmjs.com/package/git-rewrite-commits)
[![Documentation](https://img.shields.io/badge/docs-live-blue)](https://f.github.io/git-rewrite-commits/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Automatically rewrite your entire git commit history with better, conventional commit messages using AI. Perfect for cleaning up messy commit histories before open-sourcing projects or improving repository maintainability.

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
ollama pull llama3.2
ollama serve
```

> 📖 See [SECURITY.md](SECURITY.md) for complete security documentation

## Features

- **Cross-Platform**: Full support for Windows, macOS, and Linux
- **AI-Powered**: Uses OpenAI GPT or local models via Ollama to generate meaningful commit messages
- **Local AI Support**: Run completely offline with Ollama and local models
- **One-Command Hook Setup**: Install or update AI commit message hooks instantly with `npx git-rewrite-commits --install-hooks`
- **Smart Detection**: Automatically skips well-formed commits (can be disabled)
- **Quality Scoring**: Assesses commit quality and only fixes broken messages
- **Custom Templates**: Define your own commit format with `--template`
- **Custom Prompts**: Override AI behavior with `--prompt` for unique styles
- **Multi-language**: Generate messages in 20+ languages
- **Conventional Commits**: Follows conventional commit standards (feat, fix, docs, etc.)
- **Safe**: Automatically creates backup branches before rewriting
- **Flexible**: Supports dry-run mode to preview changes
- **Customizable**: Choose your preferred AI model and processing options
- **Progress Tracking**: Real-time progress indicators with colored output
- **Efficient**: Process only the last N commits for faster operation

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
```

**Step 3: Configure your AI provider:**

```bash
# Option A: OpenAI (sends data to remote API)
export OPENAI_API_KEY="your-api-key"  # Unix/macOS
# set OPENAI_API_KEY="your-api-key"    # Windows

# Option B: Ollama (local processing, recommended for sensitive repos)
ollama pull llama3.2
ollama serve
```

> **See [QUICK_START.md](QUICK_START.md) for detailed setup guide**

### Additional Configuration (Optional)

```bash
# Set your template format
git config hooks.commitTemplate "[JIRA-XXX] feat: message"

# Set language
git config hooks.commitLanguage "es"  # Spanish, French, etc.
```

## Usage

### Command Examples

```bash
# Using the full command name
git-rewrite-commits [options]

# Or using the short alias (grec)
grec [options]
```

Common use cases:

```bash
# Rewrite entire git history
grec

# Preview changes without applying (dry run)
grec --dry-run

# Generate commit message for staged changes
grec --staged

# Process only last 10 commits
grec --max-commits 10

# Use custom AI model
grec --model gpt-4

# Use local AI with Ollama
grec --provider ollama

# Install/update git hooks
grec --install-hooks
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
