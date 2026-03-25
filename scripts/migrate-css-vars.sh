#!/bin/bash

# TIER Golf CSS Variable Migration Script
# Replaces old AK CSS variables with TIER variables

echo "🎨 TIER Golf CSS Variable Migration"
echo "===================================="
echo ""

cd /Users/anderskristiansen/Developer/IUP_Master_V1

# Count current usage
echo "📊 Analyzing CSS variable usage..."
TOTAL=$(grep -r "var(--ak-" apps/web/src/features --include="*.jsx" --include="*.js" --include="*.tsx" | wc -l | tr -d ' ')
echo "Found $TOTAL CSS variable occurrences"
echo ""

# Replace CSS variables
echo "🔄 Replacing CSS variables..."

find apps/web/src/features -type f \( -name "*.jsx" -o -name "*.js" -o -name "*.tsx" \) -exec perl -pi -e '
  s/var\(--ak-primary-dark\)/var(--tier-navy-dark)/g;
  s/var\(--ak-primary-light\)/var(--tier-navy-light)/g;
  s/var\(--ak-primary\)/var(--tier-navy)/g;
  s/var\(--ak-gold-dark\)/var(--tier-gold-dark)/g;
  s/var\(--ak-gold-light\)/var(--tier-gold-light)/g;
  s/var\(--ak-gold\)/var(--tier-gold)/g;
  s/var\(--ak-text-primary\)/var(--tier-navy)/g;
  s/var\(--ak-text-secondary\)/var(--text-secondary)/g;
  s/var\(--ak-text-tertiary\)/var(--text-tertiary)/g;
  s/var\(--ak-text-muted\)/var(--text-muted)/g;
  s/var\(--ak-border\)/var(--border-color)/g;
  s/var\(--ak-surface-card\)/var(--surface-card)/g;
  s/var\(--ak-surface-base\)/var(--surface-base)/g;
  s/var\(--success\)/var(--status-success)/g;
  s/var\(--warning\)/var(--status-warning)/g;
  s/var\(--error\)/var(--status-error)/g;
' {} +

echo "✅ CSS variable replacement complete"
echo ""

# Count after
echo "📊 After migration..."
REMAINING=$(grep -r "var(--ak-" apps/web/src/features --include="*.jsx" --include="*.js" --include="*.tsx" | wc -l | tr -d ' ')
MIGRATED=$((TOTAL - REMAINING))
PERCENT=$((MIGRATED * 100 / TOTAL))

echo "Migrated: $MIGRATED occurrences ($PERCENT%)"
echo "Remaining: $REMAINING occurrences"
echo ""

if [ $REMAINING -gt 0 ]; then
  echo "📋 Remaining AK variables:"
  grep -rh "var(--ak-" apps/web/src/features --include="*.jsx" --include="*.js" --include="*.tsx" | \
    grep -o "var(--ak-[^)]*)" | sort | uniq -c | sort -rn | head -20
  echo ""
fi

echo "✨ Migration complete!"
