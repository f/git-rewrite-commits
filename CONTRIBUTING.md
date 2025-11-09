# Contributing to git-rewrite-commits

First off, thank you for considering contributing to git-rewrite-commits! It's people like you that make this tool better for everyone.

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps which reproduce the problem**
- **Provide specific examples to demonstrate the steps**
- **Describe the behavior you observed after following the steps**
- **Explain which behavior you expected to see instead and why**
- **Include your environment details** (OS, Node version, npm version)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

- **Use a clear and descriptive title**
- **Provide a step-by-step description of the suggested enhancement**
- **Provide specific examples to demonstrate the steps**
- **Describe the current behavior** and **explain which behavior you expected to see instead**
- **Explain why this enhancement would be useful**

### Pull Requests

1. Fork the repo and create your branch from `main`
2. If you've added code that should be tested, add tests
3. Ensure the test suite passes
4. Make sure your code follows the existing code style
5. Issue that pull request!

## Development Setup

1. **Fork and clone the repository:**
   ```bash
   git clone https://github.com/your-username/git-rewrite-commits.git
   cd git-rewrite-commits
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Build the project:**
   ```bash
   npm run build
   ```

4. **Run in development mode:**
   ```bash
   npm run dev -- [options]
   ```

## Project Structure

```
git-rewrite-commits/
├── src/
│   ├── index.ts       # Main library with GitCommitRewriter class
│   └── cli.ts         # CLI entry point
├── dist/              # Compiled JavaScript (generated)
├── package.json       # Project metadata and dependencies
├── tsconfig.json      # TypeScript configuration
├── README.md          # User documentation
└── CONTRIBUTING.md    # This file
```

## Testing

To test your changes locally:

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Run the CLI locally:**
   ```bash
   node dist/cli.js --help
   ```

3. **Test with npx:**
   ```bash
   npx . --help
   ```

4. **Test on a sample repository:**
   ```bash
   # Create a test repo
   mkdir test-repo && cd test-repo
   git init
   # Create some commits
   echo "test" > file.txt && git add . && git commit -m "bad message 1"
   echo "test2" > file2.txt && git add . && git commit -m "bad message 2"
   
   # Run the tool in dry-run mode
   npx .. --dry-run --api-key "your-api-key"
   ```

## Commit Messages

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification. Examples:

- `feat: add support for GPT-4 vision model`
- `fix: handle empty commit messages properly`
- `docs: update installation instructions`
- `refactor: extract message generation logic`
- `test: add tests for backup creation`
- `chore: update dependencies`

## Publishing (Maintainers Only)

1. Update version in package.json
2. Create a git tag: `git tag v1.x.x`
3. Push tag: `git push origin v1.x.x`
4. GitHub Actions will automatically publish to npm

## Questions?

Feel free to open an issue with your question or reach out to the maintainers.

Thank you for contributing! 🚀
