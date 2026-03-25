import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { PageHeader } from '../../ui/raw-blocks';
import { SectionTitle } from '../../ui/primitives/typography';

const TRAINING_AREAS = [
  { value: 'TEE', label: 'Tee' },
  { value: 'INN200', label: 'Inn 200m' },
  { value: 'INN150', label: 'Inn 150m' },
  { value: 'INN100', label: 'Inn 100m' },
  { value: 'INN50', label: 'Inn 50m' },
  { value: 'CHIP', label: 'Chip' },
  { value: 'PITCH', label: 'Pitch' },
  { value: 'LOB', label: 'Lob' },
  { value: 'BUNKER', label: 'Bunker' },
  { value: 'PUTT0-3', label: 'Putt 0-3m' },
  { value: 'PUTT3-8', label: 'Putt 3-8m' },
  { value: 'PUTT8-15', label: 'Putt 8-15m' },
  { value: 'PUTT15-25', label: 'Putt 15-25m' },
  { value: 'PUTT25-40', label: 'Putt 25-40m' },
  { value: 'PUTT40+', label: 'Putt 40m+' },
  { value: 'SPILL', label: 'Spill' },
];

interface ProgressStats {
  trainingArea: string;
  period: {
    startDate: string;
    endDate: string;
  };
  totalSessions: number;
  averageSuccessRate: number | null;
  averageConsistencyScore: number | null;
  improvement: {
    successRate: number | null;
    consistencyScore: number | null;
  };
  recentPerformances: Array<{
    date: string;
    successRate: number | null;
    consistencyScore: number | null;
  }>;
  nextLevelRequirements?: {
    currentLevel: string;
    nextLevel: string;
    requirements: {
      successRate: number;
      consistencyScore: number;
      description: string;
    };
  };
}

