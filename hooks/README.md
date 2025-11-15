# Git Hooks

This directory contains AI-powered Git hooks that integrate `git-rewrite-commits` into your workflow.

> ✅ **Full Windows Support**: Native .bat scripts for Windows, shell scripts for Unix/macOS/Linux

## Available Hooks

> ℹ️ **Smart Hook Coordination**: The hooks work together intelligently:
> - Both hooks share generated messages to avoid duplicates
> - `prepare-commit-msg` skips when using `-m` flag
> - Only one AI generation happens per commit

### 🔍 pre-commit
**Preview AI-generated commit message before committing!**

**What it does:**
- Shows a preview of the AI-generated message
- Asks for confirmation before proceeding
- Saves the message for `prepare-commit-msg` to reuse (prevents regeneration)
- Can be skipped with `git commit --no-verify`

**Installation:**
```bash
cp hooks/pre-commit .git/hooks/
chmod +x .git/hooks/pre-commit
```

### 🎯 prepare-commit-msg
**Automatically generate AI-powered commit messages!**

**What it does:**
- Runs automatically when you commit without a message
- Skips if you use `git commit -m "message"` (no conflict)
- Reuses message from `pre-commit` if available (no duplicate generation)
- Analyzes your staged changes only if needed
- Inserts the AI message as default (you can edit before saving)

**Installation:**
```bash
cp hooks/prepare-commit-msg .git/hooks/
chmod +x .git/hooks/prepare-commit-msg
```

## Setup Instructions

1. **Ensure you have the tool installed:**
   ```bash
   npm install -g git-rewrite-commits
   # or use npx (no installation needed)
   ```

2. **Set up your AI provider:**
   
   **For OpenAI:**
   ```bash
   # Unix/macOS/Linux
   export OPENAI_API_KEY="your-api-key-here"
   
   # Windows
   set OPENAI_API_KEY="your-api-key-here"
   ```
   
   **For Ollama (local models):**
   ```bash
   # Install Ollama from https://ollama.ai
   ollama pull llama3.2  # Download the model
   ollama serve         # Start Ollama server
   
   # Configure git to use Ollama
   git config hooks.commitProvider ollama
   ```

3. **Install the hooks:**
   ```bash
   # Using the built-in installer (recommended - works on all platforms)
   npx git-rewrite-commits --install-hooks

   # Or manually install (Unix/macOS/Linux):
   cp hooks/pre-commit .git/hooks/
   cp hooks/prepare-commit-msg .git/hooks/
   chmod +x .git/hooks/*
   
   # Or manually install (Windows):
   copy hooks\pre-commit.bat .git\hooks\pre-commit
   copy hooks\prepare-commit-msg.bat .git\hooks\prepare-commit-msg
   ```

4. **Enable the hooks you want (required for security):**
   ```bash
   # Enable preview before commit
   git config hooks.preCommitPreview true
   
   # Enable automatic message generation
   git config hooks.prepareCommitMsg true
   ```

## Configuration

### Hooks Configuration

Both hooks share the same configuration for provider, template, and language:

**Via Environment Variables:**
```bash
# Unix/macOS/Linux
export GIT_COMMIT_PROVIDER="ollama"  # or "openai"
export GIT_COMMIT_TEMPLATE="[JIRA-XXX] feat: message"
export GIT_COMMIT_LANGUAGE="es"

# Windows
set GIT_COMMIT_PROVIDER=ollama
set GIT_COMMIT_TEMPLATE=[JIRA-XXX] feat: message
set GIT_COMMIT_LANGUAGE=es
```

**Via Git Config (per repository):**
```bash
git config hooks.commitProvider "ollama"  # or "openai"
git config hooks.commitTemplate "[JIRA-XXX] feat: message"
git config hooks.commitLanguage "es"
```

**Via Git Config (global):**
```bash
git config --global hooks.commitProvider "openai"
git config --global hooks.commitTemplate "feat(scope): message"
git config --global hooks.commitLanguage "en"
```

## Disable Hooks Temporarily

```bash
# Skip all hooks for one commit
git commit --no-verify -m "your message"

```

## Team Usage

For team projects, consider:

1. **Committing hooks to the repo:**
   ```bash
   # Create a .githooks directory
   mkdir .githooks
   cp hooks/* .githooks/
   
   # Team members can then install with:
   git config core.hooksPath .githooks
   git config hooks.preCommitPreview true   # Enable preview
   git config hooks.prepareCommitMsg true   # Enable generation
   ```

2. **Using a git hooks manager:**
   - [Husky](https://github.com/typicode/husky)
   - [Lefthook](https://github.com/evilmartians/lefthook)
   - [pre-commit](https://pre-commit.com/)

## Example Workflow

### Using prepare-commit-msg Hook

1. **Install the hook:**
   ```bash
   cp hooks/prepare-commit-msg .git/hooks/
   chmod +x .git/hooks/prepare-commit-msg
   ```

2. **Configure your template (optional):**
   ```bash
   git config hooks.commitTemplate "[TICKET-XXX] feat: message"
   ```

3. **Stage your changes:**
   ```bash
   git add src/index.ts
   ```

4. **Commit - AI message appears automatically:**
   ```bash
   git commit
   # Editor opens with:
   # [TICKET-123] feat: add user authentication middleware
   #
   # ✨ AI-generated commit message above
   # Feel free to edit as needed before saving
   ```

5. **Edit if needed and save!**

## Example Hook Configurations

### Minimal - Just fix the last commit
```bash
#!/bin/sh
npx git-rewrite-commits --max-commits 1 --skip-backup
```

### Team-friendly - With template and language
```bash
#!/bin/sh
npx git-rewrite-commits \
  --max-commits 1 \
  --template "[JIRA-XXX] type: message" \
  --language en \
  --skip-backup
```

### Conservative - Only in dry-run mode
```bash
#!/bin/sh
echo "📝 Suggested improvements:"
npx git-rewrite-commits --max-commits 5 --dry-run
echo "Run 'git-rewrite-commits --max-commits 5' to apply"
```

## Security Notes

- Both hooks are **opt-in** - must be explicitly enabled via git config
  - `git config hooks.preCommitPreview true` for preview hook
  - `git config hooks.prepareCommitMsg true` for generation hook
- .env files and secrets are **automatically redacted** before sending to AI providers
- Use **Ollama** for local processing to avoid sending data to remote APIs
- Hooks are **local** to each repository
- Team members need to install and enable them individually
- Always test hooks in a test repository first
