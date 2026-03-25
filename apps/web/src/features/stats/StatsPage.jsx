import React, { useEffect, useMemo, useState } from "react";
import { SectionTitle } from '../../components/typography';

/**
 * StatsPage.jsx
 * Design System v3.0 - Premium Light
 *
 * Phase 1: Demo mode only (DataGolf integration kommer i Fase 2)
 * Phase 2: Live API integration
 *
 * MIGRATED TO PAGE ARCHITECTURE - Zero inline styles
 */

// ============================================================================
// FEATURE FLAGS
// ============================================================================
const FEATURE_FLAGS = {
  ENABLE_LIVE_API: false,
  DEBUG_MODE: process.env.NODE_ENV === 'development',
};

const API_CONFIG = {
  baseUrl: process.env.REACT_APP_API_URL || '',
  statsEndpoint: '/api/v1/datagolf/compare',
};

// Demo data for each tour
const DEMO_BY_TOUR = {
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

function formatSigned(n, digits = 2) {
  const s = n >= 0 ? "+" : "";
  return `${s}${n.toFixed(digits)}`;
}

function pctDelta(you, avg) {
  if (avg === 0) return 0;
  return (you / avg) * 100;
}

function verdictLabel(sgTotal) {
  if (sgTotal >= 1.5) return "Eksepsjonell ytelse!";
  if (sgTotal >= 0.5) return "Sterk ytelse.";
  if (sgTotal >= -0.5) return "Omtrent tour-nivå.";
  return "Under tour-nivå - se forbedringsområder.";
}

function logApiError(context, error, statusCode) {
  if (!FEATURE_FLAGS.DEBUG_MODE) return;

  const details = {
    context,
    statusCode: statusCode ?? 'N/A',
    message: error instanceof Error ? error.message : String(error),
    timestamp: new Date().toISOString(),
  };
  console.warn('[StatsPage API Error]', details);
}

async function fetchStats(tour, signal) {
  const demo = DEMO_BY_TOUR[tour];

  if (!FEATURE_FLAGS.ENABLE_LIVE_API) {
    return { ok: true, data: demo, source: "demo" };
  }

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

    const json = await res.json();
    if (!json || typeof json.sgTotal !== "number" || !json.sgComponents || !json.traditional) {
      logApiError('Invalid response format', 'Missing required fields');
      return { ok: false, error: "Ugyldig API-respons", data: demo, source: "demo" };
    }

    const data = {
      tour,
      sgTotal: json.sgTotal,
      sgComponents: json.sgComponents,
      traditional: json.traditional,
      summary: json.summary ?? demo.summary,
    };

    return { ok: true, data, source: "api" };
  } catch (e) {
    if (e?.name !== "AbortError") {
      logApiError('Network/CORS error', e);
    }
    return { ok: false, error: "Nettverksfeil", data: demo, source: "demo" };
  }
}

function Card({ title, children }) {
  return (
    <div className="border border-tier-border-default rounded-xl p-4 bg-tier-white">
      <div className="font-bold mb-2.5">{title}</div>
      {children}
    </div>
  );
}

function StatRow({ label, you, avg, unit, invertBetter }) {
  const delta = you - avg;
  const ratio = pctDelta(you, avg);
  const better = invertBetter ? delta <= 0 : delta >= 0;
  const sign = delta >= 0 ? "+" : "";
  return (
    <div className="py-2.5 border-t border-tier-border-default">
      <div className="flex justify-between gap-3 flex-wrap">
        <div className="font-semibold">{label}</div>
        <div className="opacity-85">
          <span className="font-bold">{sign}{delta.toFixed(1)}{unit}</span>{" "}
          <span className="opacity-75">({ratio.toFixed(0)}%)</span>{" "}
          <span className={`ml-2 ${better ? 'text-tier-success' : 'text-tier-warning'}`}>
            {better ? "+" : "-"}
          </span>
        </div>
      </div>
      <div className="flex gap-4 mt-2 opacity-90 flex-wrap">
        <div>
          <div className="text-xs opacity-70">Du</div>
          <div className="font-bold">{you.toFixed(1)}{unit}</div>
        </div>
        <div>
          <div className="text-xs opacity-70">Tour Avg</div>
          <div className="font-bold">{avg.toFixed(1)}{unit}</div>
        </div>
      </div>
    </div>
  );
}

function MiniStat({ title, value }) {
  const isPositive = value.startsWith('+');
  const isNegative = value.startsWith('-');
  const colorClass = isPositive ? 'text-tier-success' : isNegative ? 'text-tier-warning' : 'text-tier-navy';
  return (
    <div className="p-3 rounded-xl border border-tier-border-default">
      <div className="opacity-80 mb-1">{title}</div>
      <div className={`text-[22px] font-extrabold ${colorClass}`}>
        {value}
      </div>
    </div>
  );
}

