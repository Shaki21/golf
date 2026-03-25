/**
 * StatsPage Component
 * Design System v3.0 - Premium Light
 *
 * MIGRATED TO PAGE ARCHITECTURE - Minimal inline styles (dynamic colors)
 *
 * Phase 1: Demo mode only (DataGolf integration kommer i Fase 2)
 * Phase 2: Live API integration
 *
 * Key changes from original:
 * - Feature flag gates API calls (no "error" state in Phase 1)
 * - Inline info banner instead of huge warning icon
 * - Errors logged once with status code
 * - Dashboard always renders with demo data fallback
 */

import React, { useEffect, useMemo, useState } from "react";
import { SectionTitle } from '../../components/typography/Headings';
import { AICoachGuide, GUIDE_PRESETS } from '../ai-coach';
import { useAuth } from '../../contexts/AuthContext';
import PeerComparisonWidget from '../../components/widgets/PeerComparisonWidget';
import TrendsContent from '../player-stats/TrendsContent';
import BenchmarkContent from '../player-stats/BenchmarkContent';
import PlayerStatsContent from '../player-stats/PlayerStatsContent';

// Design System color mapping - using CSS variables
const colors = {
  border: 'rgb(var(--border-color))',
  borderSubtle: 'rgb(var(--border-subtle))',
  bgWhite: 'var(--surface-card)',
  bgSurface: 'rgb(var(--gray-100))',
  bgDefault: 'var(--tier-white)',
  ink: 'var(--tier-navy)',
  steel: 'var(--text-secondary)',
  success: 'rgb(var(--status-success))',
  warning: 'rgb(var(--status-warning))',
  primary: 'var(--tier-navy)',
  snow: 'rgb(var(--gray-100))',
};

// ============================================================================
// FEATURE FLAGS
// ============================================================================
const FEATURE_FLAGS = {
  // Set to true when DataGolf API is ready (Phase 2)
  ENABLE_LIVE_API: false,
  // Show debug info in console
  DEBUG_MODE: process.env.NODE_ENV === 'development',
};

// API config (only used when ENABLE_LIVE_API is true)
const API_CONFIG = {
  baseUrl: process.env.REACT_APP_API_URL || '',
  statsEndpoint: '/api/v1/datagolf/compare',
};

type Tour = "PGA" | "LPGA" | "DP";

// Test options for peer comparison
const TEST_OPTIONS = [
  { value: 1, label: 'Driver Klubbhodehastighet' },
  { value: 2, label: '7-Jern Klubbhodehastighet' },
  { value: 3, label: 'Driver Carry-avstand' },
  { value: 4, label: 'PEI - Presisjon' },
  { value: 5, label: 'Fairway-treff' },
  { value: 6, label: 'GIR Simulering' },
  { value: 7, label: 'Bunker Save' },
  { value: 8, label: 'Putt 1.2m' },
  { value: 9, label: 'Putt 2.4m' },
  { value: 10, label: 'Putt 3.6m' },
  { value: 11, label: 'Putt 6m' },
  { value: 12, label: 'Scrambling' },
  { value: 13, label: 'Up and Down' },
  { value: 14, label: 'Chip & Run' },
  { value: 15, label: 'Pitch Test' },
  { value: 16, label: 'Flop Shot' },
  { value: 17, label: 'Lag Putt 12m' },
  { value: 18, label: 'Lag Putt 18m' },
  { value: 19, label: '9-hull Scoring' },
  { value: 20, label: '18-hull Scoring' },
];

type SGComponents = {
  offTee: number;
  approach: number;
  aroundGreen: number;
  putting: number;
};

type TraditionalStats = {
  drivingDistanceMeters: { you: number; tourAvg: number };
  drivingAccuracyPct: { you: number; tourAvg: number };
  girPct: { you: number; tourAvg: number };
  scramblingPct: { you: number; tourAvg: number };
  puttsPerRound: { you: number; tourAvg: number };
};

type StatsPayload = {
  tour: Tour;
  sgTotal: number;
  sgComponents: SGComponents;
  traditional: TraditionalStats;
  summary: {
    strengths: string[];
    improvements: string[];
  };
};

type FetchResult =
  | { ok: true; data: StatsPayload; source: "api" | "demo" }
  | { ok: false; error: string; data: StatsPayload; source: "demo" };

