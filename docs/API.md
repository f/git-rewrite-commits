# API Documentation

## Programmatic Usage

`git-rewrite-commits` can be used programmatically in your Node.js applications.

## Installation

```bash
npm install git-rewrite-commits
```

## Basic Usage

```typescript
import { GitCommitRewriter } from 'git-rewrite-commits';

const rewriter = new GitCommitRewriter({
  provider: 'openai',  // or 'ollama'
  apiKey: process.env.OPENAI_API_KEY,
  model: 'gpt-4',  // optional, defaults to gpt-3.5-turbo
  dryRun: false,
  verbose: true
});

// Rewrite history
await rewriter.rewriteHistory();

// Generate message for staged changes
const message = await rewriter.generateForStaged();
console.log(message);
```

## Configuration Options

### Constructor Options

```typescript
interface RewriteOptions {
  provider?: 'openai' | 'ollama';
  apiKey?: string;
  model?: string;
  ollamaUrl?: string;
  branch?: string;
  dryRun?: boolean;
  verbose?: boolean;
  maxCommits?: number;
  skipBackup?: boolean;
  skipWellFormed?: boolean;
  minQualityScore?: number;
  template?: string;
  language?: string;
  prompt?: string;
  skipRemoteConsent?: boolean;
}
```

### Option Details

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `provider` | string | `'openai'` | AI provider to use |
| `apiKey` | string | `process.env.OPENAI_API_KEY` | API key for OpenAI |
| `model` | string | `'gpt-3.5-turbo'` or `'llama3.2'` | AI model to use |
| `ollamaUrl` | string | `'http://localhost:11434'` | Ollama server URL |
| `branch` | string | current branch | Git branch to rewrite |
| `dryRun` | boolean | `false` | Preview changes without applying |
| `verbose` | boolean | `false` | Show detailed output |
| `maxCommits` | number | all | Limit number of commits to process |
| `skipBackup` | boolean | `false` | Skip creating backup branch |
| `skipWellFormed` | boolean | `true` | Skip already well-formed commits |
| `minQualityScore` | number | `7` | Minimum score to consider well-formed |
| `template` | string | none | Commit message template |
| `language` | string | `'en'` | Language for commit messages |
| `prompt` | string | none | Custom AI prompt |
| `skipRemoteConsent` | boolean | `false` | Skip consent prompt (for automation) |

## Methods

### `rewriteHistory()`

Rewrites the commit history of the current branch.

```typescript
const result = await rewriter.rewriteHistory();
console.log(`Improved ${result.improved} commits`);
console.log(`Skipped ${result.skipped} well-formed commits`);
```

### `generateForStaged()`

Generates a commit message for staged changes.

```typescript
const message = await rewriter.generateForStaged();
// Returns: "feat(auth): add JWT token validation"
```

## AI Providers

### OpenAI Provider

```typescript
const rewriter = new GitCommitRewriter({
  provider: 'openai',
  apiKey: 'sk-...',  // Your OpenAI API key
  model: 'gpt-4'     // or 'gpt-3.5-turbo'
});
```

### Ollama Provider (Local)

```typescript
const rewriter = new GitCommitRewriter({
  provider: 'ollama',
  model: 'llama3.2',  // or any Ollama model
  ollamaUrl: 'http://localhost:11434'
});
```

## Templates

Use templates to enforce consistent commit message formats:

```typescript
const rewriter = new GitCommitRewriter({
  template: '[JIRA-{ticket}] {type}: {description}'
});

// Generates: "[JIRA-123] feat: add user authentication"
```

### Built-in Template Variables

- `{type}` - Commit type (feat, fix, docs, etc.)
- `{scope}` - Commit scope (optional)
- `{description}` - Commit description
- `{ticket}` - Extracted ticket number (if found)

## Custom Prompts

Override the AI behavior with custom prompts:

```typescript
const rewriter = new GitCommitRewriter({
  prompt: 'Generate a commit message with emojis and enthusiasm'
});

// Generates: "✨ feat(ui): Add amazing new dashboard! 🚀"
```

## Multi-language Support

Generate messages in different languages:

```typescript
const rewriter = new GitCommitRewriter({
  language: 'es'  // Spanish
});

// Generates: "feat(auth): añadir validación de token JWT"
```

Supported languages:
- `en` - English
- `es` - Spanish
- `fr` - French
- `de` - German
- `it` - Italian
- `pt` - Portuguese
- `ru` - Russian
- `ja` - Japanese
- `ko` - Korean
- `zh` - Chinese (Simplified)
- And 10+ more...

## Error Handling

```typescript
try {
  await rewriter.rewriteHistory();
} catch (error) {
  if (error.message.includes('API key')) {
    console.error('Invalid API key');
  } else if (error.message.includes('git repository')) {
    console.error('Not in a git repository');
  } else {
    console.error('Error:', error.message);
  }
}
```

## Advanced Examples

### Selective Rewriting

```typescript
// Only rewrite the last 10 commits
const rewriter = new GitCommitRewriter({
  maxCommits: 10,
  skipWellFormed: false  // Process all commits
});
```

### Custom Quality Scoring

```typescript
// Set higher quality threshold
const rewriter = new GitCommitRewriter({
  minQualityScore: 9,  // Only skip very well-formed commits
  verbose: true        // See quality scores
});
```

### Automation-Friendly

```typescript
// For CI/CD pipelines
const rewriter = new GitCommitRewriter({
  skipRemoteConsent: true,  // No interactive prompts
  skipBackup: true,         // Don't create backup branches
  dryRun: true             // Safety first
});
```

### With Custom Provider Implementations

```typescript
import { createProvider } from 'git-rewrite-commits/providers';

const customProvider = createProvider({
  provider: 'ollama',
  model: 'codellama',
  ollamaUrl: process.env.OLLAMA_URL
});
```

## TypeScript Support

Full TypeScript definitions are included:

```typescript
import { 
  GitCommitRewriter,
  RewriteOptions,
  CommitInfo,
  AIProvider 
} from 'git-rewrite-commits';
```

## Security Considerations

When using the API programmatically:

1. **Never hardcode API keys** - Use environment variables
2. **Enable redaction** - Sensitive data is auto-redacted by default
3. **Use Ollama for sensitive code** - Keep processing local
4. **Set skipRemoteConsent carefully** - Only in automated environments

## Performance

- Processes commits in batches for efficiency
- Caches provider connections
- Limits diff size to 8KB per commit
- Supports streaming responses (Ollama)

## Debugging

Enable verbose mode for detailed output:

```typescript
const rewriter = new GitCommitRewriter({
  verbose: true
});

// Or set environment variable
process.env.DEBUG = 'git-rewrite-commits:*';
```

---

*For CLI usage, see the [main documentation](../README.md)*
