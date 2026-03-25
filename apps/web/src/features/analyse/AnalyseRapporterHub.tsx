/**
 * ============================================================
 * ANALYSE RAPPORTER HUB - Progress Reports hub
 * ============================================================
 *
 * This hub wraps the existing ProgressReportsPage component
 * Old URL: /utvikling/rapporter → New URL: /analyse/rapporter
 *
 * ============================================================
 */

import React from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { SubSectionTitle, CardTitle } from '../../components/typography/Headings';

export default function AnalyseRapporterHub() {
  return (
    <div className="min-h-screen bg-tier-surface-base p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <PageHeader
          title="Fremdriftsrapporter"
          subtitle="Tilbakemeldinger og rapporter fra dine trenere"
          helpText="Her finner du månedlige og kvartalsvise rapporter fra trenerteamet ditt med vurderinger, anbefalinger og fremtidige mål."
          actions={null}
        />

        {/* Recent Reports */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div className="bg-white rounded-xl border border-tier-border-default p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-tier-info-light rounded-full flex items-center justify-center">
                <span className="text-2xl">[Doc]</span>
              </div>
              <span className="text-xs text-tier-text-secondary">3 dager siden</span>
            </div>
            <SubSectionTitle style={{ marginBottom: 0 }} className="text-lg font-semibold text-tier-navy mb-2">Desember 2024 - Månedsrapport</SubSectionTitle>
            <p className="text-sm text-tier-text-secondary mb-4">
              Vurdering av din utvikling i desember med fokus på putting og short game forbedringer.
            </p>
            <div className="flex items-center gap-4 text-xs text-tier-text-secondary">
              <span>8 tester</span>
              <span>6 maal evaluert</span>
              <span>Trener: Anders</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-tier-border-default p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-tier-success-light rounded-full flex items-center justify-center">
                <span className="text-2xl">[Doc]</span>
              </div>
              <span className="text-xs text-tier-text-secondary">5 uker siden</span>
            </div>
            <SubSectionTitle style={{ marginBottom: 0 }} className="text-lg font-semibold text-tier-navy mb-2">Q4 2024 - Kvartalsrapport</SubSectionTitle>
            <p className="text-sm text-tier-text-secondary mb-4">
              Oppsummering av fjerde kvartal med betydelig fremgang i handicap og teknisk utvikling.
            </p>
            <div className="flex items-center gap-4 text-xs text-tier-text-secondary">
              <span>24 tester</span>
              <span>12 maal evaluert</span>
              <span>Trener: Anders</span>
            </div>
          </div>
        </div>

        {/* All Reports Table */}
        <div className="mt-8 bg-white rounded-xl border border-tier-border-default p-6">
          <SubSectionTitle style={{ marginBottom: 0 }} className="text-lg font-semibold text-tier-navy mb-4">Alle rapporter</SubSectionTitle>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-tier-border-default">
                  <th className="text-left py-3 px-4 text-sm font-medium text-tier-text-secondary">Dato</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-tier-text-secondary">Type</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-tier-text-secondary">Periode</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-tier-text-secondary">Trener</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-tier-text-secondary">Handlinger</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-tier-border-default hover:bg-tier-surface-base">
                  <td className="py-3 px-4 text-sm text-tier-navy">25. des 2024</td>
                  <td className="py-3 px-4 text-sm text-tier-navy">Måned</td>
                  <td className="py-3 px-4 text-sm text-tier-text-secondary">Desember 2024</td>
                  <td className="py-3 px-4 text-sm text-tier-text-secondary">Anders</td>
                  <td className="py-3 px-4 text-right">
                    <button className="text-tier-info hover:text-tier-info-dark text-sm font-medium">
                      Les →
                    </button>
                  </td>
                </tr>
                <tr className="border-b border-tier-border-default hover:bg-tier-surface-base">
                  <td className="py-3 px-4 text-sm text-tier-navy">1. des 2024</td>
                  <td className="py-3 px-4 text-sm text-tier-navy">Kvartal</td>
                  <td className="py-3 px-4 text-sm text-tier-text-secondary">Q4 2024</td>
                  <td className="py-3 px-4 text-sm text-tier-text-secondary">Anders</td>
                  <td className="py-3 px-4 text-right">
                    <button className="text-tier-info hover:text-tier-info-dark text-sm font-medium">
                      Les →
                    </button>
                  </td>
                </tr>
                <tr className="border-b border-tier-border-default hover:bg-tier-surface-base">
                  <td className="py-3 px-4 text-sm text-tier-navy">28. nov 2024</td>
                  <td className="py-3 px-4 text-sm text-tier-navy">Måned</td>
                  <td className="py-3 px-4 text-sm text-tier-text-secondary">November 2024</td>
                  <td className="py-3 px-4 text-sm text-tier-text-secondary">Anders</td>
                  <td className="py-3 px-4 text-right">
                    <button className="text-tier-info hover:text-tier-info-dark text-sm font-medium">
                      Les →
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Info box */}
        <div className="mt-6 bg-tier-info-light border border-tier-info rounded-xl p-6">
          <div className="flex items-start gap-3">
            <span className="text-2xl">[Info]</span>
            <div>
              <CardTitle style={{ marginBottom: 0 }} className="text-sm font-semibold text-tier-navy mb-1">Rapporteringsplan</CardTitle>
              <p className="text-sm text-tier-text-secondary">
                Du mottar månedsrapporter ved slutten av hver måned og kvartalsrapporter hvert tredje måned.
                Rapportene oppsummerer din utvikling, evaluerer måloppnåelse og setter nye fokusområder.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
