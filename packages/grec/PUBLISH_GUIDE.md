# Publishing the grec Package

The `grec` package is a short alias for `git-rewrite-commits` that provides the `grec` command.

## Prerequisites

1. **npm account**: You need to be logged in to npm
   ```bash
   npm login
   ```

2. **Permissions**: You need publish permissions for the `grec` package name

## Publishing Steps

### Option 1: Using the publish script
```bash
cd packages/grec
./publish.sh
```

### Option 2: Using npm directly
```bash
cd packages/grec
npm publish --access public
```

### Option 3: From project root
```bash
npm run publish:grec
```

## Testing Before Publishing

Run the test script to verify everything is ready:
```bash
./packages/grec/test.sh
```

## Version Management

The `grec` package version should match the main `git-rewrite-commits` version.

To update version:
1. Edit `packages/grec/package.json`
2. Update the `version` field
3. Update the `git-rewrite-commits` dependency version if needed

## What Gets Published

- `cli.js` - The CLI wrapper that forwards to git-rewrite-commits
- `package.json` - Package metadata
- `README.md` - Package documentation
- `.npmignore` controls what's excluded

## After Publishing

Users can install with:
```bash
npm install -g grec
```

And use:
```bash
grec --help
grec --staged
grec --install-hooks
# etc...
```

## Important Notes

- The `grec` package depends on `git-rewrite-commits` being available
- It will use the local version if found, otherwise falls back to npx
- The package is just a thin wrapper/alias for convenience
