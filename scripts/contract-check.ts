// scripts/contract-check.ts
// Implementation Contract Enforcement
// Reference: docs/IMPLEMENTATION_CONTRACT.md
//
// This script MUST fail CI if any contract rule is violated.
// No exceptions. No overrides.

import fs from "fs";
import path from "path";

// =============================================================================
// TYPES
// =============================================================================

type Rule = {
  forbiddenStrings?: RegExp[];
  forbiddenImports?: RegExp[];
};

// =============================================================================
// GLOBAL INVARIANTS (Apply to ALL screens)
// Reference: PART 2 — Global Design Invariants
// =============================================================================

const GLOBAL_FORBIDDEN: RegExp[] = [
  // G-L1: No "progress" or "fremgang"
  /\bprogress\b/i,
  /\bfremgang\b/i,

  // G-L2: No "improvement" or "forbedring"
  /\bimprovement\b/i,
  /\bforbedring\b/i,

  // G-L3: No encouragement phrases
  /keep it up/i,
  /fortsett sånn/i,
  /keep going/i,

  // G-L4: No celebratory feedback
  /\bgreat\b/i,
  /\bflott\b/i,
  /\bawesome\b/i,
  /\bamazing\b/i,
  /well done/i,
  /good job/i,

  // G-L5: No consolation feedback
  /\bunfortunately\b/i,
  /\bdessverre\b/i,

  // G-G1: No XP/experience
  /\bXP\b/,
  /experience points/i,

  // G-G4: No streaks
  /\bstreak\b/i,

  // G-G7: No achievement language
  /achievement unlocked/i,

  // G-T2: No causality interpretation
  /because you trained/i,
  /fordi du trente/i,

  // G-V1, G-V2: Forbidden feedback colors
  /#4A7C59/i, // success green
  /#C45B4E/i, // error red
  /#22c55e/i, // tailwind green
  /#ef4444/i, // tailwind red

  // Forbidden components
  /StreakCounter/,
  /XPDisplay/,
  /BadgeList/,
  /TrendArrow/,
  /CelebrationAnimation/,
  /ConfettiAnimation/,
];

// =============================================================================
// SCREEN-SPECIFIC RULES
// Reference: PART 1 — Screen-Level Acceptance Criteria
// =============================================================================

const SCREEN_RULES: Record<string, Rule> = {
  // SESSION: Execution only. No awareness of outcomes or proof.
  // S-50 to S-63
  SESSION: {
    forbiddenStrings: [
      /\bimprove/i,
      /\bprogress\b/i,
      /\bbaseline\b/i,
      /\bproof\b/i,
      /\bbetter\b/i,
      /\bworse\b/i,
      /\bgoal\b/i,
      /\bmål\b/i,
      /\bbenchmark\b/i,
      /\bscore\b/i,
      /\bgrade\b/i,
    ],
  },

  // REFLECTION: Input capture. No evaluation or comparison.
  // R-50 to R-59
  REFLECTION: {
    forbiddenStrings: [
      /\bimprove/i,
      /\bprogress\b/i,
      /\bbaseline\b/i,
      /\bbetter\b/i,
      /\bworse\b/i,
      /great session/i,
      /bra økt/i,
      /\bscore\b/i,
      /\brating\b/i,
      /\bgrade\b/i,
    ],
  },

  // HOME: Orientation only. No progress evaluation.
  // H-50 to H-63
  HOME: {
    forbiddenStrings: [
      /on track/i,
      /på sporet/i,
      /\bimprove/i,
      /\bprogress\b/i,
      /\bproof\b/i,
      /\bbenchmark\b/i,
      /\bgoal\b/i,
      /\bmål\b/i,
      /\brecommend/i,
      /\banbefal/i,
    ],
  },

  // BASELINE: Neutral reference. No future implications.
  // B-50 to B-60
  BASELINE: {
    forbiddenStrings: [
      /\bimprove/i,
      /\bprogress\b/i,
      /\bgoal\b/i,
      /\bmål\b/i,
      /\bexpect/i,
      /\bforvent/i,
      /\bambitious/i,
      /\bambitiøs/i,
      /\bconservative/i,
      /\bkonservativ/i,
      /\brecommend/i,
      /\banbefal/i,
      /\bjourney\b/i,
      /\breise\b/i,
      /\bpath\b/i,
    ],
  },

  // PROOF: Evidence only. No interpretation, no effort, no motivation.
  // P-50 to P-63
  PROOF: {
    forbiddenStrings: [
      /great job/i,
      /keep going/i,
      /\beffort\b/i,
      /\binnsats\b/i,
      /\bsession\b/i,
      /\bøkt\b/i,
      /\bmotivat/i,
      /because you/i,
      /fordi du/i,
      /next steps/i,
      /neste steg/i,
      /\bdecline\b/i,
      /\bnedgang\b/i,
      /\bsorry\b/i,
      /\bdessverre\b/i,
    ],
  },

  // TRAJECTORY: History only. No trends, no predictions.
  // T-50 to T-62
  TRAJECTORY: {
    forbiddenStrings: [
      /\btrend\b/i,
      /\bimprove/i,
      /\bforecast/i,
      /\bprediction/i,
      /\bpredict/i,
      /on track/i,
      /på sporet/i,
      /at this rate/i,
      /\baverage\b/i,
      /\bgjennomsnitt\b/i,
      /\bbest\b/i,
      /\bworst\b/i,
    ],
  },
};

