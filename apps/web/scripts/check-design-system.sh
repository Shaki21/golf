#!/bin/bash
# TIER Golf Design System - Nulltoleranse Design Checker
# Blokkerer alle legacy design patterns fra å komme inn i kodebasen

set -e

echo "🔍 TIER Golf Design System - Nulltoleranse Sjekk"
echo "=================================================="

ERRORS=0
SRC_DIR="src"

# Farger for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Sjekk hardkodede hex-farger (unntatt SVG paths og ikke-stil-relatert)
echo ""
echo "1️⃣  Sjekker hardkodede hex-farger (#)..."
HEX_MATCHES=$(grep -r "#[0-9A-Fa-f]\{6\}" $SRC_DIR \
  --include="*.jsx" \
  --include="*.tsx" \
  --include="*.js" \
  --include="*.ts" \
  --include="*.css" \
  --exclude-dir="ui/lab" \
  --exclude="design-tokens.js" \
  2>/dev/null | \
  grep -v "^Binary" | \
  grep -v "// Allowed:" | \
  grep -v "path d=" || true)

if [ ! -z "$HEX_MATCHES" ]; then
  echo -e "${RED}❌ FEIL: Fant hardkodede hex-farger:${NC}"
  echo "$HEX_MATCHES" | head -20
  ERRORS=$((ERRORS + 1))
else
  echo -e "${GREEN}✅ Ingen hardkodede hex-farger funnet${NC}"
fi

# 2. Sjekk rgb() farger (unntatt var() referanser)
echo ""
echo "2️⃣  Sjekker rgb() farger..."
RGB_MATCHES=$(grep -r "rgb(" $SRC_DIR \
  --include="*.jsx" \
  --include="*.tsx" \
  --include="*.js" \
  --include="*.ts" \
  --include="*.css" \
  --exclude-dir="ui/lab" \
  2>/dev/null | \
  grep -v "rgb(var(" | \
  grep -v "^Binary" || true)

if [ ! -z "$RGB_MATCHES" ]; then
  echo -e "${RED}❌ FEIL: Fant rgb() farger (bruk CSS-variabler i stedet):${NC}"
  echo "$RGB_MATCHES" | head -20
  ERRORS=$((ERRORS + 1))
else
  echo -e "${GREEN}✅ Ingen rgb() farger funnet${NC}"
fi

# 3. Sjekk hsl() farger
echo ""
echo "3️⃣  Sjekker hsl() farger..."
HSL_MATCHES=$(grep -r "hsl(" $SRC_DIR \
  --include="*.jsx" \
  --include="*.tsx" \
  --include="*.js" \
  --include="*.ts" \
  --include="*.css" \
  --exclude-dir="ui/lab" \
  2>/dev/null | \
  grep -v "^Binary" || true)

if [ ! -z "$HSL_MATCHES" ]; then
  echo -e "${RED}❌ FEIL: Fant hsl() farger (bruk CSS-variabler i stedet):${NC}"
  echo "$HSL_MATCHES" | head -20
  ERRORS=$((ERRORS + 1))
else
  echo -e "${GREEN}✅ Ingen hsl() farger funnet${NC}"
fi

# 4. Sjekk emojis i UI-kode (ikke i kommentarer eller strenger for innhold)
echo ""
echo "4️⃣  Sjekker emojis i UI..."
EMOJI_MATCHES=$(grep -r "🔥\|⚡\|✨\|🎯\|🏆\|📊\|💪\|⭐\|🎉\|🌟" $SRC_DIR \
  --include="*.jsx" \
  --include="*.tsx" \
  --include="*.js" \
  --include="*.ts" \
  --exclude-dir="ui/lab" \
  2>/dev/null | \
  grep -v "// Emoji allowed:" | \
  grep -v "^Binary" || true)

if [ ! -z "$EMOJI_MATCHES" ]; then
  echo -e "${YELLOW}⚠️  ADVARSEL: Fant emojis i UI-kode:${NC}"
  echo "$EMOJI_MATCHES" | head -15
  echo -e "${YELLOW}   Vurder å erstatte med ikoner fra Lucide${NC}"
  # Ikke øk ERRORS, bare advarsel for nå
else
  echo -e "${GREEN}✅ Ingen emojis funnet${NC}"
fi

# 5. Sjekk AK Golf Academy-referanser (unntatt landing-side)
echo ""
echo "5️⃣  Sjekker 'AK Golf Academy' referanser..."
AKGA_MATCHES=$(grep -ri "AK Golf Academy\|AKGA\|AK GOLF ACADEMY" $SRC_DIR \
  --include="*.jsx" \
  --include="*.tsx" \
  --include="*.js" \
  --include="*.ts" \
  --exclude="*Landing*" \
  --exclude-dir="ui/lab" \
  2>/dev/null | \
  grep -v "// Legacy:" | \
  grep -v "^Binary" || true)

if [ ! -z "$AKGA_MATCHES" ]; then
  echo -e "${RED}❌ FEIL: Fant 'AK Golf Academy' referanser (kun tillatt på landing):${NC}"
  echo "$AKGA_MATCHES" | head -15
  ERRORS=$((ERRORS + 1))
else
  echo -e "${GREEN}✅ Ingen ulovlige AKGA-referanser funnet${NC}"
fi

# 6. Sjekk legacy --ak-* tokens (ikke --ak-action-*, --ak-surface-*, osv som er semantic)
echo ""
echo "6️⃣  Sjekker legacy --ak-* tokens..."
LEGACY_AK_MATCHES=$(grep -r "var(--ak-primary)\|var(--ak-forest)\|var(--ak-gold)\|var(--ak-ink)" $SRC_DIR \
  --include="*.jsx" \
  --include="*.tsx" \
  --include="*.js" \
  --include="*.ts" \
  --include="*.css" \
  --exclude="index.css" \
  2>/dev/null | \
  grep -v "^Binary" || true)

if [ ! -z "$LEGACY_AK_MATCHES" ]; then
  echo -e "${YELLOW}⚠️  ADVARSEL: Fant legacy --ak-* tokens (bør migreres til --tier-*):${NC}"
  echo "$LEGACY_AK_MATCHES" | head -15
  # Ikke øk ERRORS ennå, dette er en overgangsperiode
else
  echo -e "${GREEN}✅ Ingen legacy --ak-* tokens funnet${NC}"
fi

# 7. Sjekk for design-tokens.js import
echo ""
echo "7️⃣  Sjekker design-tokens.js importer..."
DESIGN_TOKENS_IMPORT=$(grep -r "from.*design-tokens" $SRC_DIR \
  --include="*.jsx" \
  --include="*.tsx" \
  --include="*.js" \
  --include="*.ts" \
  2>/dev/null || true)

if [ ! -z "$DESIGN_TOKENS_IMPORT" ]; then
  echo -e "${RED}❌ FEIL: Fant design-tokens.js importer (skal ikke brukes):${NC}"
  echo "$DESIGN_TOKENS_IMPORT"
  ERRORS=$((ERRORS + 1))
else
  echo -e "${GREEN}✅ Ingen design-tokens.js importer funnet${NC}"
fi

echo ""
echo "=================================================="
if [ $ERRORS -eq 0 ]; then
  echo -e "${GREEN}✅ TIER Golf Design System: Alle sjekker passert!${NC}"
  exit 0
else
  echo -e "${RED}❌ TIER Golf Design System: $ERRORS kritiske feil funnet${NC}"
  echo ""
  echo "Fiks disse feilene før du committer."
  echo "Bruk kun TIER Golf Design System tokens fra tier-tokens.css"
  exit 1
fi