export const ProgressTrackingView: React.FC = () => {
  const [selectedArea, setSelectedArea] = useState<string>('TEE');
  const [startDate, setStartDate] = useState<string>(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 3); // Default to last 3 months
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [stats, setStats] = useState<ProgressStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, [selectedArea, startDate, endDate]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get('/training-area-performance/progress/stats', {
        params: {
          trainingArea: selectedArea,
          startDate,
          endDate,
        },
      });

      setStats(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Kunne ikke hente statistikk');
      console.error('Error fetching progress stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('nb-NO', { day: '2-digit', month: '2-digit' });
  };

  const getImprovementColor = (value: number | null) => {
    if (value === null || value === 0) return 'text-gray-600';
    return value > 0 ? 'text-green-600' : 'text-red-600';
  };

  const getImprovementIcon = (value: number | null) => {
    if (value === null || value === 0) return '→';
    return value > 0 ? '↑' : '↓';
  };

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Laster statistikk...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <PageHeader
        title="Treningsområde Statistikk"
        subtitle="Følg din progresjon og utvikling over tid"
        helpText="Detaljert statistikk for treningsområder (TEE, INN200-50, CHIP/PITCH/LOB/BUNKER, PUTT 0-3m til 40m+, SPILL). Velg område og tidsperiode (fra-til dato). Se totalt økter, gjennomsnittlig suksessrate, forbedring over tid, graf med progresjon, neste nivåkrav. Bruk for å spore fremgang i spesifikke områder og planlegge forbedring."
      />

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <SectionTitle style={{ marginBottom: 0 }}>Filtrer statistikk</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="training-area" className="block text-sm font-medium text-gray-700 mb-2">
              Treningsområde
            </label>
            <select
              id="training-area"
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {TRAINING_AREAS.map((area) => (
                <option key={area.value} value={area.value}>
                  {area.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 mb-2">
              Fra dato
            </label>
            <input
              type="date"
              id="start-date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 mb-2">
              Til dato
            </label>
            <input
              type="date"
              id="end-date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          {error}
        </div>
      )}

      {stats && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm font-medium text-gray-600 mb-1">Totalt økter</div>
              <div className="text-3xl font-bold text-gray-900">{stats.totalSessions}</div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm font-medium text-gray-600 mb-1">Gjennomsnitt suksessrate</div>
              <div className="text-3xl font-bold text-blue-600">
                {stats.averageSuccessRate !== null ? `${stats.averageSuccessRate.toFixed(1)}%` : 'N/A'}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm font-medium text-gray-600 mb-1">Forbedring suksessrate</div>
              <div className={`text-3xl font-bold ${getImprovementColor(stats.improvement.successRate)}`}>
                {getImprovementIcon(stats.improvement.successRate)}{' '}
                {stats.improvement.successRate !== null
                  ? `${Math.abs(stats.improvement.successRate).toFixed(1)}%`
                  : 'N/A'}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm font-medium text-gray-600 mb-1">Gjennomsnitt konsistens</div>
              <div className="text-3xl font-bold text-purple-600">
                {stats.averageConsistencyScore !== null
                  ? `${stats.averageConsistencyScore.toFixed(1)}/10`
                  : 'N/A'}
              </div>
            </div>
          </div>

          {/* Charts */}
          {stats.recentPerformances.length > 0 && (
            <>
              {/* Success Rate Trend */}
              <div className="bg-white rounded-lg shadow p-6">
                <SectionTitle style={{ marginBottom: 0 }}>Suksessrate over tid</SectionTitle>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={stats.recentPerformances}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={formatDate}
                      label={{ value: 'Dato', position: 'insideBottom', offset: -5 }}
                    />
                    <YAxis
                      label={{ value: 'Suksessrate (%)', angle: -90, position: 'insideLeft' }}
                      domain={[0, 100]}
                    />
                    <Tooltip
                      formatter={(value: any) => [`${value?.toFixed(1)}%`, 'Suksessrate']}
                      labelFormatter={(label) => `Dato: ${formatDate(label)}`}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="successRate"
                      stroke="rgb(var(--status-info))"
                      strokeWidth={2}
                      name="Suksessrate"
                      dot={{ fill: 'rgb(var(--status-info))', r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Consistency Score Trend */}
              <div className="bg-white rounded-lg shadow p-6">
                <SectionTitle style={{ marginBottom: 0 }}>Konsistensscore over tid</SectionTitle>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.recentPerformances}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={formatDate}
                      label={{ value: 'Dato', position: 'insideBottom', offset: -5 }}
                    />
                    <YAxis
                      label={{ value: 'Konsistensscore (1-10)', angle: -90, position: 'insideLeft' }}
                      domain={[0, 10]}
                    />
                    <Tooltip
                      formatter={(value: any) => [`${value}/10`, 'Konsistensscore']}
                      labelFormatter={(label) => `Dato: ${formatDate(label)}`}
                    />
                    <Legend />
                    <Bar
                      dataKey="consistencyScore"
                      fill="rgb(var(--category-j))"
                      name="Konsistensscore"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </>
          )}

          {/* Recent Performances Table */}
          {stats.recentPerformances.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <SectionTitle style={{ marginBottom: 0 }}>Siste økter</SectionTitle>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Dato
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Suksessrate
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Konsistensscore
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {stats.recentPerformances.map((performance, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(performance.date).toLocaleDateString('nb-NO', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {performance.successRate !== null
                            ? `${performance.successRate.toFixed(1)}%`
                            : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {performance.consistencyScore !== null
                            ? `${performance.consistencyScore}/10`
                            : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Next Level Requirements */}
          {stats.nextLevelRequirements && (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg shadow p-6 border border-blue-200">
              <SectionTitle style={{ marginBottom: 0 }}>Neste nivå krav</SectionTitle>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Nåværende nivå:</span>
                  <span className="text-lg font-bold text-blue-600">
                    {stats.nextLevelRequirements.currentLevel}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Neste nivå:</span>
                  <span className="text-lg font-bold text-purple-600">
                    {stats.nextLevelRequirements.nextLevel}
                  </span>
                </div>
                <div className="border-t border-gray-300 pt-3 mt-3">
                  <p className="text-sm font-medium text-gray-700 mb-2">Krav for å nå neste nivå:</p>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                      Suksessrate: {stats.nextLevelRequirements.requirements.successRate}%
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                      Konsistensscore: {stats.nextLevelRequirements.requirements.consistencyScore}/10
                    </li>
                  </ul>
                  <p className="mt-3 text-sm text-gray-700 italic">
                    {stats.nextLevelRequirements.requirements.description}
                  </p>
                </div>
              </div>
            </div>
          )}

          {stats.totalSessions === 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
              <p className="text-yellow-800">
                Ingen treningsøkter funnet for valgt periode. Logg din første økt for å se statistikk!
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};
