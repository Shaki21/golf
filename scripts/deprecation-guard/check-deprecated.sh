#!/bin/bash
#
# Deprecation Guard - Prevents NEW references to deprecated functions
#
# Usage: ./scripts/deprecation-guard/check-deprecated.sh
#
# Exit codes:
#   0 - No new deprecated function usage found
#   1 - New deprecated function usage detected
#
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
BASELINE_FILE="$SCRIPT_DIR/baseline.txt"

# Deprecated functions to check
DEPRECATED_FUNCTIONS=(
  "approximateSkillLevelFromPlayerCategory"
)

echo "=== Deprecation Guard ==="
echo ""

# Build search pattern
PATTERN=$(IFS="|"; echo "${DEPRECATED_FUNCTIONS[*]}")

# Find all occurrences (excluding test files, node_modules, build artifacts)
CURRENT_REFS=$(grep -rn --include="*.ts" --include="*.tsx" \
  --exclude-dir=node_modules \
  --exclude-dir=dist \
  --exclude-dir=build \
  --exclude="*.test.ts" \
  --exclude="*.test.tsx" \
  -E "$PATTERN" "$REPO_ROOT/apps" 2>/dev/null || true)

# Count current occurrences
CURRENT_COUNT=$(echo "$CURRENT_REFS" | grep -c "$PATTERN" 2>/dev/null || echo 0)

# Get baseline count (or 0 if no baseline)
if [ -f "$BASELINE_FILE" ]; then
  BASELINE_COUNT=$(wc -l < "$BASELINE_FILE" | tr -d ' ')
else
  echo "No baseline found. Run with --update-baseline to create one."
  BASELINE_COUNT=0
fi

echo "Deprecated function references:"
echo "  Baseline: $BASELINE_COUNT"
echo "  Current:  $CURRENT_COUNT"
echo ""

# Check for new occurrences
if [ "$CURRENT_COUNT" -gt "$BASELINE_COUNT" ]; then
  echo "ERROR: New deprecated function usage detected!"
  echo ""
  echo "New references found:"
  echo "$CURRENT_REFS"
  echo ""
  echo "Please remove these references and use the recommended alternative:"
  echo "  - approximateSkillLevelFromPlayerCategory: Fetch UISkillLevel from player profile API"
  echo ""
  exit 1
fi

# Handle baseline update
if [ "${1:-}" = "--update-baseline" ]; then
  echo "$CURRENT_REFS" > "$BASELINE_FILE"
  echo "Baseline updated to $CURRENT_COUNT references."
fi

echo "PASS: No new deprecated function usage."
exit 0
