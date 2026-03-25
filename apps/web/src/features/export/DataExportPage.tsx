/**
 * Data Export Page
 * Download reports and data exports
 */

import React, { useState } from 'react';
import { Download, FileText, Table, Calendar, TrendingUp } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Card from '../../ui/primitives/Card';
import Button from '../../ui/primitives/Button';
import PageHeader from '../../components/layout/PageHeader';
import apiClient from '../../services/apiClient';
import { SubSectionTitle, CardTitle } from '../../components/typography';

const DataExportPage: React.FC = () => {
  const { user } = useAuth();
  const playerId = user?.playerId || user?.id;
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  const handleExport = async (exportType: string, filename: string) => {
    try {
      setLoading({ ...loading, [exportType]: true });

      let url = '';
      switch (exportType) {
        case 'player-report':
          url = `/export/player/${playerId}/report`;
          break;
        case 'test-results':
          url = `/export/player/${playerId}/test-results`;
          break;
        case 'training-sessions':
          url = `/export/player/${playerId}/training-sessions`;
          break;
        case 'statistics':
          url = `/export/player/${playerId}/statistics`;
          break;
        default:
          throw new Error('Unknown export type');
      }

      const response = await apiClient.get(url, { responseType: 'blob' });

      // Create blob and download
      const blob = new Blob([response.data]);
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error('Export error:', err);
      alert('Kunne ikke eksportere data');
    } finally {
      setLoading({ ...loading, [exportType]: false });
    }
  };

  const exports = [
    {
      id: 'player-report',
      title: 'Spillerrapport (PDF)',
      description: 'Komplett rapport med fremgang, tester, mål og badges',
      icon: <FileText size={24} className="text-tier-info" />,
      filename: `spillerrapport-${new Date().toISOString().split('T')[0]}.pdf`,
      color: 'info',
    },
    {
      id: 'test-results',
      title: 'Testresultater (Excel)',
      description: 'Alle testresultater med detaljer og utviklingskurver',
      icon: <TrendingUp size={24} className="text-tier-success" />,
      filename: `testresultater-${new Date().toISOString().split('T')[0]}.xlsx`,
      color: 'success',
    },
    {
      id: 'training-sessions',
      title: 'Treningsøkter (Excel)',
      description: 'Historikk over alle treningsøkter med notater',
      icon: <Calendar size={24} className="text-tier-warning" />,
      filename: `treningsoekter-${new Date().toISOString().split('T')[0]}.xlsx`,
      color: 'warning',
    },
    {
      id: 'statistics',
      title: 'Statistikk (Excel)',
      description: 'Detaljert statistikk og data for analyse',
      icon: <Table size={24} className="text-tier-navy" />,
      filename: `statistikk-${new Date().toISOString().split('T')[0]}.xlsx`,
      color: 'navy',
    },
  ];

  return (
    <div className="min-h-screen bg-tier-surface-base p-6">
      <div className="max-w-4xl mx-auto">
        <PageHeader
          title="Eksporter data"
          subtitle="Last ned dine data som PDF eller Excel"
          helpText=""
          actions={null}
        />

        <div className="grid gap-4">
          {exports.map((exp) => (
            <Card key={exp.id}>
              <div className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg bg-tier-${exp.color}-light`}>
                    {exp.icon}
                  </div>
                  <div>
                    <SubSectionTitle style={{ marginBottom: 4 }}>{exp.title}</SubSectionTitle>
                    <p className="text-sm text-tier-text-secondary">{exp.description}</p>
                  </div>
                </div>
                <Button
                  variant="primary"
                  leftIcon={<Download size={16} />}
                  onClick={() => handleExport(exp.id, exp.filename)}
                  disabled={loading[exp.id]}
                >
                  {loading[exp.id] ? 'Eksporterer...' : 'Last ned'}
                </Button>
              </div>
            </Card>
          ))}
        </div>

        <Card>
          <div className="p-6 bg-tier-info-light border-l-4 border-tier-info">
            <div className="flex items-start gap-3">
              <FileText size={20} className="text-tier-info flex-shrink-0 mt-1" />
              <div>
                <CardTitle style={{ marginBottom: 4 }}>Om dataeksport</CardTitle>
                <p className="text-sm text-tier-text-secondary">
                  Alle dine data tilhører deg. Du kan når som helst eksportere komplett historikk av
                  treninger, tester, mål og fremgang. Filene er i standardformater (PDF/Excel) og kan
                  brukes hvor som helst.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DataExportPage;
