#!/bin/bash

# Script to publish the grc alias package to npm

set -e

echo "📦 Publishing grc package (alias for git-rewrite-commits)"
echo ""

# Change to package directory
cd "$(dirname "$0")"

# Check if logged in to npm
if ! npm whoami >/dev/null 2>&1; then
    echo "❌ Not logged in to npm. Please run: npm login"
    exit 1
fi

# Make CLI executable
chmod +x cli.js

echo "Checking package..."
npm pack --dry-run

echo ""
echo "Ready to publish grc package."
echo "This will create a short 'grc' command alias for git-rewrite-commits."
echo ""
read -p "Continue with publish? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    npm publish --access public
    echo ""
    echo "✅ Successfully published grc package!"
    echo ""
    echo "Users can now install with:"
    echo "  npm install -g grc"
    echo ""
    echo "And use the short command:"
    echo "  grc --help"
else
    echo "❌ Publish cancelled"
    exit 1
fi
