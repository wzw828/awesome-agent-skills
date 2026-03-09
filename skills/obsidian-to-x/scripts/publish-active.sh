#!/bin/bash
# Publish the currently active Obsidian file to X Articles
# Usage: ./publish-active.sh

set -e

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILL_DIR="$(dirname "$SCRIPT_DIR")"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}[1/4] Getting active file from Obsidian...${NC}"

# Get vault root (current directory should be the vault)
VAULT_ROOT="$(pwd)"

# Method 1: Parse workspace.json (fast, 39x faster than CLI)
if command -v jq &> /dev/null && [ -f "$VAULT_ROOT/.obsidian/workspace.json" ]; then
    ACTIVE_FILE=$(jq -r '.lastOpenFiles[0]' "$VAULT_ROOT/.obsidian/workspace.json" 2>/dev/null)
fi

# Fallback: use Obsidian CLI if workspace.json fails
if [ -z "$ACTIVE_FILE" ] || [ ! -f "$VAULT_ROOT/$ACTIVE_FILE" ]; then
    echo -e "${YELLOW}⚠️  workspace.json method failed, using Obsidian CLI fallback...${NC}"

    if command -v obsidian &> /dev/null; then
        ACTIVE_FILE=$(obsidian recents 2>&1 | grep -v "Loading\|installer" | head -1)
    fi
fi

if [ -z "$ACTIVE_FILE" ]; then
    echo -e "${RED}Error: Could not determine active file${NC}"
    echo "Tried:"
    echo "  1. workspace.json (.obsidian/workspace.json)"
    echo "  2. Obsidian CLI (obsidian recents)"
    echo ""
    echo "Please:"
    echo "  - Make sure you have opened a file in Obsidian recently"
    echo "  - Install jq: brew install jq (macOS) or apt install jq (Linux)"
    echo "  - Or enable Obsidian CLI: Settings → General → Command line interface"
    exit 1
fi

echo -e "${GREEN}Active file: $ACTIVE_FILE${NC}"
FULL_PATH="$VAULT_ROOT/$ACTIVE_FILE"

if [ ! -f "$FULL_PATH" ]; then
    echo -e "${RED}Error: File not found: $FULL_PATH${NC}"
    exit 1
fi

echo -e "${GREEN}[2/4] Cleaning Chrome CDP processes...${NC}"
pkill -f "Chrome.*remote-debugging-port" 2>/dev/null || true
pkill -f "Chromium.*remote-debugging-port" 2>/dev/null || true
sleep 2

echo -e "${GREEN}[3/4] Converting Obsidian syntax to X format...${NC}"
mkdir -p "$VAULT_ROOT/Temp"
bun "$SKILL_DIR/scripts/obsidian-to-article.ts" "$ACTIVE_FILE" "$VAULT_ROOT/Temp/converted.md"

echo -e "${GREEN}[4/4] Publishing to X Articles...${NC}"
bun "$SKILL_DIR/scripts/x-article.ts" "$VAULT_ROOT/Temp/converted.md"

echo -e "${GREEN}✅ Done! Review and publish in the browser window.${NC}"