// Demo data for each tour
const DEMO_BY_TOUR: Record<Tour, StatsPayload> = {
  PGA: {
    tour: "PGA",
    sgTotal: 1.8,
    sgComponents: { offTee: 1.2, approach: 0.8, aroundGreen: 0.3, putting: -0.5 },
    traditional: {
      drivingDistanceMeters: { you: 268.0, tourAvg: 260.0 },
      drivingAccuracyPct: { you: 65.0, tourAvg: 70.0 },
      girPct: { you: 68.0, tourAvg: 66.0 },
      scramblingPct: { you: 58.0, tourAvg: 62.0 },
      puttsPerRound: { you: 29.5, tourAvg: 29.0 },
    },
    summary: {
      strengths: ["Driving Distance (+8m)", "GIR % (+2.0%)"],
      improvements: ["Driving Accuracy (-5.0%)", "Scrambling (-4.0%)", "Putts per Round (+0.5)"],
    },
  },
  LPGA: {
    tour: "LPGA",
    sgTotal: 1.2,
    sgComponents: { offTee: 0.6, approach: 0.7, aroundGreen: 0.2, putting: -0.3 },
    traditional: {
      drivingDistanceMeters: { you: 235.0, tourAvg: 230.0 },
      drivingAccuracyPct: { you: 69.0, tourAvg: 72.0 },
      girPct: { you: 70.0, tourAvg: 68.0 },
      scramblingPct: { you: 60.0, tourAvg: 63.0 },
      puttsPerRound: { you: 29.8, tourAvg: 29.3 },
    },
    summary: {
      strengths: ["GIR % (+2.0%)"],
      improvements: ["Driving Accuracy (-3.0%)", "Scrambling (-3.0%)", "Putts per Round (+0.5)"],
    },
  },
  DP: {
    tour: "DP",
    sgTotal: 1.0,
    sgComponents: { offTee: 0.7, approach: 0.5, aroundGreen: 0.2, putting: -0.4 },
    traditional: {
      drivingDistanceMeters: { you: 265.0, tourAvg: 258.0 },
      drivingAccuracyPct: { you: 66.0, tourAvg: 69.0 },
      girPct: { you: 67.0, tourAvg: 65.0 },
      scramblingPct: { you: 57.0, tourAvg: 60.0 },
      puttsPerRound: { you: 29.6, tourAvg: 29.2 },
    },
    summary: {
      strengths: ["Driving Distance (+7m)", "GIR % (+2.0%)"],
      improvements: ["Driving Accuracy (-3.0%)", "Scrambling (-3.0%)", "Putts per Round (+0.4)"],
    },
  },
};

function formatSigned(n: number, digits = 2) {
  const s = n >= 0 ? "+" : "";
  return `${s}${n.toFixed(digits)}`;
}

function pctDelta(you: number, avg: number) {
  if (avg === 0) return 0;
  return (you / avg) * 100;
}

function verdictLabel(sgTotal: number) {
  if (sgTotal >= 1.5) return "Eksepsjonell ytelse!";
  if (sgTotal >= 0.5) return "Sterk ytelse.";
  if (sgTotal >= -0.5) return "Omtrent tour-nivå.";
  return "Under tour-nivå - se forbedringsområder.";
}

// Logs error details once (status code / message)
function logApiError(context: string, error: unknown, statusCode?: number): void {
  if (!FEATURE_FLAGS.DEBUG_MODE) return;

  const details = {
    context,
    statusCode: statusCode ?? 'N/A',
    message: error instanceof Error ? error.message : String(error),
    timestamp: new Date().toISOString(),
  };
  console.warn('[StatsPage API Error]', details);
}

