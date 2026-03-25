#!/bin/bash

# AK Golf Academy - Color Migration Script
# Updates all components from Forest theme to Blue Palette 01

# Color mapping (old → new)
# Forest Green → Primary Blue
# Foam → Snow
# Ivory → Surface

echo "🎨 Starting color migration to Blue Palette 01..."
echo ""

# Find all JSX/JS files in src directory
SRC_DIR="./src"

# Count files to update
TOTAL_FILES=$(find "$SRC_DIR" -type f \( -name "*.jsx" -o -name "*.js" \) | wc -l | tr -d ' ')
echo "📁 Found $TOTAL_FILES files to scan"
echo ""

# Replace old forest green (#1A3D2E) with primary blue (#10456A)
echo "1️⃣  Replacing Forest Green (#1A3D2E) → Primary Blue (#10456A)..."
find "$SRC_DIR" -type f \( -name "*.jsx" -o -name "*.js" \) -exec sed -i '' 's/#1A3D2E/##PRIMARY##/g' {} \;
find "$SRC_DIR" -type f \( -name "*.jsx" -o -name "*.js" \) -exec sed -i '' 's/##PRIMARY##/#10456A/g' {} \;

# Replace lighter forest green (#2D5A45) with primaryLight (#2C5F7F)
echo "2️⃣  Replacing Forest Light (#2D5A45) → Primary Light (#2C5F7F)..."
find "$SRC_DIR" -type f \( -name "*.jsx" -o -name "*.js" \) -exec sed -i '' 's/#2D5A45/##PRIMARYLIGHT##/g' {} \;
find "$SRC_DIR" -type f \( -name "*.jsx" -o -name "*.js" \) -exec sed -i '' 's/##PRIMARYLIGHT##/#2C5F7F/g' {} \;

# Replace dark green (#0E3A2F) with primary blue (#10456A)
echo "3️⃣  Replacing Dark Forest (#0E3A2F) → Primary Blue (#10456A)..."
find "$SRC_DIR" -type f \( -name "*.jsx" -o -name "*.js" \) -exec sed -i '' 's/#0E3A2F/##PRIMARYDARK##/g' {} \;
find "$SRC_DIR" -type f \( -name "*.jsx" -o -name "*.js" \) -exec sed -i '' 's/##PRIMARYDARK##/#10456A/g' {} \;

# Replace foam (#F5F7F6) with snow (#EDF0F2)
echo "4️⃣  Replacing Foam (#F5F7F6) → Snow (#EDF0F2)..."
find "$SRC_DIR" -type f \( -name "*.jsx" -o -name "*.js" \) -exec sed -i '' 's/#F5F7F6/##SNOW##/g' {} \;
find "$SRC_DIR" -type f \( -name "*.jsx" -o -name "*.js" \) -exec sed -i '' 's/##SNOW##/#EDF0F2/g' {} \;

# Replace ivory (#FDFCF8) with surface (#EBE5DA)
echo "5️⃣  Replacing Ivory (#FDFCF8) → Surface (#EBE5DA)..."
find "$SRC_DIR" -type f \( -name "*.jsx" -o -name "*.js" \) -exec sed-i '' 's/#FDFCF8/##SURFACE##/g' {} \;
find "$SRC_DIR" -type f \( -name "*.jsx" -o -name "*.js" \) -exec sed -i '' 's/##SURFACE##/#EBE5DA/g' {} \;

# Replace tokens.colors.forest with tokens.colors.primary
echo "6️⃣  Replacing tokens.colors.forest → tokens.colors.primary..."
find "$SRC_DIR" -type f \( -name "*.jsx" -o -name "*.js" \) -exec sed -i '' 's/tokens\.colors\.forest\b/tokens.colors.primary/g' {} \;

# Replace tokens.colors.forestLight with tokens.colors.primaryLight
echo "7️⃣  Replacing tokens.colors.forestLight → tokens.colors.primaryLight..."
find "$SRC_DIR" -type f \( -name "*.jsx" -o -name "*.js" \) -exec sed -i '' 's/tokens\.colors\.forestLight/tokens.colors.primaryLight/g' {} \;

# Replace tokens.colors.foam with tokens.colors.snow
echo "8️⃣  Replacing tokens.colors.foam → tokens.colors.snow..."
find "$SRC_DIR" -type f \( -name "*.jsx" -o -name "*.js" \) -exec sed -i '' 's/tokens\.colors\.foam\b/tokens.colors.snow/g' {} \;

# Replace tokens.colors.ivory with tokens.colors.surface
echo "9️⃣  Replacing tokens.colors.ivory → tokens.colors.surface..."
find "$SRC_DIR" -type f \( -name "*.jsx" -o -name "*.js" \) -exec sed -i '' 's/tokens\.colors\.ivory\b/tokens.colors.surface/g' {} \;

echo ""
echo "✅ Color migration complete!"
echo ""
echo "📊 Summary:"
echo "   ✓ Forest Green → Primary Blue"
echo "   ✓ Foam → Snow"
echo "   ✓ Ivory → Surface"
echo "   ✓ Updated token references"
echo ""
echo "🔍 Next steps:"
echo "   1. Review changes: git diff"
echo "   2. Test the app: npm start"
echo "   3. Commit changes: git add . && git commit -m 'feat: migrate to Blue Palette 01'"
echo ""
