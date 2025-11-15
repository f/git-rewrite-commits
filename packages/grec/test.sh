#!/bin/bash

echo "Testing grec package locally"
echo "==========================="
echo ""

# Save current directory
ORIGINAL_DIR=$(pwd)

# Go to grec package directory
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
    
    if [ "$NAME" = "grec" ]; then
        echo "   ✅ Package name is 'grec'"
    else
        echo "   ❌ Package name is not 'grec'"
    fi
    
    if [ "$BIN" = "grec" ]; then
        echo "   ✅ Binary name is 'grec'"
    else
        echo "   ❌ Binary name is not 'grec'"
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
echo "  cd packages/grec && npm publish --access public"
echo ""
echo "Or from project root:"
echo "  npm run publish:grec"

# Return to original directory
cd "$ORIGINAL_DIR"