async function fetchStats(tour: Tour, signal?: AbortSignal): Promise<FetchResult> {
  const demo = DEMO_BY_TOUR[tour];

  // Phase 1: Always return demo data (no API calls)
  if (!FEATURE_FLAGS.ENABLE_LIVE_API) {
    return { ok: true, data: demo, source: "demo" };
  }

  // Phase 2+: Try API, fallback to demo
  try {
    const url = `${API_CONFIG.baseUrl}${API_CONFIG.statsEndpoint}?tour=${encodeURIComponent(tour)}`;
    const res = await fetch(url, {
      method: "GET",
      credentials: "include",
      signal,
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken') || ''}`,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      logApiError('HTTP error', `${res.status} ${res.statusText} - ${body.slice(0, 200)}`, res.status);
      return { ok: false, error: `API-feil: ${res.status}`, data: demo, source: "demo" };
    }

    const json = (await res.json()) as Partial<StatsPayload>;
    if (!json || typeof json.sgTotal !== "number" || !json.sgComponents || !json.traditional) {
      logApiError('Invalid response format', 'Missing required fields');
      return { ok: false, error: "Ugyldig API-respons", data: demo, source: "demo" };
    }

    const data: StatsPayload = {
      tour,
      sgTotal: json.sgTotal,
      sgComponents: json.sgComponents as SGComponents,
      traditional: json.traditional as TraditionalStats,
      summary: (json.summary as StatsPayload["summary"]) ?? demo.summary,
    };

    return { ok: true, data, source: "api" };
  } catch (e: unknown) {
    if ((e as { name?: string })?.name !== "AbortError") {
      logApiError('Network/CORS error', e);
    }
    return { ok: false, error: "Nettverksfeil", data: demo, source: "demo" };
  }
}

function Card(props: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ border: `1px solid ${colors.border}`, borderRadius: 12, padding: 16, background: colors.bgWhite }}>
      <div style={{ fontWeight: 700, marginBottom: 10 }}>{props.title}</div>
      {props.children}
    </div>
  );
}

