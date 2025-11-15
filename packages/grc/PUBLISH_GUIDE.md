# Publishing the grc Package

The `grc` package is a short alias for `git-rewrite-commits` that provides the `grc` command.

## Prerequisites

1. **npm account**: You need to be logged in to npm
   ```bash
   npm login
   ```

2. **Permissions**: You need publish permissions for the `grc` package name

## Publishing Steps

### Option 1: Using the publish script
```bash
cd packages/grc
./publish.sh
```

### Option 2: Using npm directly
```bash
cd packages/grc
npm publish --access public
```

### Option 3: From project root
```bash
npm run publish:grc
```

## Testing Before Publishing

Run the test script to verify everything is ready:
```bash
./packages/grc/test.sh
```

## Version Management

The `grc` package version should match the main `git-rewrite-commits` version.

To update version:
1. Edit `packages/grc/package.json`
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
npm install -g grc
```

And use:
```bash
grc --help
grc --staged
grc --install-hooks
# etc...
```

## Important Notes

- The `grc` package depends on `git-rewrite-commits` being available
- It will use the local version if found, otherwise falls back to npx
- The package is just a thin wrapper/alias for convenience
