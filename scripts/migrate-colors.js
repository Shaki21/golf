#!/usr/bin/env node
/**
 * TIER Golf - Color Migration Helper Script
 *
 * Automatically migrates hardcoded hex colors to CSS design tokens
 *
 * Usage:
 *   node scripts/migrate-colors.js <file-path>           # Single file
 *   node scripts/migrate-colors.js <directory-path>      # Directory (recursive)
 *   node scripts/migrate-colors.js --scan               # Scan only (no changes)
 *
 * Examples:
 *   node scripts/migrate-colors.js apps/web/src/features/player-dashboard/PlayerDashboard.tsx
 *   node scripts/migrate-colors.js apps/web/src/features/coach-stats --scan
 */

const fs = require('fs');
const path = require('path');

// Color mapping: hex → Tailwind class or CSS variable
const COLOR_MAPPINGS = {
  // TIER Navy (original design)
  '#0A2540': {
    className: 'tier-navy',
    cssVar: 'rgb(var(--tier-navy-rgb))',
    description: 'TIER Navy (primary brand)'
  },
  '#0F3459': {
    className: 'tier-navy-light',
    cssVar: 'rgb(var(--tier-navy-light-rgb))',
    description: 'TIER Navy Light (hover)'
  },
  '#071C30': {
    className: 'tier-navy-dark',
    cssVar: 'rgb(var(--tier-navy-dark-rgb))',
    description: 'TIER Navy Dark (pressed)'
  },

  // TIER Gold (original design)
  '#C9A227': {
    className: 'tier-gold',
    cssVar: 'rgb(var(--tier-gold-rgb))',
    description: 'TIER Gold (accent)'
  },
  '#D4A53C': {
    className: 'tier-gold-light',
    cssVar: 'rgb(var(--tier-gold-light-rgb))',
    description: 'TIER Gold Light (hover)'
  },
  '#B48223': {
    className: 'tier-gold-dark',
    cssVar: 'rgb(var(--tier-gold-dark-rgb))',
    description: 'TIER Gold Dark (pressed)'
  },

  // Old implementation (forest green) - needs migration
  '#0D3B2F': {
    className: 'tier-navy',
    cssVar: 'rgb(var(--tier-navy-rgb))',
    description: 'OLD Forest Green → TIER Navy'
  },
  '#165C4A': {
    className: 'tier-navy-light',
    cssVar: 'rgb(var(--tier-navy-light-rgb))',
    description: 'OLD Forest Green Light → TIER Navy Light'
  },
  '#0A2F25': {
    className: 'tier-navy-dark',
    cssVar: 'rgb(var(--tier-navy-dark-rgb))',
    description: 'OLD Forest Green Dark → TIER Navy Dark'
  },
  '#E8A54B': {
    className: 'tier-gold',
    cssVar: 'rgb(var(--tier-gold-rgb))',
    description: 'OLD Warm Gold → TIER Gold'
  },
  '#F0B769': {
    className: 'tier-gold-light',
    cssVar: 'rgb(var(--tier-gold-light-rgb))',
    description: 'OLD Warm Gold Light → TIER Gold Light'
  },
  '#C88E41': {
    className: 'tier-gold-dark',
    cssVar: 'rgb(var(--tier-gold-dark-rgb))',
    description: 'OLD Warm Gold Dark → TIER Gold Dark'
  },

  // Status colors
  '#059669': {
    className: 'tier.success',
    cssVar: 'rgb(var(--status-success-rgb))',
    description: 'Success Green'
  },
  '#F59E0B': {
    className: 'tier.warning',
    cssVar: 'rgb(var(--status-warning-rgb))',
    description: 'Warning Amber'
  },
  '#EF4444': {
    className: 'tier.error',
    cssVar: 'rgb(var(--status-error-rgb))',
    description: 'Error Red'
  },
  '#3B82F6': {
    className: 'tier.info',
    cssVar: 'rgb(var(--status-info-rgb))',
    description: 'Info Blue'
  },

  // White
  '#FFFFFF': {
    className: 'tier-white',
    cssVar: 'rgb(var(--tier-white-rgb))',
    description: 'White'
  },
  '#FFF': {
    className: 'tier-white',
    cssVar: 'rgb(var(--tier-white-rgb))',
    description: 'White (short)'
  },
};

// Normalize hex colors to uppercase 6-char format
function normalizeHex(hex) {
  hex = hex.toUpperCase();
  if (hex.length === 4) {
    // #FFF → #FFFFFF
    return '#' + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
  }
  return hex;
}

