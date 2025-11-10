# Git Hook Examples

This directory contains example Git hooks that integrate `git-rewrite-commits` into your workflow.

## Available Hooks

### 📝 post-commit
Automatically improves your commit message right after you commit.

**What it does:**
- Runs after each `git commit`
- Improves the message using AI
- Works silently in the background
- Skips well-formed messages

**Installation:**
```bash
cp hooks/post-commit .git/hooks/
chmod +x .git/hooks/post-commit
```

### 🚀 pre-push
Reviews and fixes commit messages before pushing to remote.

**What it does:**
- Runs before `git push`
- Shows which commits need improvement
- Asks for confirmation before changes
- Only processes unpushed commits

**Installation:**
```bash
cp hooks/pre-push .git/hooks/
chmod +x .git/hooks/pre-push
```

### ✏️ prepare-commit-msg
**AI-powered commit message generation for every commit!**

**What it does:**
- Analyzes your staged changes
- Generates a complete commit message using AI
- Pre-fills the commit message editor
- You can edit or replace before saving

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

2. **Set your OpenAI API key:**
   ```bash
   export OPENAI_API_KEY="your-api-key-here"
   ```

3. **Install the hooks you want:**
   ```bash
   # Install all hooks
   cp hooks/* .git/hooks/
   chmod +x .git/hooks/*

   # Or install specific hooks
   cp hooks/prepare-commit-msg .git/hooks/
   chmod +x .git/hooks/prepare-commit-msg
   ```

## Configuration

### prepare-commit-msg Hook Configuration

You can configure the template and language for generated messages:

**Via Environment Variables:**
```bash
export GIT_COMMIT_TEMPLATE="[JIRA-XXX] feat: message"
export GIT_COMMIT_LANGUAGE="es"
```

**Via Git Config (per repository):**
```bash
git config hooks.commitTemplate "[JIRA-XXX] feat: message"
git config hooks.commitLanguage "es"
```

**Via Git Config (global):**
```bash
git config --global hooks.commitTemplate "feat(scope): message"
git config --global hooks.commitLanguage "en"
```

## Disable Hooks Temporarily

```bash
# Skip hooks for one commit
git commit --no-verify -m "your message"

# or
git push --no-verify
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

## Notes

- Hooks are **local** to each repository
- They are **not** tracked by Git by default
- Team members need to install them individually
- Always test hooks in a test repository first
- Use `--dry-run` when testing new configurations
