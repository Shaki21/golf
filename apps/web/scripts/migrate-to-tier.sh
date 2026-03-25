#!/bin/bash
# TIER Golf Migration Script
# Erstatter automatisk hardkodede farger og legacy patterns med TIER tokens

set -e

echo "🔄 TIER Golf - Automatisk Migrasjon"
echo "====================================="
echo ""

SRC_DIR="src"
BACKUP_DIR="backup_$(date +%Y%m%d_%H%M%S)"

# Opprett backup
echo "📦 Oppretter backup til $BACKUP_DIR..."
mkdir -p "$BACKUP_DIR"
cp -r "$SRC_DIR" "$BACKUP_DIR/"
echo "✅ Backup opprettet"
echo ""

# Teller for endringer
TOTAL_CHANGES=0

# Funksjon for å erstatte i filer
replace_in_files() {
  local pattern=$1
  local replacement=$2
  local description=$3

  echo "🔍 $description..."

  # Finn og erstatt
  local count=$(find "$SRC_DIR" -type f \( -name "*.jsx" -o -name "*.tsx" -o -name "*.js" -o -name "*.ts" -o -name "*.css" \) \
    ! -path "*/ui/lab/*" \
    ! -name "design-tokens.js" \
    -exec grep -l "$pattern" {} \; 2>/dev/null | wc -l | tr -d ' ')

  if [ "$count" -gt 0 ]; then
    find "$SRC_DIR" -type f \( -name "*.jsx" -o -name "*.tsx" -o -name "*.js" -o -name "*.ts" -o -name "*.css" \) \
      ! -path "*/ui/lab/*" \
      ! -name "design-tokens.js" \
      -exec sed -i '' "s/$pattern/$replacement/g" {} \;

    echo "   ✅ Erstattet i $count filer"
    TOTAL_CHANGES=$((TOTAL_CHANGES + count))
  else
    echo "   ℹ️  Ingen treff"
  fi
}

# 1. FJERN HARDKODEDE HEX-FARGER (vanlige TIER farger)
echo "1️⃣  Erstatter hardkodede hex-farger med TIER tokens"
echo "----------------------------------------------------"

# TIER Navy
replace_in_files "#0A2540" "rgb(var(--tier-navy))" "TIER Navy (#0A2540)"
replace_in_files "#0D3050" "rgb(var(--tier-navy-light))" "TIER Navy Light"
replace_in_files "#061829" "rgb(var(--tier-navy-dark))" "TIER Navy Dark"

# TIER Gold
replace_in_files "#C9A227" "rgb(var(--tier-gold))" "TIER Gold"
replace_in_files "#D4B545" "rgb(var(--tier-gold-light))" "TIER Gold Light"
replace_in_files "#A8871F" "rgb(var(--tier-gold-dark))" "TIER Gold Dark"

# White/Surface
replace_in_files "#FFFFFF" "rgb(var(--tier-white))" "White"
replace_in_files "#F8FAFC" "rgb(var(--surface-secondary))" "Surface Secondary"

# Status colors
replace_in_files "#16A34A" "rgb(var(--status-success))" "Success Green"
replace_in_files "#D97706" "rgb(var(--status-warning))" "Warning Orange"
replace_in_files "#DC2626" "rgb(var(--status-error))" "Error Red"
replace_in_files "#2563EB" "rgb(var(--status-info))" "Info Blue"

echo ""

# 2. ERSTATT RGB() FARGER MED VAR() REFERANSER
echo "2️⃣  Erstatter rgb() med var() referanser"
echo "------------------------------------------"

# Dette er mer komplekst, så vi gjør bare noen vanlige mønstre
replace_in_files "rgb(10 37 64)" "rgb(var(--tier-navy))" "RGB Navy"
replace_in_files "rgb(201 162 39)" "rgb(var(--tier-gold))" "RGB Gold"
replace_in_files "rgb(255 255 255)" "rgb(var(--tier-white))" "RGB White"

echo ""

# 3. FJERN EMOJIS (erstatt med kommentarer eller fjern helt)
echo "3️⃣  Fjerner emojis fra UI"
echo "-------------------------"

# Denne må gjøres forsiktig - vi erstatter kun i åpenbare UI-contexts
# For nå, logg bare hvor de er
EMOJI_COUNT=$(grep -r "🔥\|⚡\|✨\|🎯\|🏆\|📊\|💪\|⭐" "$SRC_DIR" \
  --include="*.jsx" \
  --include="*.tsx" \
  ! -path "*/ui/lab/*" \
  2>/dev/null | wc -l | tr -d ' ')

if [ "$EMOJI_COUNT" -gt 0 ]; then
  echo "   ⚠️  Fant $EMOJI_COUNT emojis - må fjernes manuelt"
else
  echo "   ✅ Ingen emojis funnet"
fi

echo ""

# 4. FJERN AK GOLF ACADEMY KOMMENTARER
echo "4️⃣  Fjerner AK Golf Academy kommentarer"
echo "----------------------------------------"

# Erstatt AK GOLF ACADEMY kommentarer med TIER GOLF
find "$SRC_DIR" -type f \( -name "*.jsx" -o -name "*.tsx" -o -name "*.js" -o -name "*.ts" \) \
  ! -path "*/ui/lab/*" \
  ! -name "*Landing*" \
  -exec sed -i '' 's/AK GOLF ACADEMY/TIER GOLF/g' {} \; 2>/dev/null || true

find "$SRC_DIR" -type f \( -name "*.jsx" -o -name "*.tsx" -o -name "*.js" -o -name "*.ts" \) \
  ! -path "*/ui/lab/*" \
  ! -name "*Landing*" \
  -exec sed -i '' 's/AK Golf Academy/TIER Golf/g' {} \; 2>/dev/null || true

echo "   ✅ AK Golf Academy kommentarer erstattet med TIER Golf"

echo ""

# 5. OPPSUMMERING
echo "====================================="
echo "✅ Migrasjon fullført!"
echo ""
echo "📊 Statistikk:"
echo "   - Backup: $BACKUP_DIR/src"
echo "   - Filer endret: ~$TOTAL_CHANGES"
echo ""
echo "🔍 Neste steg:"
echo "   1. Kjør: npm run build"
echo "   2. Test applikasjonen"
echo "   3. Kjør: ./scripts/check-design-system.sh"
echo ""
echo "⚠️  Manuelt arbeid gjenstår:"
echo "   - Fjern emojis ($EMOJI_COUNT funnet)"
echo "   - Sjekk komplekse rgb()/hsl() farger"
echo "   - Verifiser AK Golf Academy på landing-side"
echo ""