function StatRow(props: {
  label: string;
  you: number;
  avg: number;
  unit: string;
  invertBetter?: boolean;
}) {
  const { label, you, avg, unit, invertBetter } = props;
  const delta = you - avg;
  const ratio = pctDelta(you, avg);
  const better = invertBetter ? delta <= 0 : delta >= 0;
  const sign = delta >= 0 ? "+" : "";
  return (
    <div style={{ padding: "10px 0", borderTop: `1px solid ${colors.borderSubtle}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div style={{ fontWeight: 600 }}>{label}</div>
        <div style={{ opacity: 0.85 }}>
          <span style={{ fontWeight: 700 }}>{sign}{delta.toFixed(1)}{unit}</span>{" "}
          <span style={{ opacity: 0.75 }}>({ratio.toFixed(0)}%)</span>{" "}
          <span style={{ marginLeft: 8, color: better ? colors.success : colors.warning }}>
            {better ? "+" : "-"}
          </span>
        </div>
      </div>
      <div style={{ display: "flex", gap: 18, marginTop: 8, opacity: 0.9, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: 12, opacity: 0.7 }}>Du</div>
          <div style={{ fontWeight: 700 }}>{you.toFixed(1)}{unit}</div>
        </div>
        <div>
          <div style={{ fontSize: 12, opacity: 0.7 }}>Tour Avg</div>
          <div style={{ fontWeight: 700 }}>{avg.toFixed(1)}{unit}</div>
        </div>
      </div>
    </div>
  );
}

function MiniStat(props: { title: string; value: string }) {
  const isPositive = props.value.startsWith('+');
  const isNegative = props.value.startsWith('-');
  return (
    <div style={{ padding: 12, borderRadius: 12, border: `1px solid ${colors.borderSubtle}` }}>
      <div style={{ opacity: 0.8, marginBottom: 4 }}>{props.title}</div>
      <div style={{
        fontSize: 22,
        fontWeight: 800,
        color: isPositive ? colors.success : isNegative ? colors.warning : 'inherit'
      }}>
        {props.value}
      </div>
    </div>
  );
}

function btn(active: boolean): React.CSSProperties {
  return {
    padding: "8px 10px",
    borderRadius: 12,
    border: `1px solid ${colors.border}`,
    background: active ? colors.ink : colors.bgWhite,
    color: active ? colors.bgWhite : colors.ink,
    cursor: "pointer",
    fontWeight: 700,
  };
}

export default function StatsPage() {
  const { user } = useAuth();
  const playerId = user?.playerId;

  const [tour, setTour] = useState<Tour>("PGA");
  const [activeTab, setActiveTab] = useState<"min" | "sg" | "peer" | "tour" | "trends">("sg");
  const [selectedTestNumber, setSelectedTestNumber] = useState(1);

  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<"api" | "demo">("demo");
  const [data, setData] = useState<StatsPayload>(DEMO_BY_TOUR.PGA);

  useEffect(() => {
    const ac = new AbortController();
    setLoading(true);

    fetchStats(tour, ac.signal).then((r) => {
      setLoading(false);
      setSource(r.source);
      setData(r.data);
    });

    return () => ac.abort();
  }, [tour]);

  const banner = useMemo(() => {
    if (loading) return { type: "loading" as const, text: "Laster statistikk..." };

    // Phase 1: Demo mode is expected, not an error
    if (!FEATURE_FLAGS.ENABLE_LIVE_API) {
      return {
        type: "info" as const,
        text: "Demo-modus aktiv. Live data kommer i Fase 2."
      };
    }

    // Phase 2+: Show appropriate status
    if (source === "api") {
      return { type: "ok" as const, text: "Live data lastet fra API." };
    }

    return {
      type: "info" as const,
      text: "Viser demo-data (API midlertidig utilgjengelig)."
    };
  }, [loading, source]);

  // Banner styles based on type
  const bannerStyles: Record<string, React.CSSProperties> = {
    loading: { background: colors.bgDefault, color: colors.steel },
    info: { background: colors.snow, color: colors.primary },
    ok: { background: `${colors.success}15`, color: colors.success },
  };

  return (
    <div style={{ padding: 20, maxWidth: 1100, margin: "0 auto", fontFamily: "system-ui, -apple-system, Segoe UI, Roboto" }}>
      <SectionTitle style={{ margin: "6px 0 14px" }}>Statistikk</SectionTitle>

      {/* AI Coach contextual guide */}
      <AICoachGuide config={GUIDE_PRESETS.statistics} variant="compact" />

      <div
        style={{
          padding: 12,
          borderRadius: 12,
          border: `1px solid ${colors.border}`,
          background: colors.bgWhite,
          marginBottom: 16,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div style={{ fontWeight: 700 }}>Strokes Gained Profil</div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ opacity: 0.8 }}>Sammenlign med:</span>
            <select
              value={tour}
              onChange={(e) => setTour(e.target.value as Tour)}
              style={{ padding: "6px 8px", borderRadius: 10 }}
            >
              <option value="PGA">PGA Tour</option>
              <option value="LPGA">LPGA Tour</option>
              <option value="DP">DP World Tour</option>
            </select>
          </div>
        </div>

        {/* Inline banner - small and unobtrusive */}
        <div style={{
          marginTop: 10,
          padding: "8px 12px",
          borderRadius: 8,
          fontSize: 13,
          display: "flex",
          alignItems: "center",
          gap: 6,
          ...bannerStyles[banner.type]
        }}>
          {banner.type === "ok" && <span style={{ color: colors.success }}>&#10003;</span>}
          {banner.type === "info" && <span>&#8505;</span>}
          {banner.type === "loading" && <span>&#8987;</span>}
          {banner.text}
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
          <button onClick={() => setActiveTab("min")} style={btn(activeTab === "min")}>Min Statistikk</button>
          <button onClick={() => setActiveTab("sg")} style={btn(activeTab === "sg")}>SG Profil</button>
          <button onClick={() => setActiveTab("peer")} style={btn(activeTab === "peer")}>Peer</button>
          <button onClick={() => setActiveTab("tour")} style={btn(activeTab === "tour")}>Tour</button>
          <button onClick={() => setActiveTab("trends")} style={btn(activeTab === "trends")}>Trends</button>
        </div>
      </div>

      {activeTab === "peer" ? (
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 14 }}>
          {/* Test Selector */}
          <Card title="Velg test for sammenligning">
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <label style={{ fontWeight: 500, color: colors.steel }}>Test:</label>
              <select
                value={selectedTestNumber}
                onChange={(e) => setSelectedTestNumber(Number(e.target.value))}
                style={{
                  padding: "8px 12px",
                  borderRadius: 10,
                  border: `1px solid ${colors.border}`,
                  backgroundColor: colors.bgWhite,
                  fontSize: 14,
                  minWidth: 200,
                }}
              >
                {TEST_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.value}. {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </Card>

          {/* Peer Comparison Widget */}
          {playerId ? (
            <PeerComparisonWidget
              playerId={playerId}
              testNumber={selectedTestNumber}
              showMultiLevel={true}
              compact={false}
            />
          ) : (
            <Card title="Peer Sammenligning">
              <div style={{ textAlign: "center", padding: 24, color: colors.steel }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>👥</div>
                <p style={{ fontSize: 14, marginBottom: 8 }}>
                  Logg inn for å se din sammenligning med andre spillere.
                </p>
                <p style={{ fontSize: 12, opacity: 0.7 }}>
                  Peer-sammenligning viser hvordan du presterer i forhold til spillere i din kategori.
                </p>
              </div>
            </Card>
          )}

          {/* Info Card */}
          <Card title="Om Peer Sammenligning">
            <div style={{ opacity: 0.85, lineHeight: 1.6 }}>
              <p style={{ marginBottom: 8 }}>
                Peer-sammenligning viser din posisjon i forhold til andre spillere basert på testresultater.
              </p>
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                <li><strong>Percentil:</strong> Hvor du ligger i forhold til alle spillere (0-100%)</li>
                <li><strong>Rangering:</strong> Din plassering blant alle i samme kategori</li>
                <li><strong>Multi-nivå:</strong> Sammenligning på tvers av kategorier (A-E)</li>
              </ul>
            </div>
          </Card>
        </div>
      ) : activeTab === "trends" ? (
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 14 }}>
          <TrendsContent />
        </div>
      ) : activeTab === "tour" ? (
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 14 }}>
          <BenchmarkContent />
        </div>
      ) : activeTab === "min" ? (
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 14 }}>
          <PlayerStatsContent />
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 14 }}>
          <Card title="Din SG vs Tour Snitt">
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <div>
                <div style={{ opacity: 0.8 }}>Total Strokes Gained</div>
                <div style={{ fontSize: 34, fontWeight: 800, color: data.sgTotal >= 0 ? colors.success : colors.warning }}>
                  {formatSigned(data.sgTotal, 2)}
                </div>
                <div style={{ opacity: 0.8 }}>vs {tour} Tour Average (0.00)</div>
              </div>
              <div style={{ alignSelf: "center", fontWeight: 800 }}>{verdictLabel(data.sgTotal)}</div>
            </div>
          </Card>

          <Card title="SG Komponenter">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
              <MiniStat title="Off Tee" value={formatSigned(data.sgComponents.offTee)} />
              <MiniStat title="Approach" value={formatSigned(data.sgComponents.approach)} />
              <MiniStat title="Around Green" value={formatSigned(data.sgComponents.aroundGreen)} />
              <MiniStat title="Putting" value={formatSigned(data.sgComponents.putting)} />
            </div>
          </Card>

          <Card title="Tradisjonelle Statistikker vs Tour">
            <StatRow
              label="Driving Distance"
              you={data.traditional.drivingDistanceMeters.you}
              avg={data.traditional.drivingDistanceMeters.tourAvg}
              unit="m"
            />
            <StatRow
              label="Driving Accuracy"
              you={data.traditional.drivingAccuracyPct.you}
              avg={data.traditional.drivingAccuracyPct.tourAvg}
              unit="%"
            />
            <StatRow
              label="Greens in Regulation (GIR)"
              you={data.traditional.girPct.you}
              avg={data.traditional.girPct.tourAvg}
              unit="%"
            />
            <StatRow
              label="Scrambling"
              you={data.traditional.scramblingPct.you}
              avg={data.traditional.scramblingPct.tourAvg}
              unit="%"
            />
            <StatRow
              label="Putts per Round"
              you={data.traditional.puttsPerRound.you}
              avg={data.traditional.puttsPerRound.tourAvg}
              unit=""
              invertBetter
            />
          </Card>

          <Card title="Oppsummering">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12 }}>
              <div>
                <div style={{ fontWeight: 800, marginBottom: 6, color: colors.success }}>Styrker vs Tour</div>
                <ul style={{ margin: 0, paddingLeft: 18 }}>
                  {data.summary.strengths.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </div>
              <div>
                <div style={{ fontWeight: 800, marginBottom: 6, color: colors.warning }}>Forbedringsomrader</div>
                <ul style={{ margin: 0, paddingLeft: 18 }}>
                  {data.summary.improvements.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>

          <Card title="Stats Dashboard - Status">
            <div style={{ opacity: 0.9 }}>
              <strong>Aktivt:</strong> Alle faner er nå implementert!
              <br />
              <span style={{ fontSize: 13 }}>Min Statistikk, SG Profil, Peer, Tour Benchmark, Trends</span>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
