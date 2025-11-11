# Security Policy

## Data Privacy and Security

This tool has been designed with security and privacy in mind. Please review the following important information:

### Remote API Data Transmission

When using remote AI providers (like OpenAI), this tool transmits the following data:
- List of changed files in your commits
- Git diff content (up to 8KB per commit)
- Commit messages

**Important Privacy Considerations:**
- This data may include sensitive information such as source code, credentials, configuration files, or proprietary data
- All data transmitted to remote providers is subject to their privacy policies and terms of service
- **Consent is required**: The tool will prompt for explicit consent before sending data to remote providers
- **Automatic redaction**: Common sensitive patterns (API keys, passwords, private keys, etc.) are automatically redacted before transmission

### Local Processing Option

For maximum privacy and security:
- Use **Ollama** with local models (no data leaves your machine)
- Configure hooks with: `git config hooks.commitProvider ollama`
- Install Ollama: https://ollama.ai

### Git Hooks Security

All git hooks in this project follow these security practices:

1. **Opt-in by default**: Hooks must be explicitly enabled via git config
2. **No automatic history rewrites**: Post-commit hook requires opt-in via `git config hooks.postCommitRewrite true`
3. **Secure argument handling**: All user input is properly quoted to prevent shell injection
4. **Backup creation**: Backups are always created before history rewrites (never use `--skip-backup` in production)

#### Enabling Hooks Securely

```bash
# Enable prepare-commit-msg (generates messages for new commits)
git config hooks.prepareCommitMsg true

# Enable post-commit (improves messages after commits)
git config hooks.postCommitRewrite true

# Use local processing with Ollama (recommended for sensitive repos)
git config hooks.commitProvider ollama
```

### Sensitive Data Redaction

The tool automatically redacts common sensitive patterns:
- API keys (OpenAI, GitHub, Slack, AWS, etc.)
- Private keys (RSA, DSA, EC)
- Passwords in common formats
- AWS credentials
- Base64-encoded secrets

However, you should still:
- Review diffs before committing
- Never commit secrets or credentials
- Use `.gitignore` to exclude sensitive files
- Consider using local processing (Ollama) for highly sensitive repositories

### Supply Chain Security

To minimize supply chain risks:
- Review the hook scripts before installation
- The tool uses standard npm package management
- Hooks use `npx` to run the tool (ensure you trust the package source)
- For maximum security, audit the source code or use a vendored/pinned version

### Reporting Security Issues

If you discover a security vulnerability in this project, please report it by:
1. Opening a private security advisory on GitHub
2. Emailing the maintainers (see repository for contact info)
3. **Do not** open public issues for security vulnerabilities

### Best Practices

1. **For sensitive repositories**:
   - Use Ollama for local processing
   - Audit what data is being transmitted
   - Review the tool's source code

2. **For team repositories**:
   - Coordinate hook usage with your team
   - Document which hooks are enabled
   - Use consistent git config settings

3. **General recommendations**:
   - Never use `--skip-backup` except in testing
   - Review AI-generated messages before pushing
   - Keep the tool updated for latest security fixes
   - Use `--dry-run` to preview changes

### Privacy by Design

This tool implements privacy by design principles:
- **Minimal data collection**: Only necessary data is transmitted
- **Explicit consent**: Users must consent to remote API calls
- **Data redaction**: Sensitive patterns are automatically redacted
- **Local alternative**: Ollama provides full functionality without remote calls
- **Transparency**: All data transmission is logged and visible

### Version Pinning (Recommended)

For production use, consider pinning the tool version:
```bash
# In package.json
"devDependencies": {
  "git-rewrite-commits": "0.4.0"
}
```

Or in hooks, use:
```bash
npx git-rewrite-commits@0.4.0 --staged
```

This prevents automatic updates that could introduce vulnerabilities.