// =============================================================================
// ENFORCEMENT
// =============================================================================

const SCREENS_DIR = path.resolve("apps/golfer/screens");

let hasErrors = false;
let totalViolations = 0;

// Check if screens directory exists
if (!fs.existsSync(SCREENS_DIR)) {
  console.error(`❌ Screens directory not found: ${SCREENS_DIR}`);
  process.exit(1);
}

console.log("🔒 Implementation Contract Check\n");
console.log("Reference: docs/IMPLEMENTATION_CONTRACT.md\n");
console.log("─".repeat(50));

for (const file of fs.readdirSync(SCREENS_DIR)) {
  if (!file.endsWith(".tsx")) continue;

  const screenName = file.replace(".tsx", "");
  const filePath = path.join(SCREENS_DIR, file);
  const content = fs.readFileSync(filePath, "utf-8");

  // Skip lines that are clearly comments/documentation
  const lines = content.split("\n");
  const codeContent = lines
    .filter((line) => {
      const trimmed = line.trim();
      // Skip JSDoc, single-line comments, and contract references
      return (
        !trimmed.startsWith("*") &&
        !trimmed.startsWith("//") &&
        !trimmed.includes("MUST NOT") &&
        !trimmed.includes("MUST:") &&
        !trimmed.includes("Contract:")
      );
    })
    .join("\n");

  let fileViolations: string[] = [];

  // Check global invariants (apply to ALL screens)
  GLOBAL_FORBIDDEN.forEach((regex) => {
    if (regex.test(codeContent)) {
      fileViolations.push(`Global violation: "${regex}"`);
    }
  });

  // Check screen-specific rules
  const rules = SCREEN_RULES[screenName];
  if (rules) {
    rules.forbiddenStrings?.forEach((regex) => {
      if (regex.test(codeContent)) {
        fileViolations.push(`Screen rule violation: "${regex}"`);
      }
    });

    rules.forbiddenImports?.forEach((regex) => {
      if (regex.test(content)) {
        fileViolations.push(`Forbidden import: "${regex}"`);
      }
    });
  }

  // Report violations for this file
  if (fileViolations.length > 0) {
    console.log(`\n❌ ${file}`);
    fileViolations.forEach((v) => console.log(`   ${v}`));
    hasErrors = true;
    totalViolations += fileViolations.length;
  } else {
    console.log(`✓ ${file}`);
  }
}

console.log("\n" + "─".repeat(50));

if (hasErrors) {
  console.error(`\n⛔ Implementation Contract violated.`);
  console.error(`   ${totalViolations} violation(s) found.`);
  console.error(`   Fix all violations before merging.\n`);
  process.exit(1);
}

console.log("\n✅ Implementation Contract check passed.\n");
