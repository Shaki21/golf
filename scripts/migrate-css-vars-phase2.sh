#!/bin/bash

# TIER Golf CSS Variable Migration - Phase 2
# Handles remaining AK variables

echo "🎨 TIER Golf CSS Variable Migration - Phase 2"
echo "=============================================="
echo ""

cd /Users/anderskristiansen/Developer/IUP_Master_V1

# Replace remaining CSS variables
echo "🔄 Replacing remaining CSS variables..."

find apps/web/src/features -type f \( -name "*.jsx" -o -name "*.js" -o -name "*.tsx" \) -exec perl -pi -e '
  # Surface colors
  s/var\(--ak-surface-subtle\)/rgb(var(--gray-100))/g;
  s/var\(--ak-surface-dark-elevated\)/rgb(var(--tier-navy-dark))/g;

  # Border colors
  s/var\(--ak-border-default,\s*#E5E7EB\)/rgb(var(--border-color))/g;
  s/var\(--ak-border-default\)/rgb(var(--border-color))/g;
  s/var\(--ak-border-muted\)/rgb(var(--border-muted))/g;
  s/var\(--ak-border-subtle\)/rgb(var(--border-subtle))/g;

  # Status colors
  s/var\(--ak-status-success\)/rgb(var(--status-success))/g;
  s/var\(--ak-success\)/rgb(var(--status-success))/g;
  s/var\(--ak-status-warning\)/rgb(var(--status-warning))/g;
  s/var\(--ak-warning\)/rgb(var(--status-warning))/g;
  s/var\(--ak-status-error\)/rgb(var(--status-error))/g;
  s/var\(--ak-error\)/rgb(var(--status-error))/g;
  s/var\(--ak-status-info\)/rgb(var(--status-info))/g;
  s/var\(--ak-info\)/rgb(var(--status-info))/g;

  # Session type colors (can be mapped to TIER colors or kept)
  s/var\(--ak-session-teknikk\)/rgb(var(--tier-gold))/g;
  s/var\(--ak-session-golfslag\)/rgb(var(--tier-navy))/g;
  s/var\(--ak-session-spill\)/rgb(var(--status-success))/g;

  # Achievement/accent colors
  s/var\(--ak-achievement\)/rgb(var(--tier-gold))/g;
  s/var\(--ak-accent-purple\)/rgb(139 92 246)/g;

  # Text colors with fallbacks
  s/var\(--ak-text-secondary,\s*#6B7280\)/rgb(var(--text-secondary))/g;
' {} +

echo "✅ Phase 2 complete"
echo ""

# Final count
echo "📊 Final status..."
REMAINING=$(grep -r "var(--ak-" apps/web/src/features --include="*.jsx" --include="*.js" --include="*.tsx" | wc -l | tr -d ' ')
echo "Remaining AK variables: $REMAINING"
echo ""

if [ $REMAINING -gt 0 ]; then
  echo "📋 Still remaining:"
  grep -rh "var(--ak-" apps/web/src/features --include="*.jsx" --include="*.js" --include="*.tsx" | \
    grep -o "var(--ak-[^)]*)" | sort | uniq -c | sort -rn | head -10
fi

echo ""
echo "✨ Migration Phase 2 complete!"
