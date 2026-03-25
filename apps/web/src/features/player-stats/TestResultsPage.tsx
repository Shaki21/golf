/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/exhaustive-deps */
/**
 * TestResultsPage - All Test Results Overview
 * Design System v3.1 - Tailwind CSS
 */

import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Target,
  Search,
  TrendingUp,
  TrendingDown,
  Activity,
  RefreshCw,
  Calendar,
  CheckCircle,
  Circle
} from 'lucide-react';
import AppShellTemplate from '../../ui/templates/AppShellTemplate';
import Card from '../../ui/primitives/Card';
import Button from '../../ui/primitives/Button';
import StateCard from '../../ui/composites/StateCard';
import { SectionTitle, SubSectionTitle } from '../../components/typography/Headings';

import apiClient from '../../services/apiClient';
import { useScreenView } from '../../analytics/useScreenView';
import { useAuth } from '../../contexts/AuthContext';
import {
  mapRawResultsToListPage,
  type ListPageTestResult,
  type RawApiTestResultWithTest,
} from '../../domain/tests';

// Use centralized type from domain/tests
type TestResult = ListPageTestResult;

interface GroupedTests {
  [category: string]: TestResult[];
}

const TestResultsPage: React.FC = () => {
  useScreenView('Alle Testresultater');
  const navigate = useNavigate();
  const { user } = useAuth();

  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'result'>('date');

  useEffect(() => {
    fetchTestResults();
  }, []);

  const fetchTestResults = async () => {
    setLoading(true);
    setError(null);
    try {
      const playerId = user?.playerId || user?.id;
      const response = await apiClient.get(`/tests/results`, {
        params: {
          playerId,
          limit: 200,
          sortBy: 'testDate',
          sortOrder: 'desc'
        }
      });

      if (response.data?.success) {
        // Process and enrich results using centralized mapper
        const rawResults = (response.data.data || []) as RawApiTestResultWithTest[];
        const enrichedResults = mapRawResultsToListPage(rawResults, new Date().toISOString());
        setResults(enrichedResults);
      } else {
        setResults([]);
      }
    } catch (err: any) {
      console.error('Failed to fetch test results:', err);
      setError(err.response?.data?.error || 'Kunne ikke hente testresultater');
      // Use demo data as fallback
      setResults(getDemoResults());
    } finally {
      setLoading(false);
    }
  };

  // NOTE: processResults logic has been moved to domain/tests/mappers.ts
  // as mapRawResultsToListPage() for centralized conversion.

  const categories = useMemo(() => {
    const cats = new Set(results.map(r => r.category));
    return ['all', ...Array.from(cats)];
  }, [results]);

  const filteredResults = useMemo(() => {
    let filtered = [...results];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(r =>
        r.testName.toLowerCase().includes(query) ||
        r.category.toLowerCase().includes(query)
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(r => r.category === selectedCategory);
    }

    // Sort
    switch (sortBy) {
      case 'name':
        filtered.sort((a, b) => a.testName.localeCompare(b.testName));
        break;
      case 'result':
        filtered.sort((a, b) => (b.passed ? 1 : 0) - (a.passed ? 1 : 0));
        break;
      case 'date':
      default:
        filtered.sort((a, b) => new Date(b.testDate).getTime() - new Date(a.testDate).getTime());
    }

    return filtered;
  }, [results, searchQuery, selectedCategory, sortBy]);

  const groupedResults = useMemo((): GroupedTests => {
    const grouped: GroupedTests = {};
    filteredResults.forEach(r => {
      if (!grouped[r.category]) grouped[r.category] = [];
      grouped[r.category].push(r);
    });
    return grouped;
  }, [filteredResults]);

  const stats = useMemo(() => {
    const total = results.length;
    const passed = results.filter(r => r.passed).length;
    const improving = results.filter(r => r.trend === 'up').length;
    return { total, passed, improving, passRate: total > 0 ? Math.round((passed / total) * 100) : 0 };
  }, [results]);

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case 'up': return <TrendingUp size={14} className="text-green-600" />;
      case 'down': return <TrendingDown size={14} className="text-red-600" />;
      default: return <Activity size={14} className="text-tier-text-tertiary" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('nb-NO', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatValue = (value: number, unit: string) => {
    if (unit === '%') return `${value.toFixed(1)}%`;
    if (unit === 'm') return `${value.toFixed(1)}m`;
    return `${value.toFixed(2)} ${unit}`.trim();
  };

  if (loading) {
    return (
      <AppShellTemplate
        title="Testresultater"
        subtitle="Alle dine resultater"
        helpText="Fullstendig oversikt over alle dine testresultater. Se statistikk for totalt antall tester, bestått-prosent og antall forbedringer. Søk etter tester eller filtrer på kategori (Approach, Putting, Rundt green osv). Sorter etter dato, navn eller resultat. Hver test viser testnummer, navn, dato, resultat-verdi med enhet, krav, fremgangsindikator, bestått/ikke bestått-status og sammenligning med forrige resultat. Bruk for å se total testhistorikk og spore utvikling over tid."
      >
        <section className="mb-6">
          <StateCard
            variant="loading"
            title="Laster testresultater..."
            description="Henter dine data"
          />
        </section>
      </AppShellTemplate>
    );
  }

  return (
    <AppShellTemplate
      title="Testresultater"
      subtitle="Fullstendig oversikt"
      helpText="Fullstendig oversikt over alle dine testresultater. Se statistikk for totalt antall tester, bestått-prosent og antall forbedringer. Søk etter tester eller filtrer på kategori (Approach, Putting, Rundt green osv). Sorter etter dato, navn eller resultat. Hver test viser testnummer, navn, dato, resultat-verdi med enhet, krav, fremgangsindikator, bestått/ikke bestått-status og sammenligning med forrige resultat. Bruk for å se total testhistorikk og spore utvikling over tid."
    >
      {/* Stats Overview */}
      <section className="mb-6">
        <div className="grid grid-cols-3 gap-3">
          <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-tier-border-subtle">
            <Target size={20} className="text-tier-gold" />
            <div>
              <span className="block text-xl font-bold text-tier-navy">{stats.total}</span>
              <span className="block text-xs text-tier-text-tertiary">Tester</span>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-tier-border-subtle">
            <CheckCircle size={20} className="text-green-600" />
            <div>
              <span className="block text-xl font-bold text-tier-navy">{stats.passRate}%</span>
              <span className="block text-xs text-tier-text-tertiary">Bestått</span>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-tier-border-subtle">
            <TrendingUp size={20} className="text-sky-600" />
            <div>
              <span className="block text-xl font-bold text-tier-navy">{stats.improving}</span>
              <span className="block text-xs text-tier-text-tertiary">Forbedret</span>
            </div>
          </div>
        </div>
      </section>

      {/* Search and Filter */}
      <section className="mb-6">
        <div className="mb-3">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-tier-text-tertiary" />
            <input
              type="text"
              placeholder="Søk etter test..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-3 pl-10 pr-3 rounded-lg border border-tier-border-default bg-white text-base text-tier-navy outline-none focus:ring-2 focus:ring-tier-gold/50"
            />
          </div>
        </div>
        <div className="flex justify-between items-center gap-3 flex-wrap">
          <div className="flex gap-2 flex-wrap">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-2 rounded-md border-none text-xs font-medium cursor-pointer transition-all duration-200 ${
                  selectedCategory === cat
                    ? 'bg-tier-gold text-white'
                    : 'bg-tier-surface-subtle text-tier-text-secondary hover:bg-tier-surface-subtle/80'
                }`}
              >
                {cat === 'all' ? 'Alle' : cat}
              </button>
            ))}
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'date' | 'name' | 'result')}
            className="px-3 py-2 rounded-md border border-tier-border-default bg-white text-xs text-tier-navy cursor-pointer"
          >
            <option value="date">Nyeste først</option>
            <option value="name">Navn</option>
            <option value="result">Bestått først</option>
          </select>
        </div>
      </section>

      {/* Results List */}
      {Object.keys(groupedResults).length === 0 ? (
        <section className="mb-6">
          <StateCard
            variant="empty"
            title="Ingen testresultater"
            description="Du har ingen registrerte testresultater enda."
            action={
              <Button onClick={() => navigate('/testing/registrer')}>
                Registrer test
              </Button>
            }
          />
        </section>
      ) : (
        Object.entries(groupedResults).map(([category, tests]) => (
          <section key={category} className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <SectionTitle>{category}</SectionTitle>
              <span className="text-xs font-normal text-tier-text-tertiary">{tests.length} tester</span>
            </div>
            <div className="flex flex-col gap-3">
              {tests.map((test) => (
                <Card key={test.id}>
                  <div className="p-1">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-tier-text-tertiary font-medium">#{test.testNumber}</span>
                          <SubSectionTitle className="m-0">{test.testName}</SubSectionTitle>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-tier-text-tertiary">
                          <Calendar size={12} className="text-tier-text-tertiary" />
                          <span>{formatDate(test.testDate)}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span className={`text-lg font-bold ${test.passed ? 'text-green-600' : 'text-red-600'}`}>
                            {formatValue(test.value, test.unit)}
                          </span>
                          {test.trend && (
                            <div className="flex items-center">
                              {getTrendIcon(test.trend)}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-1 justify-end mt-0.5">
                          <span className="text-xs text-tier-text-tertiary">Krav:</span>
                          <span className="text-xs text-tier-text-secondary font-medium">
                            {test.lowerIsBetter ? '≤' : '≥'} {formatValue(test.requirement, test.unit)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="h-1 bg-tier-surface-subtle rounded-sm overflow-hidden mb-3">
                      <div
                        className={`h-full rounded-sm transition-all duration-300 ${
                          test.passed ? 'bg-green-500' : 'bg-amber-500'
                        }`}
                        style={{ width: `${Math.min(100, (test.value / test.requirement) * 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      {test.passed ? (
                        <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                          <CheckCircle size={14} />
                          Bestått
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-tier-text-tertiary font-medium">
                          <Circle size={14} />
                          Ikke bestått
                        </span>
                      )}
                      {test.previousValue !== undefined && (
                        <span className="text-xs text-tier-text-tertiary">
                          Forrige: {formatValue(test.previousValue, test.unit)}
                        </span>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        ))
      )}

      {/* Error handling */}
      {error && (
        <section className="mb-6">
          <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg text-sm text-red-600">
            <span>{error}</span>
            <Button variant="ghost" size="sm" onClick={fetchTestResults} leftIcon={<RefreshCw size={14} />}>
              Prøv igjen
            </Button>
          </div>
        </section>
      )}
    </AppShellTemplate>
  );
};

function getDemoResults(): TestResult[] {
  return [
    {
      id: '1',
      testId: 't1',
      testName: 'Approach 100m',
      testNumber: 12,
      category: 'Approach',
      value: 8.5,
      unit: 'm',
      requirement: 10,
      lowerIsBetter: true,
      testDate: '2025-12-28',
      passed: true,
      trend: 'up',
      previousValue: 9.2,
    },
    {
      id: '2',
      testId: 't2',
      testName: 'Putting 3m',
      testNumber: 21,
      category: 'Putting',
      value: 72,
      unit: '%',
      requirement: 70,
      lowerIsBetter: false,
      testDate: '2025-12-27',
      passed: true,
      trend: 'up',
      previousValue: 68,
    },
    {
      id: '3',
      testId: 't3',
      testName: 'Chipping',
      testNumber: 31,
      category: 'Rundt green',
      value: 4.2,
      unit: 'm',
      requirement: 4,
      lowerIsBetter: true,
      testDate: '2025-12-26',
      passed: false,
      trend: 'down',
      previousValue: 3.8,
    },
    {
      id: '4',
      testId: 't4',
      testName: 'Bunker',
      testNumber: 32,
      category: 'Rundt green',
      value: 5.1,
      unit: 'm',
      requirement: 6,
      lowerIsBetter: true,
      testDate: '2025-12-25',
      passed: true,
      trend: 'stable',
      previousValue: 5.0,
    },
  ];
}

export default TestResultsPage;
