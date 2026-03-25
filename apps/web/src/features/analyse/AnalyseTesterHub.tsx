/**
 * ============================================================
 * ANALYSE TESTER HUB - Tests hub with 3 tabs
 * ============================================================
 *
 * This hub consolidates:
 * - /utvikling/testresultater → Tab: Resultater
 * - /utvikling/krav → Tab: Krav
 * - (new) → Tab: Oversikt
 *
 * ============================================================
 */

import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  BarChart3,
  FileText,
  Target
} from 'lucide-react';
import { SubSectionTitle, CardTitle } from '../../components/typography/Headings';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine
} from 'recharts';
import { PageHeader } from '../../components/layout/PageHeader';

// Tab type
type TesterTab = 'oversikt' | 'resultater' | 'krav';

// Tab components
function OversiktTab() {
  return (
    <div className="space-y-6">
      {/* Test Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-tier-border-default p-6">
          <div className="text-sm text-tier-text-secondary mb-1">Siste test</div>
          <div className="text-3xl font-bold text-tier-navy mb-2">85.5%</div>
          <div className="text-xs text-tier-success flex items-center gap-1">
            <span>Kategori C</span>
            <span className="text-tier-text-secondary">• 2 dager siden</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-tier-border-default p-6">
          <div className="text-sm text-tier-text-secondary mb-1">Nåværende kategori</div>
          <div className="text-3xl font-bold text-tier-navy mb-2">C</div>
          <div className="text-xs text-tier-text-secondary">92% fremgang til B</div>
        </div>

        <div className="bg-white rounded-xl border border-tier-border-default p-6">
          <div className="text-sm text-tier-text-secondary mb-1">Tester i år</div>
          <div className="text-3xl font-bold text-tier-navy mb-2">18</div>
          <div className="text-xs text-tier-text-secondary">Gjennomsnitt: 82.3%</div>
        </div>
      </div>

      {/* Category Progress */}
      <div className="bg-white rounded-xl border border-tier-border-default p-6">
        <SubSectionTitle style={{ marginBottom: 0 }} className="text-lg font-semibold text-tier-navy mb-4">Fremgang mot kategori B</SubSectionTitle>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-tier-navy">Putting (P1-P5)</span>
              <span className="text-sm text-tier-success">5/5 ✓</span>
            </div>
            <div className="w-full bg-tier-surface-base rounded-full h-2">
              <div className="bg-tier-success h-2 rounded-full" style={{ width: '100%' }}></div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-tier-navy">Chipping (CH1-CH5)</span>
              <span className="text-sm text-tier-info">4/5</span>
            </div>
            <div className="w-full bg-tier-surface-base rounded-full h-2">
              <div className="bg-tier-info h-2 rounded-full" style={{ width: '80%' }}></div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-tier-navy">Pitching (PI1-PI5)</span>
              <span className="text-sm text-tier-warning">3/5</span>
            </div>
            <div className="w-full bg-tier-surface-base rounded-full h-2">
              <div className="bg-tier-warning h-2 rounded-full" style={{ width: '60%' }}></div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-tier-navy">Full Swing (F1-F5)</span>
              <span className="text-sm text-tier-error">2/5</span>
            </div>
            <div className="w-full bg-tier-surface-base rounded-full h-2">
              <div className="bg-tier-error h-2 rounded-full" style={{ width: '40%' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Tests */}
      <div className="bg-white rounded-xl border border-tier-border-default p-6">
        <SubSectionTitle style={{ marginBottom: 0 }} className="text-lg font-semibold text-tier-navy mb-4">Siste tester</SubSectionTitle>
        <div className="space-y-3">
          <div className="flex items-center gap-4 p-4 border border-tier-border-default rounded-lg hover:bg-tier-surface-base transition-colors cursor-pointer">
            <div className="w-12 h-12 bg-tier-success-light rounded-full flex items-center justify-center">
              <Target size={20} className="text-tier-success" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-tier-navy">CH3 - Chipping 20-30 meter</div>
              <div className="text-xs text-tier-text-secondary">Kategori C • 2 dager siden</div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-tier-success">85.5%</div>
              <div className="text-xs text-tier-text-secondary">Bestått</div>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 border border-tier-border-default rounded-lg hover:bg-tier-surface-base transition-colors cursor-pointer">
            <div className="w-12 h-12 bg-tier-info-light rounded-full flex items-center justify-center">
              <Target size={20} className="text-tier-info" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-tier-navy">P2 - Putting 3 meter</div>
              <div className="text-xs text-tier-text-secondary">Kategori C • 1 uke siden</div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-tier-info">78.2%</div>
              <div className="text-xs text-tier-text-secondary">Bestått</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-4">
        <Link
          to="/trening/testing/registrer"
          className="flex-1 bg-tier-info text-white rounded-xl p-4 text-center font-medium hover:bg-tier-info-dark transition-colors"
        >
          + Registrer ny test
        </Link>
        <Link
          to="/analyse/tester?tab=krav"
          className="flex-1 bg-white border border-tier-border-default text-tier-navy rounded-xl p-4 text-center font-medium hover:bg-tier-surface-base transition-colors"
        >
          Se krav for neste kategori
        </Link>
      </div>
    </div>
  );
}

function ResultaterTab() {
  // Mock data for Test Performance chart
  const mockTestPerformance = [
    { date: 'Aug', score: 72.5 },
    { date: 'Sep', score: 76.8 },
    { date: 'Okt', score: 78.3 },
    { date: 'Nov', score: 81.2 },
    { date: 'Des', score: 83.5 },
    { date: 'Jan', score: 85.5 },
  ];

  return (
    <div className="space-y-6">
      {/* Filter and Sort */}
      <div className="bg-white rounded-xl border border-tier-border-default p-6">
        <div className="flex items-center gap-4">
          <select className="flex-1 px-4 py-2 border border-tier-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-tier-info">
            <option>Alle kategorier</option>
            <option>Putting</option>
            <option>Chipping</option>
            <option>Pitching</option>
            <option>Full Swing</option>
          </select>

          <select className="flex-1 px-4 py-2 border border-tier-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-tier-info">
            <option>Siste 6 måneder</option>
            <option>Siste måned</option>
            <option>Siste år</option>
            <option>Alle</option>
          </select>

          <select className="flex-1 px-4 py-2 border border-tier-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-tier-info">
            <option>Nyeste først</option>
            <option>Eldste først</option>
            <option>Høyeste score</option>
            <option>Laveste score</option>
          </select>
        </div>
      </div>

      {/* Test Results Table */}
      <div className="bg-white rounded-xl border border-tier-border-default p-6 overflow-x-auto">
        <SubSectionTitle style={{ marginBottom: 0 }} className="text-lg font-semibold text-tier-navy mb-4">Testresultater</SubSectionTitle>
        <table className="w-full">
          <thead>
            <tr className="border-b border-tier-border-default">
              <th className="text-left py-3 px-4 text-sm font-medium text-tier-text-secondary">Dato</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-tier-text-secondary">Test</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-tier-text-secondary">Kategori</th>
              <th className="text-center py-3 px-4 text-sm font-medium text-tier-text-secondary">Score</th>
              <th className="text-center py-3 px-4 text-sm font-medium text-tier-text-secondary">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-tier-border-default hover:bg-tier-surface-base">
              <td className="py-3 px-4 text-sm text-tier-navy">25. des 2024</td>
              <td className="py-3 px-4 text-sm text-tier-navy">CH3 - Chipping 20-30m</td>
              <td className="py-3 px-4 text-sm text-tier-text-secondary">C</td>
              <td className="py-3 px-4 text-center text-sm font-medium text-tier-navy">85.5%</td>
              <td className="py-3 px-4 text-center">
                <span className="px-3 py-1 bg-tier-success-light text-tier-success text-xs font-medium rounded-full">
                  Bestått
                </span>
              </td>
            </tr>
            <tr className="border-b border-tier-border-default hover:bg-tier-surface-base">
              <td className="py-3 px-4 text-sm text-tier-navy">18. des 2024</td>
              <td className="py-3 px-4 text-sm text-tier-navy">P2 - Putting 3 meter</td>
              <td className="py-3 px-4 text-sm text-tier-text-secondary">C</td>
              <td className="py-3 px-4 text-center text-sm font-medium text-tier-navy">78.2%</td>
              <td className="py-3 px-4 text-center">
                <span className="px-3 py-1 bg-tier-success-light text-tier-success text-xs font-medium rounded-full">
                  Bestått
                </span>
              </td>
            </tr>
            <tr className="border-b border-tier-border-default hover:bg-tier-surface-base">
              <td className="py-3 px-4 text-sm text-tier-navy">12. des 2024</td>
              <td className="py-3 px-4 text-sm text-tier-navy">F1 - Driver</td>
              <td className="py-3 px-4 text-sm text-tier-text-secondary">C</td>
              <td className="py-3 px-4 text-center text-sm font-medium text-tier-navy">62.3%</td>
              <td className="py-3 px-4 text-center">
                <span className="px-3 py-1 bg-tier-error-light text-tier-error text-xs font-medium rounded-full">
                  Ikke bestått
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Performance Chart */}
      <div className="bg-white rounded-xl border border-tier-border-default p-6">
        <SubSectionTitle style={{ marginBottom: 0 }} className="text-lg font-semibold text-tier-navy mb-4">Testprestasjoner over tid</SubSectionTitle>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={mockTestPerformance}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--tier-border-default)" />
            <XAxis dataKey="date" stroke="var(--tier-text-secondary)" style={{ fontSize: 12 }} />
            <YAxis domain={[0, 100]} stroke="var(--tier-text-secondary)" style={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <ReferenceLine
              y={75}
              stroke="var(--tier-warning)"
              strokeWidth={2}
              strokeDasharray="5 5"
              label={{ value: 'Passing Grade (75%)', position: 'insideTopRight' }}
            />
            <Line
              type="monotone"
              dataKey="score"
              name="Test Score"
              stroke="var(--tier-info)"
              strokeWidth={3}
              dot={{ fill: 'var(--tier-info)', r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function KravTab() {
  return (
    <div className="space-y-6">
      {/* Category Selector */}
      <div className="bg-white rounded-xl border border-tier-border-default p-6">
        <SubSectionTitle style={{ marginBottom: 0 }} className="text-lg font-semibold text-tier-navy mb-4">Velg kategori</SubSectionTitle>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-tier-surface-base text-tier-text-secondary rounded-lg text-sm font-medium hover:bg-tier-info-light">
            D
          </button>
          <button className="px-4 py-2 bg-tier-surface-base text-tier-text-secondary rounded-lg text-sm font-medium hover:bg-tier-info-light">
            C
          </button>
          <button className="px-4 py-2 bg-tier-info text-white rounded-lg text-sm font-medium">
            B (Neste)
          </button>
          <button className="px-4 py-2 bg-tier-surface-base text-tier-text-secondary rounded-lg text-sm font-medium hover:bg-tier-info-light">
            A
          </button>
          <button className="px-4 py-2 bg-tier-surface-base text-tier-text-secondary rounded-lg text-sm font-medium hover:bg-tier-info-light">
            Elite
          </button>
        </div>
      </div>

      {/* Requirements for Category B */}
      <div className="bg-white rounded-xl border border-tier-border-default p-6">
        <div className="flex items-center justify-between mb-6">
          <SubSectionTitle style={{ marginBottom: 0 }} className="text-lg font-semibold text-tier-navy">Krav for kategori B</SubSectionTitle>
          <span className="text-sm text-tier-text-secondary">18/25 krav oppfylt (72%)</span>
        </div>

        {/* Putting Requirements */}
        <div className="mb-6">
          <CardTitle style={{ marginBottom: 0 }} className="text-md font-semibold text-tier-navy mb-3">Putting (P1-P5)</CardTitle>
          <div className="space-y-2">
            <div className="flex items-center gap-3 p-3 bg-tier-success-light border border-tier-success rounded-lg">
              <span className="text-tier-success">✓</span>
              <div className="flex-1">
                <div className="text-sm font-medium text-tier-navy">P1 - Putting 1 meter</div>
                <div className="text-xs text-tier-text-secondary">Krav: 85% • Din score: 92%</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-tier-success-light border border-tier-success rounded-lg">
              <span className="text-tier-success">✓</span>
              <div className="flex-1">
                <div className="text-sm font-medium text-tier-navy">P2 - Putting 3 meter</div>
                <div className="text-xs text-tier-text-secondary">Krav: 75% • Din score: 78%</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-tier-surface-base border border-tier-border-default rounded-lg">
              <span className="text-tier-text-secondary">○</span>
              <div className="flex-1">
                <div className="text-sm font-medium text-tier-navy">P3 - Putting 5 meter</div>
                <div className="text-xs text-tier-text-secondary">Krav: 65% • Ikke testet ennå</div>
              </div>
            </div>
          </div>
        </div>

        {/* Chipping Requirements */}
        <div className="mb-6">
          <CardTitle style={{ marginBottom: 0 }} className="text-md font-semibold text-tier-navy mb-3">Chipping (CH1-CH5)</CardTitle>
          <div className="space-y-2">
            <div className="flex items-center gap-3 p-3 bg-tier-success-light border border-tier-success rounded-lg">
              <span className="text-tier-success">✓</span>
              <div className="flex-1">
                <div className="text-sm font-medium text-tier-navy">CH1 - Chipping 5-10 meter</div>
                <div className="text-xs text-tier-text-secondary">Krav: 80% • Din score: 88%</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-tier-error-light border border-tier-error rounded-lg">
              <span className="text-tier-error">✗</span>
              <div className="flex-1">
                <div className="text-sm font-medium text-tier-navy">CH2 - Chipping 10-20 meter</div>
                <div className="text-xs text-tier-text-secondary">Krav: 75% • Din score: 68%</div>
              </div>
            </div>
          </div>
        </div>

        {/* Full Swing Requirements */}
        <div>
          <CardTitle style={{ marginBottom: 0 }} className="text-md font-semibold text-tier-navy mb-3">Full Swing (F1-F5)</CardTitle>
          <div className="space-y-2">
            <div className="flex items-center gap-3 p-3 bg-tier-surface-base border border-tier-border-default rounded-lg">
              <span className="text-tier-text-secondary">○</span>
              <div className="flex-1">
                <div className="text-sm font-medium text-tier-navy">F1 - Driver accuracy</div>
                <div className="text-xs text-tier-text-secondary">Krav: 70% • Ikke testet ennå</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Box */}
      <div className="bg-tier-warning-light border border-tier-warning rounded-xl p-6">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 bg-tier-warning rounded-full flex items-center justify-center flex-shrink-0">
            <Target size={24} className="text-white" />
          </div>
          <div>
            <CardTitle style={{ marginBottom: 0 }} className="text-sm font-semibold text-tier-navy mb-1">Fokusområder for kategori B</CardTitle>
            <p className="text-sm text-tier-text-secondary mb-3">
              Du mangler 7 krav for å kvalifisere til kategori B. Prioriter testing på:
            </p>
            <ul className="text-sm text-tier-text-secondary space-y-1">
              <li>• CH2 - Chipping 10-20 meter (trenger 75%, har 68%)</li>
              <li>• P3 - Putting 5 meter (ikke testet)</li>
              <li>• F1 - Driver accuracy (ikke testet)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AnalyseTesterHub() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab') as TesterTab | null;
  const [activeTab, setActiveTab] = useState<TesterTab>(tabParam || 'oversikt');

  // Update URL when tab changes
  useEffect(() => {
    if (tabParam && tabParam !== activeTab) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const handleTabChange = (tab: TesterTab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const tabs: { id: TesterTab; label: string; icon: React.ReactNode }[] = [
    { id: 'oversikt', label: 'Oversikt', icon: <BarChart3 size={16} /> },
    { id: 'resultater', label: 'Resultater', icon: <FileText size={16} /> },
    { id: 'krav', label: 'Krav', icon: <Target size={16} /> },
  ];

  return (
    <div className="min-h-screen bg-tier-surface-base p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <PageHeader
          title="Tester"
          subtitle="Testresultater, historikk og kategori-krav"
          helpText=""
          actions={null}
        />

        {/* Tabs */}
        <div className="bg-white rounded-xl border border-tier-border-default mb-6">
          <div className="flex border-b border-tier-border-default overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex-1 min-w-fit flex items-center justify-center gap-2 px-6 py-4 text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'text-tier-info border-b-2 border-tier-info bg-tier-info-light'
                    : 'text-tier-text-secondary hover:text-tier-navy hover:bg-tier-surface-base'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'oversikt' && <OversiktTab />}
          {activeTab === 'resultater' && <ResultaterTab />}
          {activeTab === 'krav' && <KravTab />}
        </div>
      </div>
    </div>
  );
}
