/**
 * Bundle Analyzer Script
 *
 * Analyzes the production build to identify:
 * - Large dependencies
 * - Duplicate code
 * - Optimization opportunities
 *
 * Usage:
 *   npm run build
 *   node analyze-bundle.js
 */

const fs = require('fs');
const path = require('path');
const { gzipSync } = require('zlib');

const BUILD_DIR = path.join(__dirname, 'build', 'static', 'js');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

function analyzeBundle() {
  console.log(`\n${colors.bold}${colors.cyan}=== Bundle Analysis ===${colors.reset}\n`);

  if (!fs.existsSync(BUILD_DIR)) {
    console.error(`${colors.red}Error: Build directory not found!${colors.reset}`);
    console.error('Run "npm run build" first.\n');
    process.exit(1);
  }

  const files = fs.readdirSync(BUILD_DIR).filter((file) => file.endsWith('.js'));

  if (files.length === 0) {
    console.error(`${colors.red}Error: No JavaScript files found in build!${colors.reset}\n`);
    process.exit(1);
  }

  const fileStats = files.map((file) => {
    const filePath = path.join(BUILD_DIR, file);
    const content = fs.readFileSync(filePath);
    const size = content.length;
    const gzipSize = gzipSync(content).length;

    // Detect chunk type from filename
    let type = 'Unknown';
    if (file.includes('main')) type = 'Main Bundle';
    else if (file.includes('runtime')) type = 'Runtime';
    else if (file.includes('vendor') || file.match(/^\d+\./)) type = 'Vendor Chunk';
    else type = 'Route Chunk';

    return {
      file,
      type,
      size,
      gzipSize,
    };
  });

  // Sort by gzipped size (descending)
  fileStats.sort((a, b) => b.gzipSize - a.gzipSize);

  // Calculate totals
  const totalSize = fileStats.reduce((sum, file) => sum + file.size, 0);
  const totalGzipSize = fileStats.reduce((sum, file) => sum + file.gzipSize, 0);

  // Print summary
  console.log(`${colors.bold}Summary:${colors.reset}`);
  console.log(`  Total files: ${fileStats.length}`);
  console.log(`  Total size: ${formatBytes(totalSize)} (uncompressed)`);
  console.log(`  Total size: ${formatBytes(totalGzipSize)} (gzipped)\n`);

  // Print main bundle info
  const mainBundle = fileStats.find((f) => f.type === 'Main Bundle');
  if (mainBundle) {
    const sizeColor =
      mainBundle.gzipSize > 200 * 1024
        ? colors.red
        : mainBundle.gzipSize > 150 * 1024
        ? colors.yellow
        : colors.green;

    console.log(`${colors.bold}Main Bundle:${colors.reset}`);
    console.log(`  ${mainBundle.file}`);
    console.log(`  Size: ${formatBytes(mainBundle.size)} (uncompressed)`);
    console.log(`  Size: ${sizeColor}${formatBytes(mainBundle.gzipSize)}${colors.reset} (gzipped)\n`);

    if (mainBundle.gzipSize > 200 * 1024) {
      console.log(`  ${colors.red}⚠ Warning: Main bundle is large (> 200 KB gzipped)${colors.reset}`);
      console.log(`  Consider code splitting or lazy loading heavy dependencies.\n`);
    } else if (mainBundle.gzipSize > 150 * 1024) {
      console.log(`  ${colors.yellow}⚠ Notice: Main bundle is moderate (> 150 KB gzipped)${colors.reset}`);
      console.log(`  Room for optimization if needed.\n`);
    } else {
      console.log(`  ${colors.green}✓ Main bundle size is good (< 150 KB gzipped)${colors.reset}\n`);
    }
  }

  // Print largest chunks
  console.log(`${colors.bold}Largest Chunks (Top 10):${colors.reset}`);
  fileStats.slice(0, 10).forEach((file, i) => {
    const sizeColor =
      file.gzipSize > 200 * 1024
        ? colors.red
        : file.gzipSize > 100 * 1024
        ? colors.yellow
        : colors.green;

    console.log(
      `  ${i + 1}. ${file.file}`
    );
    console.log(`     Type: ${file.type}`);
    console.log(`     Size: ${sizeColor}${formatBytes(file.gzipSize)}${colors.reset} (gzipped)`);
  });

  console.log();

  // Print recommendations
  console.log(`${colors.bold}${colors.cyan}Recommendations:${colors.reset}`);

  // Check for large chunks
  const largeChunks = fileStats.filter((f) => f.gzipSize > 200 * 1024);
  if (largeChunks.length > 0) {
    console.log(`\n  ${colors.red}Large Chunks Found:${colors.reset}`);
    largeChunks.forEach((chunk) => {
      console.log(`  - ${chunk.file}: ${formatBytes(chunk.gzipSize)}`);
    });
    console.log(`  ${colors.yellow}→ Consider splitting large dependencies or features.${colors.reset}`);
  }

  // Check for vendor chunks
  const vendorChunks = fileStats.filter((f) => f.type === 'Vendor Chunk');
  if (vendorChunks.length === 0) {
    console.log(`\n  ${colors.yellow}No vendor chunks detected.${colors.reset}`);
    console.log(`  → Consider splitting vendor code from app code for better caching.`);
  }

  // Check for many small chunks
  const smallChunks = fileStats.filter((f) => f.gzipSize < 10 * 1024);
  if (smallChunks.length > 20) {
    console.log(`\n  ${colors.yellow}Many small chunks detected (${smallChunks.length}).${colors.reset}`);
    console.log(`  → Consider grouping related routes or features together.`);
  }

  console.log(`\n${colors.green}✓ Analysis complete!${colors.reset}`);
  console.log(`\nFor detailed analysis, install webpack-bundle-analyzer:`);
  console.log(`  npm install --save-dev webpack-bundle-analyzer`);
  console.log(`  npm run build -- --stats`);
  console.log(`  npx webpack-bundle-analyzer build/bundle-stats.json\n`);
}

// Run analysis
try {
  analyzeBundle();
} catch (error) {
  console.error(`${colors.red}Error during analysis:${colors.reset}`, error.message);
  process.exit(1);
}
