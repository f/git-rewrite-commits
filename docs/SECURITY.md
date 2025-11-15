# Security & Privacy Documentation

## Privacy-First Design

`git-rewrite-commits` is designed with security and privacy as top priorities. We understand that your code is sensitive, and we've implemented multiple layers of protection.

## 🔒 Security Features

### 1. Automatic Secret Redaction

Before any data is sent to AI providers, we automatically redact:

- **API Keys**: OpenAI, GitHub, Slack, Google OAuth, Stripe, AWS
- **Tokens**: JWT tokens, Bearer tokens, OAuth tokens
- **Passwords**: In common formats like `password=`, `pwd:`, etc.
- **Database URLs**: MongoDB, PostgreSQL, MySQL, Redis connection strings
- **Private Keys**: RSA, DSA, EC, OpenSSH private key blocks

### 2. Complete File Hiding

The following files are **completely hidden** from diffs:

- `.env` files and all variants (`.env.local`, `.env.production`, etc.)
- Private key files (`.pem`, `.key`, `.p12`, `.pfx`)
- SSH keys (`id_rsa`, `id_dsa`, `id_ecdsa`)
- Secret configuration files (`secrets.json`, `secrets.yml`, `credentials`)

### 3. Opt-In Hooks

All git hooks require **explicit opt-in** for security:

```bash
# Hooks must be explicitly enabled
git config hooks.preCommitPreview true    # Enable preview hook
git config hooks.prepareCommitMsg true    # Enable generation hook
```

This ensures no data is sent without your explicit consent.

### 4. Local Processing Option

Use Ollama for **completely local AI processing**:

```bash
# Configure for local processing
git config hooks.commitProvider ollama
ollama pull llama3.2
ollama serve
```

With Ollama, your code **never leaves your machine**.

## 🛡️ Best Practices

### For Sensitive Repositories

1. **Use Ollama** for local processing:
   ```bash
   npx git-rewrite-commits --provider ollama
   ```

2. **Review with Dry Run** before applying changes:
   ```bash
   npx git-rewrite-commits --dry-run
   ```

3. **Limit Scope** when working with sensitive code:
   ```bash
   npx git-rewrite-commits --max-commits 5
   ```

### For Teams

1. **Document AI Usage**: Make sure your team knows AI tools are being used
2. **Review Redaction**: Check that sensitive patterns specific to your project are redacted
3. **Use Templates**: Enforce consistent formats that don't expose sensitive info
   ```bash
   git config hooks.commitTemplate "type(scope): message"
   ```

## 📋 What Data is Sent?

When using remote AI providers (OpenAI), the following is sent:

### ✅ What IS Sent:
- List of changed file names
- Git diff content (with secrets redacted)
- Old commit messages for context

### ❌ What is NOT Sent:
- .env file contents
- API keys and tokens
- Passwords and secrets
- Private keys
- Database connection strings
- Any file content from sensitive files

## 🔍 Verifying Redaction

You can verify redaction is working:

```bash
# See what would be sent (with redaction applied)
npx git-rewrite-commits --staged --dry-run --verbose
```

## 🚨 Security Reporting

If you discover a security vulnerability, please email security@[maintainer-email] with:

1. Description of the vulnerability
2. Steps to reproduce
3. Potential impact
4. Suggested fix (if any)

## 📝 Compliance

### GDPR Compliance
- No personal data is stored by the tool
- All processing is ephemeral
- You have full control over what data is sent

### SOC 2 Considerations
- Opt-in design ensures explicit consent
- Audit trail via git history
- Secure command construction prevents injection attacks

## 🔧 Configuration

### Global Security Settings

```bash
# Always use Ollama for all repositories
git config --global hooks.commitProvider ollama

# Never send data without explicit consent
git config --global hooks.skipRemoteConsent false
```

### Per-Repository Settings

```bash
# Configure for a specific repository
cd /path/to/sensitive/repo
git config hooks.commitProvider ollama
git config hooks.prepareCommitMsg false  # Disable for this repo
```

## 📚 Additional Resources

- [Main README](../README.md) - General usage and features
- [Hooks Documentation](../hooks/README.md) - Git hooks setup
- [API Documentation](./API.md) - Programmatic usage

## 🙏 Acknowledgments

Security features inspired by best practices from:
- OWASP Secure Coding Guidelines
- GitHub Secret Scanning patterns
- GitGuardian detection patterns

---

*Last updated: November 2024*
*Version: 2.0.0*
