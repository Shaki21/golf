#!/bin/bash

# Fix TypeScript import errors in frontend
cd /Users/anderskristiansen/Developer/IUP_Master_V1/apps/web

echo "Fixing PageHeader imports..."
# Fix PageHeader imports from typography to layout/PageHeader
find src/features -name "*.tsx" -type f -exec sed -i '' \
  "s|from '../../components/typography'|from '../../components/layout/PageHeader'|g" {} \;

echo "Fixing useAuth imports..."
# Fix useAuth imports to use AuthContext
find src/features -name "*.tsx" -type f -exec sed -i '' \
  "s|from '../../hooks/useAuth'|from '../../contexts/AuthContext'|g" {} \;

echo "Fixing Text variant 'caption' to 'caption1'..."
# Fix Text variant="caption" to variant="caption1"
find src/features -name "*.tsx" -type f -exec sed -i '' \
  's/variant="caption"/variant="caption1"/g' {} \;

echo "Done!"
