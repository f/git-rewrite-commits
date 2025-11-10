# Quick Start Guide

## 🚀 Get AI-Powered Commits in 30 Seconds

### 1. Set your API key
```bash
export OPENAI_API_KEY="your-api-key-here"
```
Get your key at: https://platform.openai.com/api-keys

### 2. Install hooks (one command!)
```bash
npx git-rewrite-commits --install-hooks
```

### 3. Start committing with AI
```bash
git add .
git commit
# ✨ AI message appears automatically in your editor!
```

## What Gets Installed?

### 📝 prepare-commit-msg
- **When**: Every time you run `git commit`
- **What**: Generates AI message based on your staged changes
- **Result**: Editor opens with perfect commit message ready to use

### ✅ post-commit
- **When**: After you commit
- **What**: Reviews and improves your commit message
- **Result**: Automatically fixes poor messages

### 🚀 pre-push  
- **When**: Before `git push`
- **What**: Reviews unpushed commits
- **Result**: Offers to fix messages before pushing

## Configuration (Optional)

### Set your team's format
```bash
git config hooks.commitTemplate "[JIRA-XXX] feat: message"
```

### Set language
```bash
git config hooks.commitLanguage "es"  # Spanish
git config hooks.commitLanguage "fr"  # French
git config hooks.commitLanguage "ja"  # Japanese
```

## Uninstall Hooks

To remove hooks:
```bash
rm .git/hooks/prepare-commit-msg
rm .git/hooks/post-commit
rm .git/hooks/pre-push
```

## Examples

### What You Type
```bash
git add src/auth.ts
git commit
```

### What You Get (automatically!)
```
feat(auth): implement JWT token validation middleware

# ✨ AI-generated commit message above
# Feel free to edit as needed before saving
# 
# Files being committed:
# M       src/auth.ts
```

## Troubleshooting

### API Key Not Set?
```bash
export OPENAI_API_KEY="sk-..."
# Add to ~/.bashrc or ~/.zshrc to make permanent
```

### Hooks Not Working?
```bash
# Check if installed
ls -la .git/hooks/

# Reinstall
npx git-rewrite-commits --install-hooks
```

### Want Different Template?
```bash
# Per repository
git config hooks.commitTemplate "🚀 feat: message"

# Global (all repositories)
git config --global hooks.commitTemplate "feat(scope): message"
```

## Why Use This?

- ✅ **Zero effort** - AI writes your commit messages
- ✅ **Consistent format** - Always follows conventions
- ✅ **Team-friendly** - Everyone gets same quality
- ✅ **Time-saving** - No more thinking about messages
- ✅ **Educational** - Learn good commit practices

## Next Steps

1. Try the tool on a test repository first
2. Configure your preferred template
3. Share with your team!

---

**Need help?** Create an issue at: https://github.com/yourusername/git-rewrite-commits
