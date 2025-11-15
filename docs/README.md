# Documentation

Welcome to the documentation for `git-rewrite-commits` - an AI-powered tool for automatically improving git commit messages.

## 📚 Documentation Structure

### Core Documentation
- **[Main README](../README.md)** - Installation, usage, and examples
- **[Hooks Guide](../hooks/README.md)** - Git hooks setup and configuration

### In-Depth Guides
- **[Security & Privacy](./SECURITY.md)** - Security features and best practices
- **[API Reference](./API.md)** - Programmatic usage and TypeScript API

### Web Documentation
- **[Interactive Demo](https://f.github.io/git-rewrite-commits/)** - Live web interface with examples

## 🚀 Quick Start

### Install and Run
```bash
npx git-rewrite-commits
```

### Install Git Hooks
```bash
npx git-rewrite-commits --install-hooks
```

### Enable Hooks (Required)
```bash
git config hooks.preCommitPreview true    # Preview before commit
git config hooks.prepareCommitMsg true    # Auto-generate messages
```

## 🔑 Key Features

- **🤖 AI-Powered**: Uses OpenAI GPT or local Ollama models
- **🔒 Privacy-First**: Automatic secret redaction, .env hiding
- **🏠 Local Option**: Full offline support with Ollama
- **🎯 Smart Detection**: Skips well-formed commits
- **🛡️ Safe**: Automatic backups, dry-run mode
- **🌍 Multi-language**: 20+ language support
- **📝 Templates**: Custom commit formats

## 🔒 Security Highlights

### Automatic Protection
- .env files completely hidden
- API keys auto-redacted
- Passwords removed
- Database URLs sanitized

### Privacy Controls
- Opt-in hooks
- Local AI option
- Explicit consent required

See [Security Documentation](./SECURITY.md) for details.

## 📖 Learn More

### By Use Case

**For Personal Projects:**
- Start with the [Main README](../README.md)
- Use dry-run mode to preview changes

**For Team Projects:**
- Review [Security & Privacy](./SECURITY.md) guide
- Set up team templates and conventions
- Consider using Ollama for sensitive code

**For Automation:**
- Check the [API Reference](./API.md)
- Use `--skip-remote-consent` flag
- Configure via environment variables

### By Topic

**Privacy Concerns?**
→ Read [Security Documentation](./SECURITY.md)

**Want Git Hooks?**
→ See [Hooks Guide](../hooks/README.md)

**Need API Access?**
→ Check [API Reference](./API.md)

## 💬 Support

- [GitHub Issues](https://github.com/f/git-rewrite-commits/issues)
- [npm Package](https://www.npmjs.com/package/git-rewrite-commits)
- [Source Code](https://github.com/f/git-rewrite-commits)

---

*Last updated: November 2024
