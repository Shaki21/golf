/**
 * CoachAthleteTests - Coach view of athlete test protocols
 *
 * Purpose: Display test results and progression for a specific athlete
 *
 * Features:
 * - View all test results for the athlete
 * - See historical progression for each test
 * - View test requirements and pass/fail status
 * - Filter by test category
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Target, TrendingUp, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { PageTitle, SectionTitle, SubSectionTitle, CardTitle } from '../../../components/typography';
import { getAthleteById } from '../../../lib/coachMockData';

// Test categories
const TEST_CATEGORIES = [
  { id: 'all', label: 'Alle tester', icon: 'target' },
  { id: 'speed', label: 'Fart', icon: 'zap' },
  { id: 'distance', label: 'Distanse', icon: 'ruler' },
  { id: 'accuracy', label: 'Presisjon', icon: 'target' },
  { id: 'short_game', label: 'Kort spill', icon: 'flag' },
  { id: 'putting', label: 'Putting', icon: 'circle' },
  { id: 'physical', label: 'Fysisk', icon: 'dumbbell' },
  { id: 'scoring', label: 'Scoring', icon: 'bar-chart' },
  { id: 'mental', label: 'Mental', icon: 'brain' },
];

// Mock test results data (will be replaced with API call)
const MOCK_TEST_RESULTS = [
  {
    id: '1',
    testNumber: 1,
    testName: 'Driver klubbhodehastighet',
    category: 'speed',
    latestValue: 112.5,
    latestDate: '2026-01-02',
    requirement: 110,
    unit: 'mph',
    passed: true,
    trend: 'up', // up, down, stable
    history: [
      { date: '2025-11-01', value: 108.2 },
      { date: '2025-12-01', value: 110.8 },
      { date: '2026-01-02', value: 112.5 },
    ],
  },
  {
    id: '2',
    testNumber: 4,
    testName: 'PEI (Physical Efficiency Index)',
    category: 'physical',
    latestValue: 1.42,
    latestDate: '2025-12-28',
    requirement: 1.40,
    unit: '',
    passed: true,
    trend: 'stable',
    history: [
      { date: '2025-10-15', value: 1.38 },
      { date: '2025-11-20', value: 1.41 },
      { date: '2025-12-28', value: 1.42 },
    ],
  },
  {
    id: '3',
    testNumber: 12,
    testName: 'Putting 1.8m gate',
    category: 'putting',
    latestValue: 16,
    latestDate: '2026-01-01',
    requirement: 18,
    unit: 'av 20',
    passed: false,
    trend: 'down',
    history: [
      { date: '2025-11-05', value: 17 },
      { date: '2025-12-10', value: 18 },
      { date: '2026-01-01', value: 16 },
    ],
  },
];

// Test result card component
function TestResultCard({ test }: { test: typeof MOCK_TEST_RESULTS[0] }) {
  const trendIcon = test.trend === 'up' ? 'up' : test.trend === 'down' ? 'down' : 'stable';
  const trendColor = test.trend === 'up' ? 'text-green-600' : test.trend === 'down' ? 'text-red-600' : 'text-gray-600';

  return (
    <div className="bg-tier-white rounded-lg border border-tier-border-default p-4 hover:border-tier-navy transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-tier-text-tertiary">
              Test {test.testNumber}
            </span>
            {test.passed ? (
              <CheckCircle size={16} className="text-green-600" />
            ) : (
              <XCircle size={16} className="text-red-600" />
            )}
          </div>
          <CardTitle style={{ marginBottom: 0 }}>
            {test.testName}
          </CardTitle>
        </div>
        <span className={`text-2xl ${trendColor}`}>{trendIcon}</span>
      </div>

      {/* Latest result */}
      <div className="mb-3">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-tier-navy">
            {test.latestValue}
          </span>
          {test.unit && (
            <span className="text-sm text-tier-text-secondary">{test.unit}</span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-tier-text-tertiary">
            Krav: {test.requirement} {test.unit}
          </span>
          {test.passed ? (
            <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
              Bestått
            </span>
          ) : (
            <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded-full">
              Ikke bestått
            </span>
          )}
        </div>
      </div>

      {/* History mini chart */}
      <div className="mb-2">
        <div className="text-xs text-tier-text-tertiary mb-1">Historikk</div>
        <div className="flex items-end justify-between h-12 gap-1">
          {test.history.map((point, idx) => {
            const maxValue = Math.max(...test.history.map(p => p.value), test.requirement);
            const height = (point.value / maxValue) * 100;
            const isPassed = point.value >= test.requirement;

            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full relative">
                  <div
                    className={`w-full rounded-t ${
                      isPassed ? 'bg-green-500' : 'bg-red-500'
                    } transition-all`}
                    style={{ height: `${Math.max(height, 10)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Latest test date */}
      <div className="text-xs text-tier-text-tertiary">
        Sist testet: {new Date(test.latestDate).toLocaleDateString('nb-NO', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })}
      </div>
    </div>
  );
}

// Main component
export default function CoachAthleteTests() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('all');

  const athlete = id ? getAthleteById(id) : undefined;

  // In production, fetch test results from API
  // useEffect(() => {
  //   // Fetch test results for athlete
  //   // GET /api/v1/tests/results?playerId=${id}
  // }, [id]);

  const filteredTests = selectedCategory === 'all'
    ? MOCK_TEST_RESULTS
    : MOCK_TEST_RESULTS.filter(test => test.category === selectedCategory);

  const passedCount = MOCK_TEST_RESULTS.filter(test => test.passed).length;
  const totalCount = MOCK_TEST_RESULTS.length;
  const passRate = Math.round((passedCount / totalCount) * 100);

  if (!athlete) {
    return (
      <div className="max-w-6xl mx-auto text-center py-16">
        <div className="w-20 h-20 rounded-full bg-tier-surface-base flex items-center justify-center mx-auto mb-4">
          <AlertCircle size={40} className="text-tier-text-tertiary" />
        </div>
        <SectionTitle style={{ marginBottom: 8 }}>
          Spiller ikke funnet
        </SectionTitle>
        <button
          onClick={() => navigate('/coach/athletes')}
          className="px-6 py-3 bg-tier-navy text-white rounded-lg font-medium hover:bg-tier-navy/90 transition-colors mt-4"
        >
          Tilbake til spillerlisten
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Back button */}
      <button
        onClick={() => navigate(`/coach/athletes/${id}`)}
        className="flex items-center gap-2 text-tier-text-secondary hover:text-tier-navy transition-colors mb-6"
      >
        <ArrowLeft size={20} />
        <span>Tilbake til {athlete.displayName}</span>
      </button>

      {/* Header */}
      <div className="mb-6">
        <PageTitle>Testprotokoll</PageTitle>
        <p className="text-tier-text-secondary">
          Testresultater og progresjon for {athlete.displayName}
        </p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-tier-white rounded-lg border border-tier-border-default p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
              <Target className="text-blue-600" size={24} />
            </div>
            <div>
              <div className="text-2xl font-bold text-tier-navy">
                {totalCount}
              </div>
              <div className="text-sm text-tier-text-secondary">
                Totalt tester
              </div>
            </div>
          </div>
        </div>

        <div className="bg-tier-white rounded-lg border border-tier-border-default p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
              <CheckCircle className="text-green-600" size={24} />
            </div>
            <div>
              <div className="text-2xl font-bold text-tier-navy">
                {passedCount}
              </div>
              <div className="text-sm text-tier-text-secondary">
                Bestått
              </div>
            </div>
          </div>
        </div>

        <div className="bg-tier-white rounded-lg border border-tier-border-default p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
              <TrendingUp className="text-purple-600" size={24} />
            </div>
            <div>
              <div className="text-2xl font-bold text-tier-navy">
                {passRate}%
              </div>
              <div className="text-sm text-tier-text-secondary">
                Beståttsrate
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category filter */}
      <div className="mb-6">
        <SectionTitle className="mb-3">Kategori</SectionTitle>
        <div className="flex flex-wrap gap-2">
          {TEST_CATEGORIES.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                selectedCategory === category.id
                  ? 'bg-tier-navy text-white border-tier-navy'
                  : 'bg-tier-white border-tier-border-default text-tier-navy hover:border-tier-navy'
              }`}
            >
              <span className="mr-2">{category.icon}</span>
              {category.label}
            </button>
          ))}
        </div>
      </div>

      {/* Test results grid */}
      <div>
        <SectionTitle className="mb-4">Resultater</SectionTitle>
        {filteredTests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTests.map(test => (
              <TestResultCard key={test.id} test={test} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-tier-white rounded-lg border border-tier-border-default">
            <Target size={48} className="text-tier-text-tertiary mx-auto mb-3" />
            <p className="text-tier-text-secondary">
              Ingen tester funnet i denne kategorien
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
