# npx git-rewrite-commits

> 🚀 AI-powered git commit message rewriter using GPT

[![npm version](https://img.shields.io/npm/v/git-rewrite-commits.svg)](https://www.npmjs.com/package/git-rewrite-commits)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Automatically rewrite your entire git commit history with better, conventional commit messages using AI. Perfect for cleaning up messy commit histories before open-sourcing projects or improving repository maintainability.

## 🎯 Features

- **AI-Powered**: Uses OpenAI's GPT models to generate meaningful commit messages
- **Conventional Commits**: Follows conventional commit standards (feat, fix, docs, etc.)
- **Safe**: Automatically creates backup branches before rewriting
- **Flexible**: Supports dry-run mode to preview changes
- **Customizable**: Choose your preferred AI model and processing options
- **Progress Tracking**: Real-time progress indicators with colored output

## 📦 Installation

You can run this tool directly with npx (no installation required):

```bash
npx git-rewrite-commits
```

Or install it globally:

```bash
npm install -g git-rewrite-commits
```

## 🚀 Quick Start

1. **Set up your OpenAI API key:**
   ```bash
   export OPENAI_API_KEY="your-api-key-here"
   ```
   
   Get your API key at: https://platform.openai.com/api-keys

2. **Navigate to your git repository:**
   ```bash
   cd your-repo
   ```

3. **Run the tool:**
   ```bash
   npx git-rewrite-commits
   ```

## 📖 Usage

### Basic Usage

```bash
# Use with environment variable OPENAI_API_KEY
npx git-rewrite-commits

# Or provide API key directly
npx git-rewrite-commits --api-key "sk-..."
```

### Options

```
Options:
  -V, --version            output the version number
  -k, --api-key <key>      OpenAI API key (defaults to OPENAI_API_KEY env var)
  -m, --model <model>      OpenAI model to use (default: "gpt-3.5-turbo")
  -b, --branch <branch>    Branch to rewrite (defaults to current branch)
  -d, --dry-run            Show what would be changed without modifying repository
  -v, --verbose            Show detailed output
  --max-commits <number>   Maximum number of commits to process
  --skip-backup            Skip creating a backup branch (not recommended)
  -h, --help               display help for command
```

### Examples

```bash
# Preview changes without modifying history (recommended first step)
npx git-rewrite-commits --dry-run

# Use GPT-4 for better quality messages
npx git-rewrite-commits --model gpt-4

# Process only the first 10 commits
npx git-rewrite-commits --max-commits 10

# Verbose mode for debugging
npx git-rewrite-commits --verbose
```

## 🛡️ Safety Features

1. **Backup Branch**: Automatically creates a backup branch before rewriting
2. **Confirmation Prompts**: Asks for confirmation at critical steps
3. **Dry Run Mode**: Preview all changes without modifying your repository
4. **Uncommitted Changes Warning**: Alerts you about uncommitted changes

## ⚠️ Important Notes

### Before Using

- **This tool rewrites git history!** This is a destructive operation.
- Always work on a separate branch, not on main/master
- Create a manual backup of your repository
- Coordinate with your team if working on a shared repository

### After Rewriting

1. **Review the changes:**
   ```bash
   git log --oneline
   ```

2. **If satisfied, force push to remote:**
   ```bash
   git push --force-with-lease
   ```

3. **If something went wrong, restore from backup:**
   ```bash
   git reset --hard backup-branch-name
   ```

4. **Clean up backup branch when done:**
   ```bash
   git branch -D backup-branch-name
   ```

## 🎨 Conventional Commit Types

The tool generates commit messages following these conventional types:

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that don't affect code meaning (formatting, etc.)
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `test`: Adding or correcting tests
- `chore`: Changes to build process or auxiliary tools
- `perf`: Performance improvements
- `ci`: CI/CD configuration changes
- `build`: Changes affecting build system or dependencies
- `revert`: Reverting a previous commit

## 🔧 Configuration

### Environment Variables

- `OPENAI_API_KEY`: Your OpenAI API key (required)

### Supported Models

- `gpt-3.5-turbo` (default) - Fast and cost-effective
- `gpt-4o` - Latest GPT model

## 🚀 Development

### Setup

```bash
# Clone the repository
git clone https://github.com/f/git-rewrite-commits.git
cd git-rewrite-commits

# Install dependencies
npm install

# Build the project
npm run build
```

### Running Locally

```bash
# Run in development mode
npm run dev

# Build and run
npm run build
node dist/cli.js
```

## 📝 How It Works

1. **Analyzes each commit**: Reads the diff, changed files, and original message
2. **Generates new message**: Uses AI to create a conventional commit message
3. **Creates backup**: Saves current state in a backup branch
4. **Rewrites history**: Uses `git filter-branch` to apply new messages
5. **Provides recovery options**: Keeps backup branch for restoration if needed

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (using conventional commits!)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenAI for providing the GPT API
- The conventional commits specification
- The git community for powerful version control tools

## 🐛 Bug Reports

If you discover any bugs, please create an issue [here](https://github.com/f/git-rewrite-commits/issues).

## 📮 Contact

For questions and support, please open an issue in the GitHub repository.

---

**Remember: Always backup your repository before rewriting history!** 🔒