// Detect context (className, style prop, CSS-in-JS)
function detectContext(line, match) {
  const before = line.substring(0, match.index);

  // Inline style: style={{ color: '#0A2540' }}
  if (/style\s*=\s*\{\{/.test(before) || /style:\s*{/.test(before)) {
    return 'inline-style';
  }

  // className prop: className="bg-[#0A2540]"
  if (/className\s*=/.test(before)) {
    return 'className';
  }

  // CSS property: background-color: #0A2540;
  if (/:\s*$/.test(before)) {
    return 'css-property';
  }

  // JSX prop: color="#0A2540"
  if (/\w+\s*=\s*["']?$/.test(before)) {
    return 'jsx-prop';
  }

  return 'unknown';
}

// Generate replacement based on context
function generateReplacement(hex, context, propertyName) {
  const normalized = normalizeHex(hex);
  const mapping = COLOR_MAPPINGS[normalized];

  if (!mapping) {
    return null;
  }

  switch (context) {
    case 'className':
      // Determine if bg, text, border, etc.
      if (propertyName?.includes('bg') || propertyName?.includes('background')) {
        return `bg-${mapping.className}`;
      } else if (propertyName?.includes('text') || propertyName?.includes('color')) {
        return `text-${mapping.className}`;
      } else if (propertyName?.includes('border')) {
        return `border-${mapping.className}`;
      }
      // Default to text color
      return `text-${mapping.className}`;

    case 'inline-style':
    case 'css-property':
      // Use CSS variable
      return mapping.cssVar;

    case 'jsx-prop':
      // For color props, suggest Tailwind class in comment
      return `${hex} /* TODO: Use tier-${mapping.className} */`;

    default:
      return mapping.cssVar;
  }
}

// Scan file for hardcoded colors
function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const findings = [];

  // Regex to match hex colors
  const hexRegex = /#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})\b/g;

  lines.forEach((line, lineIndex) => {
    let match;
    while ((match = hexRegex.exec(line)) !== null) {
      const hex = match[0];
      const normalized = normalizeHex(hex);
      const mapping = COLOR_MAPPINGS[normalized];

      if (mapping) {
        const context = detectContext(line, match);
        findings.push({
          line: lineIndex + 1,
          column: match.index + 1,
          hex: hex,
          normalized: normalized,
          context: context,
          mapping: mapping,
          lineContent: line.trim()
        });
      }
    }
  });

  return findings;
}

// Migrate file
function migrateFile(filePath, dryRun = false) {
  const findings = scanFile(filePath);

  if (findings.length === 0) {
    return { migrated: 0, findings: [] };
  }

  if (dryRun) {
    return { migrated: 0, findings };
  }

  // Read file content
  let content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  // Apply migrations (reverse order to maintain positions)
  findings.reverse().forEach(finding => {
    const lineIndex = finding.line - 1;
    const line = lines[lineIndex];

    // Extract property name for context
    const propertyMatch = line.substring(0, finding.column).match(/(\w+)[-:]?\s*$/);
    const propertyName = propertyMatch ? propertyMatch[1] : null;

    const replacement = generateReplacement(
      finding.hex,
      finding.context,
      propertyName
    );

    if (replacement && finding.context === 'inline-style') {
      // Replace inline style hex with CSS variable
      // Before: style={{ color: '#0A2540' }}
      // After:  style={{ color: 'rgb(var(--tier-navy-rgb))' }}
      const before = line.substring(0, finding.column - 1);
      const after = line.substring(finding.column - 1 + finding.hex.length);
      lines[lineIndex] = before + replacement + after;
    } else if (replacement && finding.context === 'className') {
      // Replace className with Tailwind class
      // This is more complex - would need to parse JSX properly
      // For now, add comment
      lines[lineIndex] = line + ` /* TODO: Migrate ${finding.hex} to ${replacement} */`;
    } else if (replacement) {
      // Simple replacement for CSS properties
      const before = line.substring(0, finding.column - 1);
      const after = line.substring(finding.column - 1 + finding.hex.length);
      lines[lineIndex] = before + replacement + after;
    }
  });

  // Write back to file
  const newContent = lines.join('\n');
  fs.writeFileSync(filePath, newContent, 'utf-8');

  return { migrated: findings.length, findings };
}

// Recursively process directory
function processDirectory(dirPath, dryRun = false) {
  const results = {
    filesScanned: 0,
    filesMigrated: 0,
    totalFindings: 0,
    totalMigrated: 0,
    files: []
  };

  function walk(dir) {
    const items = fs.readdirSync(dir);

    items.forEach(item => {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        // Skip node_modules, .git, etc.
        if (!['node_modules', '.git', 'dist', 'build', '.next'].includes(item)) {
          walk(fullPath);
        }
      } else if (stat.isFile()) {
        // Only process .tsx, .jsx, .ts, .js, .css files
        const ext = path.extname(fullPath);
        if (['.tsx', '.jsx', '.ts', '.js', '.css'].includes(ext)) {
          results.filesScanned++;
          const result = migrateFile(fullPath, dryRun);

          if (result.findings.length > 0) {
            results.totalFindings += result.findings.length;
            results.totalMigrated += result.migrated;
            if (result.migrated > 0) {
              results.filesMigrated++;
            }
            results.files.push({
              path: fullPath,
              ...result
            });
          }
        }
      }
    });
  }

  walk(dirPath);
  return results;
}

// Print results
function printResults(results, dryRun = false) {
  console.log('\n' + '='.repeat(80));
  console.log('TIER Golf - Color Migration Report');
  console.log('='.repeat(80) + '\n');

  if (results.files) {
    // Directory scan
    console.log(`Files scanned: ${results.filesScanned}`);
    console.log(`Files with hardcoded colors: ${results.files.length}`);
    console.log(`Total hardcoded colors found: ${results.totalFindings}`);
    if (!dryRun) {
      console.log(`Colors migrated: ${results.totalMigrated}`);
      console.log(`Files modified: ${results.filesMigrated}`);
    }
    console.log('');

    // Print details for each file
    results.files.forEach(file => {
      console.log(`\n📄 ${file.path.replace(process.cwd(), '.')}`);
      console.log(`   Found: ${file.findings.length} hardcoded colors`);

      file.findings.forEach(finding => {
        console.log(`   Line ${finding.line}:${finding.column} - ${finding.hex} (${finding.context})`);
        console.log(`      → ${finding.mapping.description}`);
        console.log(`      → Suggest: ${finding.mapping.className} or ${finding.mapping.cssVar}`);
      });
    });
  } else {
    // Single file
    console.log(`Found: ${results.findings.length} hardcoded colors`);
    if (!dryRun) {
      console.log(`Migrated: ${results.migrated}`);
    }
    console.log('');

    results.findings.forEach(finding => {
      console.log(`Line ${finding.line}:${finding.column} - ${finding.hex} (${finding.context})`);
      console.log(`   → ${finding.mapping.description}`);
      console.log(`   → Suggest: ${finding.mapping.className} or ${finding.mapping.cssVar}`);
      console.log(`   Code: ${finding.lineContent}`);
      console.log('');
    });
  }

  console.log('\n' + '='.repeat(80));
  if (dryRun) {
    console.log('DRY RUN - No files were modified');
    console.log('Remove --scan flag to apply migrations');
  } else {
    console.log('✅ Migration complete!');
    console.log('⚠️  Manual review required for complex cases (see TODO comments)');
  }
  console.log('='.repeat(80) + '\n');
}

// Main
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log(`
TIER Golf - Color Migration Helper Script

Usage:
  node scripts/migrate-colors.js <file-path>           # Migrate single file
  node scripts/migrate-colors.js <directory-path>      # Migrate directory (recursive)
  node scripts/migrate-colors.js <path> --scan        # Scan only (no changes)

Examples:
  node scripts/migrate-colors.js apps/web/src/features/player-dashboard/PlayerDashboard.tsx
  node scripts/migrate-colors.js apps/web/src/features/coach-stats --scan
  node scripts/migrate-colors.js apps/web/src --scan

Supported file types: .tsx, .jsx, .ts, .js, .css
`);
    process.exit(0);
  }

  const targetPath = path.resolve(args[0]);
  const dryRun = args.includes('--scan');

  if (!fs.existsSync(targetPath)) {
    console.error(`❌ Error: Path does not exist: ${targetPath}`);
    process.exit(1);
  }

  const stat = fs.statSync(targetPath);
  let results;

  if (stat.isDirectory()) {
    console.log(`🔍 Scanning directory: ${targetPath}`);
    if (!dryRun) {
      console.log('⚠️  Will modify files - press Ctrl+C to cancel...');
      // Give user time to cancel
      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      });

      readline.question('Continue? (y/N) ', (answer) => {
        readline.close();
        if (answer.toLowerCase() !== 'y') {
          console.log('Cancelled.');
          process.exit(0);
        }

        results = processDirectory(targetPath, dryRun);
        printResults(results, dryRun);
      });
      return;
    } else {
      results = processDirectory(targetPath, dryRun);
    }
  } else {
    console.log(`🔍 Scanning file: ${targetPath}`);
    results = migrateFile(targetPath, dryRun);
  }

  printResults(results, dryRun);
}

main();
