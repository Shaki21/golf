#!/bin/bash
# UI Canon Enforcement Script
# Fails if forbidden patterns are found in staged/changed files

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0
SRC_DIR="apps/web/src"

echo "========================================"
echo "UI Canon Check - AK Golf Academy"
echo "========================================"
echo ""

# Change to repo root if we're in apps/web
if [[ $(pwd) == */apps/web ]]; then
    cd ../..
fi

# Check 1: LOCAL tokens definitions (the forbidden pattern)
echo "Checking for local 'const tokens = {' definitions..."
LOCAL_TOKENS=$(grep -rn "^const tokens = {" --include="*.jsx" --include="*.tsx" "$SRC_DIR/features" "$SRC_DIR/components" 2>/dev/null || true)

if [ -n "$LOCAL_TOKENS" ]; then
    echo -e "${RED}ERROR: Found local 'const tokens = {' definitions:${NC}"
    echo "$LOCAL_TOKENS"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}OK: No local tokens definitions found${NC}"
fi

# Check 1b: tokens.colors.sessionTypes (invalid path that doesn't exist)
echo ""
echo "Checking for invalid token paths..."
INVALID_TOKENS=$(grep -rn "tokens\.colors\.sessionTypes\|tokens\.colors\.periods\|tokens\.colors\.areas\|tokens\.colors\.sessions" --include="*.jsx" --include="*.tsx" "$SRC_DIR" 2>/dev/null || true)

if [ -n "$INVALID_TOKENS" ]; then
    echo -e "${RED}ERROR: Found invalid token paths (not in design-tokens.js):${NC}"
    echo "$INVALID_TOKENS" | head -10
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}OK: No invalid token paths found${NC}"
fi

# Check 2: Hardcoded hex colors in JSX (style attributes)
echo ""
echo "Checking for hardcoded hex colors in style attributes..."
HEX_MATCHES=$(grep -rn "style={{.*#[0-9A-Fa-f]\{6\}" --include="*.jsx" --include="*.tsx" "$SRC_DIR/features" 2>/dev/null || true)

if [ -n "$HEX_MATCHES" ]; then
    echo -e "${YELLOW}WARNING: Found hardcoded hex colors in style attributes:${NC}"
    echo "$HEX_MATCHES" | head -10
    # Note: This is a warning, not an error, for gradual migration
else
    echo -e "${GREEN}OK: No hardcoded hex colors in style attributes${NC}"
fi

# Check 3: designTokens import in features
echo ""
echo "Checking for 'designTokens' imports in features..."
DESIGN_TOKENS_MATCHES=$(grep -rn "from.*designTokens\|import.*designTokens" --include="*.jsx" --include="*.tsx" "$SRC_DIR/features" 2>/dev/null || true)

if [ -n "$DESIGN_TOKENS_MATCHES" ]; then
    echo -e "${RED}ERROR: Found 'designTokens' imports in features:${NC}"
    echo "$DESIGN_TOKENS_MATCHES" | head -10
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}OK: No 'designTokens' imports in features${NC}"
fi

# Check 4: Inline hover handlers (basic check)
echo ""
echo "Checking for inline hover handlers..."
HOVER_MATCHES=$(grep -rn "onMouseEnter={\|onMouseLeave={" --include="*.jsx" --include="*.tsx" "$SRC_DIR/features" 2>/dev/null | grep -v "Tooltip\|Dropdown\|Menu" || true)

if [ -n "$HOVER_MATCHES" ]; then
    echo -e "${YELLOW}WARNING: Found inline hover handlers:${NC}"
    echo "$HOVER_MATCHES" | head -5
    # Note: This is a warning for gradual cleanup
else
    echo -e "${GREEN}OK: No problematic inline hover handlers${NC}"
fi

echo ""
echo "========================================"
if [ $ERRORS -gt 0 ]; then
    echo -e "${RED}UI Canon Check FAILED with $ERRORS error(s)${NC}"
    echo "See docs/UI_RULES.md for allowed patterns"
    exit 1
else
    echo -e "${GREEN}UI Canon Check PASSED${NC}"
    exit 0
fi
