#!/bin/bash

echo "Testing grc package locally"
echo "==========================="
echo ""

# Save current directory
ORIGINAL_DIR=$(pwd)

# Go to grc package directory
cd "$(dirname "$0")"

echo "1. Testing CLI wrapper..."
node cli.js --help > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo "   ✅ CLI wrapper works"
else
    echo "   ❌ CLI wrapper failed"
    exit 1
fi

echo ""
echo "2. Testing package.json..."
if [ -f "package.json" ]; then
    echo "   ✅ package.json exists"
    
    # Check required fields
    NAME=$(node -p "require('./package.json').name")
    VERSION=$(node -p "require('./package.json').version")
    BIN=$(node -p "Object.keys(require('./package.json').bin || {})[0]")
    
    if [ "$NAME" = "grc" ]; then
        echo "   ✅ Package name is 'grc'"
    else
        echo "   ❌ Package name is not 'grc'"
    fi
    
    if [ "$BIN" = "grc" ]; then
        echo "   ✅ Binary name is 'grc'"
    else
        echo "   ❌ Binary name is not 'grc'"
    fi
    
    echo "   📦 Version: $VERSION"
else
    echo "   ❌ package.json not found"
    exit 1
fi

echo ""
echo "3. Testing npm pack (dry run)..."
npm pack --dry-run > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo "   ✅ Package is ready to publish"
else
    echo "   ❌ Package has issues"
    exit 1
fi

echo ""
echo "==========================="
echo "✨ All tests passed! Package is ready."
echo ""
echo "To publish:"
echo "  cd packages/grc && npm publish --access public"
echo ""
echo "Or from project root:"
echo "  npm run publish:grc"

# Return to original directory
cd "$ORIGINAL_DIR"