// Helper for tab button classes
function getTabButtonClasses(active) {
  const base = 'py-2 px-2.5 rounded-xl border cursor-pointer font-bold';
  if (active) {
    return `${base} border-tier-navy bg-tier-navy text-white`;
  }
  return `${base} border-tier-border-default bg-tier-white text-tier-navy`;
}

export default function StatsPage() {
  const [tour, setTour] = useState("PGA");
  const [activeTab, setActiveTab] = useState("sg");

  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState("demo");
  const [data, setData] = useState(DEMO_BY_TOUR.PGA);

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
    if (loading) return { type: "loading", text: "Laster statistikk..." };

    if (!FEATURE_FLAGS.ENABLE_LIVE_API) {
      return {
        type: "info",
        text: "Demo-modus aktiv. Live data kommer i Fase 2."
      };
    }

    if (source === "api") {
      return { type: "ok", text: "Live data lastet fra API." };
    }

    return {
      type: "info",
      text: "Viser demo-data (API midlertidig utilgjengelig)."
    };
  }, [loading, source]);

  // Helper for banner classes
  const getBannerClasses = (type) => {
    const base = 'mt-2.5 py-2 px-3 rounded-lg text-[13px] flex items-center gap-1.5';
    const types = {
      loading: `${base} bg-tier-surface-base text-tier-text-secondary`,
      info: `${base} bg-tier-surface-base text-tier-navy`,
      ok: `${base} bg-tier-success/15 text-tier-success`,
    };
    return types[type] || types.loading;
  };

  return (
    <div className="p-5 max-w-[1100px] mx-auto font-sans">
      <SectionTitle className="my-1.5 mb-3.5">Statistikk</SectionTitle>

      <div className="p-3 rounded-xl border border-tier-border-default bg-tier-white mb-4">
        <div className="flex justify-between gap-3 flex-wrap">
          <div className="font-bold">Strokes Gained Profil</div>
          <div className="flex items-center gap-2.5">
            <span className="opacity-80">Sammenlign med:</span>
            <select
              value={tour}
              onChange={(e) => setTour(e.target.value)}
              className="py-1.5 px-2 rounded-lg border border-tier-border-default"
            >
              <option value="PGA">PGA Tour</option>
              <option value="LPGA">LPGA Tour</option>
              <option value="DP">DP World Tour</option>
            </select>
          </div>
        </div>

        <div className={getBannerClasses(banner.type)}>
          {banner.type === "ok" && <span className="text-tier-success">&#10003;</span>}
          {banner.type === "info" && <span>&#8505;</span>}
          {banner.type === "loading" && <span>&#8987;</span>}
          {banner.text}
        </div>

        <div className="flex gap-2 flex-wrap mt-3">
          <button onClick={() => setActiveTab("min")} className={getTabButtonClasses(activeTab === "min")}>Min Statistikk</button>
          <button onClick={() => setActiveTab("sg")} className={getTabButtonClasses(activeTab === "sg")}>SG Profil</button>
          <button onClick={() => setActiveTab("peer")} className={getTabButtonClasses(activeTab === "peer")}>Peer</button>
          <button onClick={() => setActiveTab("tour")} className={getTabButtonClasses(activeTab === "tour")}>Tour</button>
          <button onClick={() => setActiveTab("trends")} className={getTabButtonClasses(activeTab === "trends")}>Trends</button>
        </div>
      </div>

      {activeTab !== "sg" ? (
        <Card title="Ikke implementert i denne filen">
          <div className="opacity-85">
            Fanen <b>{activeTab}</b> er markert som "kommer senere" i Fase-planen.
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3.5">
          <Card title="Din SG vs Tour Snitt">
            <div className="flex justify-between gap-3 flex-wrap">
              <div>
                <div className="opacity-80">Total Strokes Gained</div>
                <div className={`text-[34px] font-extrabold ${data.sgTotal >= 0 ? 'text-tier-success' : 'text-tier-warning'}`}>
                  {formatSigned(data.sgTotal, 2)}
                </div>
                <div className="opacity-80">vs {tour} Tour Average (0.00)</div>
              </div>
              <div className="self-center font-extrabold">{verdictLabel(data.sgTotal)}</div>
            </div>
          </Card>

          <Card title="SG Komponenter">
            <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-2.5">
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
            <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-3">
              <div>
                <div className="font-extrabold mb-1.5 text-tier-success">Styrker vs Tour</div>
                <ul className="m-0 pl-4">
                  {data.summary.strengths.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="font-extrabold mb-1.5 text-tier-warning">Forbedringsomrader</div>
                <ul className="m-0 pl-4">
                  {data.summary.improvements.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>

          <Card title="Stats Dashboard - Fase 1">
            <div className="opacity-90">
              <strong>Aktivt:</strong> Min Statistikk, SG Profil (demo fallback), Peer Sammenligning
              <br />
              <strong>Kommer snart:</strong> Tour Benchmark (Fase 2), Live Trends (Fase 3)
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
