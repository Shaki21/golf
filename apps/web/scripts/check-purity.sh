#!/bin/bash
# check-purity.sh - Enforce purity rules for domain/**/*.ts
#
# This script fails CI if any non-pure patterns are found in domain logic files.
# Test files (*.test.ts) are excluded since they may need impure setup code.
#
# Checks directories that have a .purity-rules file:
#   - apps/web/src/domain/tests
#   - apps/web/src/domain/goals
#
# ALLOWED patterns:
#   - new Date(dateString) - parsing a date string is pure/deterministic
#   - Comments mentioning forbidden patterns
#
# FORBIDDEN patterns:
#   - new Date() - no-argument call depends on current time
#   - Date.now() - depends on current time
#   - Math.random() - non-deterministic
#   - I/O: fetch, localStorage, sessionStorage, XMLHttpRequest
#   - Browser globals: window, document, navigator
#   - Side effects: console.log/warn/error, setTimeout, setInterval
#   - process.env - use dependency injection

set -e

# Directories with purity constraints
DOMAIN_DIRS=(
  "apps/web/src/domain/tests"
  "apps/web/src/domain/goals"
)

ERRORS_FOUND=0
FILES=""

# Change to repo root
cd "$(dirname "$0")/../../.."

echo "=== Purity Check for Domain Modules ==="
echo ""

# Collect files from all domain directories
for dir in "${DOMAIN_DIRS[@]}"; do
  if [ -d "$dir" ]; then
    DIR_FILES=$(find "$dir" -name "*.ts" ! -name "*.test.ts" 2>/dev/null || true)
    if [ -n "$DIR_FILES" ]; then
      FILES="$FILES"$'\n'"$DIR_FILES"
    fi
  fi
done

# Remove leading newline
FILES=$(echo "$FILES" | sed '/^$/d')

if [ -z "$FILES" ]; then
  echo "No source files found in domain directories"
  exit 0
fi

# Check for Date.now() - always forbidden
check_date_now() {
  local matches
  # Exclude comment lines (lines starting with * or //)
  matches=$(echo "$FILES" | xargs grep -n "Date\.now()" 2>/dev/null | grep -v "^\s*//" | grep -v ":\s*\*" | grep -v ":\s*//" || true)

  if [ -n "$matches" ]; then
    echo "❌ FORBIDDEN: Date.now() - use injected time parameter"
    echo "$matches" | while read -r line; do
      echo "   $line"
    done
    echo ""
    return 1
  fi
  return 0
}

# Check for new Date() WITHOUT arguments - forbidden
# new Date(something) WITH arguments is allowed (parsing is pure)
check_new_date_no_args() {
  local matches
  # Match "new Date()" but not "new Date(something)"
  # Exclude comment lines
  matches=$(echo "$FILES" | xargs grep -n "new Date()" 2>/dev/null | grep -v "new Date([^)]" | grep -v ":\s*\*" | grep -v ":\s*//" || true)

  if [ -n "$matches" ]; then
    echo "❌ FORBIDDEN: new Date() without arguments - pass Date as parameter"
    echo "$matches" | while read -r line; do
      echo "   $line"
    done
    echo ""
    return 1
  fi
  return 0
}

# Generic pattern checker for simple patterns
check_pattern() {
  local pattern="$1"
  local description="$2"

  local matches
  # Exclude comment lines (lines with leading * or //)
  matches=$(echo "$FILES" | xargs grep -n "$pattern" 2>/dev/null | grep -v ":\s*\*" | grep -v ":\s*//" || true)

  if [ -n "$matches" ]; then
    echo "❌ FORBIDDEN: $description"
    echo "$matches" | while read -r line; do
      echo "   $line"
    done
    echo ""
    return 1
  fi
  return 0
}

echo "Checking files:"
echo "$FILES" | while read -r f; do echo "  - $f"; done
echo ""

# Date checks (specialized)
check_date_now || ERRORS_FOUND=1
check_new_date_no_args || ERRORS_FOUND=1

# Other forbidden patterns
check_pattern "Math\.random()" "Math.random() - use injected random function" || ERRORS_FOUND=1
check_pattern "localStorage" "localStorage - pure functions cannot access storage" || ERRORS_FOUND=1
check_pattern "sessionStorage" "sessionStorage - pure functions cannot access storage" || ERRORS_FOUND=1
check_pattern "window\." "window.* - pure functions cannot access globals" || ERRORS_FOUND=1
check_pattern "document\." "document.* - pure functions cannot access DOM" || ERRORS_FOUND=1
check_pattern "navigator\." "navigator.* - pure functions cannot access browser APIs" || ERRORS_FOUND=1
check_pattern "console\.log" "console.log - pure functions have no side effects" || ERRORS_FOUND=1
check_pattern "console\.warn" "console.warn - pure functions have no side effects" || ERRORS_FOUND=1
check_pattern "console\.error" "console.error - pure functions have no side effects" || ERRORS_FOUND=1
check_pattern "fetch(" "fetch() - pure functions cannot do I/O" || ERRORS_FOUND=1
check_pattern "XMLHttpRequest" "XMLHttpRequest - pure functions cannot do I/O" || ERRORS_FOUND=1
check_pattern "setTimeout" "setTimeout - pure functions cannot schedule async work" || ERRORS_FOUND=1
check_pattern "setInterval" "setInterval - pure functions cannot schedule async work" || ERRORS_FOUND=1
check_pattern "process\.env" "process.env - use dependency injection for config" || ERRORS_FOUND=1

if [ "$ERRORS_FOUND" -eq 1 ]; then
  echo "=== PURITY CHECK FAILED ==="
  echo ""
  echo "Pure functions must be:"
  echo "  - Deterministic: same inputs → same outputs"
  echo "  - Side-effect free: no I/O, no logging, no global state"
  echo "  - Time-independent: no Date.now(), new Date() without arguments"
  echo ""
  echo "See .purity-rules files in domain directories for guidance."
  exit 1
fi

echo "✅ All purity checks passed!"
exit 0
