/**
 * PROOF Component - Shared between Golfer and Coach views
 * Migrated to Tailwind CSS
 *
 * Contract: IMPLEMENTATION_CONTRACT.md (P-01 to P-63)
 * Contract: COACH_ADMIN_SCREEN_CONTRACT.md (CPV-C01: pixel-identical to golfer)
 *
 * PURPOSE: Present evidence of change without interpretation
 *
 * NON-NEGOTIABLE:
 * - Layout MUST be identical for positive/negative results
 * - Delta shown in neutral charcoal (no green/red)
 * - No causality language ("because you trained X")
 * - No effort data (hours, sessions)
 * - No motivation text
 * - Missing data shown as em-dash (—)
 */

import React from "react";
import { SectionTitle } from "../typography";

//////////////////////////////
// 1. TYPES
//////////////////////////////

type ProofData = {
  testName: string;
  testDate: string;
  current: number | null;
  baseline: number | null;
  unit: string;
};

type ProofProps = {
  athleteId: string;
  testId: string;
  data?: ProofData;
  onDismiss?: () => void;
};

//////////////////////////////
// 2. MOCK DATA (TEMP)
//////////////////////////////

const MOCK_PROOF: ProofData = {
  testName: "Putteavstand 3m",
  testDate: "2024-12-18",
  current: 72,
  baseline: 65,
  unit: "%",
};

//////////////////////////////
// 3. HELPERS
//////////////////////////////

function formatValue(value: number | null, unit: string): string {
  if (value === null || value === undefined) {
    return "—";
  }
  return `${value}${unit}`;
}

function calculateDelta(
  current: number | null,
  baseline: number | null
): string {
  if (current === null || baseline === null) {
    return "—";
  }
  const delta = current - baseline;
  const sign = delta >= 0 ? "+" : "";
  return `${sign}${delta}`;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("nb-NO", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

//////////////////////////////
// 4. COMPONENT
//////////////////////////////

export default function Proof({
  athleteId,
  testId,
  data = MOCK_PROOF,
  onDismiss,
}: ProofProps) {
  const delta = calculateDelta(data.current, data.baseline);

  return (
    <article className="p-4 bg-white rounded-lg shadow-md" aria-label="Proof of change">
      {/* Header */}
      <header className="mb-4">
        <SectionTitle className="text-xl font-bold text-tier-navy m-0">
          {data.testName}
        </SectionTitle>
        <p className="text-xs text-tier-text-secondary mt-1">
          {formatDate(data.testDate)}
        </p>
      </header>

      {/* Metrics Grid - NÅ / BASELINE / ENDRING */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {/* Current (NÅ) */}
        <div className="text-center p-3 bg-tier-surface-subtle rounded">
          <div className="text-[10px] text-tier-text-secondary uppercase tracking-wider mb-1">
            Nå
          </div>
          <div className="text-2xl font-bold text-tier-navy">
            {formatValue(data.current, data.unit)}
          </div>
        </div>

        {/* Baseline */}
        <div className="text-center p-3 bg-tier-surface-subtle rounded">
          <div className="text-[10px] text-tier-text-secondary uppercase tracking-wider mb-1">
            Baseline
          </div>
          <div className="text-2xl font-bold text-tier-navy">
            {formatValue(data.baseline, data.unit)}
          </div>
        </div>

        {/* Delta (ENDRING) - Always neutral color */}
        <div className="text-center p-3 bg-tier-surface-subtle rounded">
          <div className="text-[10px] text-tier-text-secondary uppercase tracking-wider mb-1">
            Endring
          </div>
          {/* CRITICAL: Delta uses neutral charcoal - NO green/red */}
          <div className="text-2xl font-bold text-tier-navy">
            {delta}{data.unit !== "%" ? "" : ""}
          </div>
        </div>
      </div>

      {/* Dismiss Button - "Forstått" per contract */}
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="w-full p-3 text-sm font-semibold text-tier-navy bg-tier-surface-subtle border border-tier-border-default rounded cursor-pointer hover:bg-gray-100 transition-colors"
        >
          Forstått
        </button>
      )}
    </article>
  );
}

//////////////////////////////
// 5. STRICT NOTES (CONTRACT)
//////////////////////////////

/*
 * P-01: Screen shows ONLY test result comparison
 * P-02: No effort data (hours, sessions) - NEVER
 * P-03: No causality ("because you trained X") - NEVER
 * P-04: No motivation text - NEVER
 * P-05: Delta = Current - Baseline (factual)
 * P-06: Missing data shown as em-dash (—)
 * P-07: Layout identical for positive/negative
 * P-08: Delta color = charcoal (neutral)
 * P-09: Dismiss button = "Forstått" (not "OK")
 * P-10: No session count, no training hours
 *
 * CPV-C01: Coach view MUST be pixel-identical to golfer view
 */
