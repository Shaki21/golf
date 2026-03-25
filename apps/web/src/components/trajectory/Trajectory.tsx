/**
 * TRAJECTORY Component - Shared between Golfer and Coach views
 * Migrated to Tailwind CSS
 *
 * Contract: IMPLEMENTATION_CONTRACT.md (T-01 to T-62)
 * Contract: COACH_ADMIN_SCREEN_CONTRACT.md (CTV-C01: identical to golfer)
 *
 * PURPOSE: Historical view without trends or predictions
 *
 * NON-NEGOTIABLE:
 * - Chronological list ONLY (no charts, no graphs)
 * - No trend lines, no predictions
 * - No "on track" labels
 * - No averages, no "best/worst"
 * - Filter chips in neutral charcoal
 * - No interpretation of data
 */

import React, { useState } from "react";
import { SectionTitle } from "../typography";

//////////////////////////////
// 1. TYPES
//////////////////////////////

type TestResult = {
  id: string;
  testName: string;
  date: string;
  value: number;
  unit: string;
  category: string;
};

type TrajectoryProps = {
  athleteId: string;
  results?: TestResult[];
};

//////////////////////////////
// 2. MOCK DATA (TEMP)
//////////////////////////////

const MOCK_RESULTS: TestResult[] = [
  { id: "1", testName: "Putteavstand 3m", date: "2024-12-18", value: 72, unit: "%", category: "putting" },
  { id: "2", testName: "Putteavstand 3m", date: "2024-11-20", value: 68, unit: "%", category: "putting" },
  { id: "3", testName: "Putteavstand 3m", date: "2024-10-15", value: 65, unit: "%", category: "putting" },
  { id: "4", testName: "Drivelengde", date: "2024-12-10", value: 245, unit: "m", category: "driving" },
  { id: "5", testName: "Drivelengde", date: "2024-11-05", value: 240, unit: "m", category: "driving" },
  { id: "6", testName: "GIR", date: "2024-12-01", value: 55, unit: "%", category: "approach" },
];

const CATEGORIES = [
  { id: "all", label: "Alle" },
  { id: "putting", label: "Putting" },
  { id: "driving", label: "Driving" },
  { id: "approach", label: "Innspill" },
];

//////////////////////////////
// 3. HELPERS
//////////////////////////////

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("nb-NO", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function sortByDateDesc(results: TestResult[]): TestResult[] {
  return [...results].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

//////////////////////////////
// 4. COMPONENT
//////////////////////////////

export default function Trajectory({
  athleteId,
  results = MOCK_RESULTS,
}: TrajectoryProps) {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredResults =
    selectedCategory === "all"
      ? results
      : results.filter((r) => r.category === selectedCategory);

  const sortedResults = sortByDateDesc(filteredResults);

  return (
    <div className="p-4">
      {/* Header - No interpretation text */}
      <header className="mb-4">
        <SectionTitle className="text-xl font-bold text-tier-navy m-0">
          Historikk
        </SectionTitle>
      </header>

      {/* Filter Chips - Neutral charcoal for selected */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1 text-xs font-medium rounded-full cursor-pointer transition-colors ${
              selectedCategory === cat.id
                ? 'bg-tier-navy text-white border border-tier-navy'
                : 'bg-tier-surface-subtle text-tier-text-secondary border border-tier-border-default hover:bg-gray-100'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Results List - Chronological, no trends */}
      {sortedResults.length === 0 ? (
        <p className="text-center py-8 text-tier-text-secondary text-sm">
          Ingen testresultater
        </p>
      ) : (
        <ul className="list-none p-0 m-0">
          {sortedResults.map((result) => (
            <li
              key={result.id}
              className="p-3 mb-2 bg-white rounded shadow-sm flex justify-between items-center"
            >
              <div className="flex flex-col gap-1">
                <span className="text-sm font-semibold text-tier-navy">
                  {result.testName}
                </span>
                <span className="text-xs text-tier-text-secondary">
                  {formatDate(result.date)}
                </span>
              </div>
              {/* Value shown in neutral color - no interpretation */}
              <span className="text-lg font-bold text-tier-navy">
                {result.value}
                {result.unit}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

//////////////////////////////
// 5. STRICT NOTES (CONTRACT)
//////////////////////////////

/*
 * T-01: Screen shows chronological list ONLY
 * T-02: No trend lines - NEVER
 * T-03: No charts or graphs - NEVER
 * T-04: No predictions - NEVER
 * T-05: No "on track" labels - NEVER
 * T-06: No averages - NEVER
 * T-07: No "best/worst" - NEVER
 * T-08: Filter chips use charcoal (neutral)
 * T-09: Values shown without interpretation
 * T-10: No sparklines or mini-charts
 *
 * CTV-C01: Coach view MUST be identical to golfer view
 */
