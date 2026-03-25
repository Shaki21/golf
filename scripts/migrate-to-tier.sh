#!/bin/bash

# TIER Golf Design System Migration Script
# Systematically replaces old AK tokens with TIER tokens

echo "🎨 TIER Golf Migration Script"
echo "=============================="
echo ""

# Count current usage
echo "📊 Analyzing current usage..."
TOTAL_FILES=$(grep -r "bg-ak-\|text-ak-\|border-ak-" apps/web/src/features --include="*.jsx" --include="*.js" --include="*.tsx" | wc -l | tr -d ' ')
echo "Found $TOTAL_FILES token occurrences"
echo ""

# Backup
echo "💾 Creating backup..."
BACKUP_DIR="backups/tier-migration-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"
cp -r apps/web/src/features "$BACKUP_DIR/"
echo "Backup created: $BACKUP_DIR"
echo ""

# Token replacements
echo "🔄 Replacing tokens..."

# Background colors
find apps/web/src/features -type f \( -name "*.jsx" -o -name "*.js" -o -name "*.tsx" \) -exec sed -i '' \
  -e 's/bg-ak-primary\b/bg-tier-navy/g' \
  -e 's/bg-ak-primary-dark\b/bg-tier-navy-dark/g' \
  -e 's/bg-ak-primary-light\b/bg-tier-navy-light/g' \
  -e 's/bg-ak-gold\b/bg-tier-gold/g' \
  -e 's/bg-ak-gold-light\b/bg-tier-gold-light/g' \
  -e 's/bg-ak-surface-base\b/bg-gray-50/g' \
  -e 's/bg-ak-surface-card\b/bg-white/g' \
  -e 's/bg-ak-surface-subtle\b/bg-gray-100/g' \
  {} +

# Text colors
find apps/web/src/features -type f \( -name "*.jsx" -o -name "*.js" -o -name "*.tsx" \) -exec sed -i '' \
  -e 's/text-ak-primary\b/text-tier-navy/g' \
  -e 's/text-ak-gold\b/text-tier-gold/g' \
  -e 's/text-ak-text-primary\b/text-tier-navy/g' \
  -e 's/text-ak-text-secondary\b/text-text-secondary/g' \
  -e 's/text-ak-text-tertiary\b/text-text-tertiary/g' \
  -e 's/text-ak-text-muted\b/text-text-muted/g' \
  {} +

# Border colors
find apps/web/src/features -type f \( -name "*.jsx" -o -name "*.js" -o -name "*.tsx" \) -exec sed -i '' \
  -e 's/border-ak-primary\b/border-tier-navy/g' \
  -e 's/border-ak-gold\b/border-tier-gold/g' \
  -e 's/border-ak-border\b/border-gray-200/g' \
  -e 's/border-ak-border-muted\b/border-gray-100/g' \
  {} +

# Hover states
find apps/web/src/features -type f \( -name "*.jsx" -o -name "*.js" -o -name "*.tsx" \) -exec sed -i '' \
  -e 's/hover:bg-ak-primary\b/hover:bg-tier-navy/g' \
  -e 's/hover:bg-ak-gold\b/hover:bg-tier-gold/g' \
  -e 's/hover:text-ak-primary\b/hover:text-tier-navy/g' \
  {} +

# Status colors
find apps/web/src/features -type f \( -name "*.jsx" -o -name "*.js" -o -name "*.tsx" \) -exec sed -i '' \
  -e 's/bg-ak-status-success\b/bg-status-success/g' \
  -e 's/bg-ak-status-warning\b/bg-status-warning/g' \
  -e 's/bg-ak-status-error\b/bg-status-error/g' \
  -e 's/text-ak-status-success\b/text-status-success/g' \
  -e 's/text-ak-status-warning\b/text-status-warning/g' \
  -e 's/text-ak-status-error\b/text-status-error/g' \
  {} +

echo "✅ Token replacement complete"
echo ""

# Count after
echo "📊 After migration..."
REMAINING_FILES=$(grep -r "bg-ak-\|text-ak-\|border-ak-" apps/web/src/features --include="*.jsx" --include="*.js" --include="*.tsx" | wc -l | tr -d ' ')
MIGRATED=$((TOTAL_FILES - REMAINING_FILES))
echo "Migrated: $MIGRATED occurrences"
echo "Remaining: $REMAINING_FILES occurrences"
echo ""

echo "✨ Migration complete!"
echo ""
echo "Next steps:"
echo "1. Test the application"
echo "2. Fix any remaining manual tokens"
echo "3. Update components to use TIER components"
echo ""
echo "Backup location: $BACKUP_DIR"
