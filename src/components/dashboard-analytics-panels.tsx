"use client";

import { useState } from "react";

type Breakdown = { label: string; count: number };
type ProjectClick = { project: string; count: number };
type DailyVisit = { date: string; count: number };

type AnalyticsSummary = {
  totalVisits: number;
  totalProjectClicks: number;
  visitsTrend: number;
  clicksTrend: number;
  dailyVisits: DailyVisit[];
  projectClicks: ProjectClick[];
  deviceBreakdown: Breakdown[];
  referrerBreakdown: Breakdown[];
};

type RangeKey = 1 | 7 | 30 | 365;

type PanelsProps = {
  analyticsByRange: Record<string, AnalyticsSummary>;
};

const RANGE_OPTIONS: Array<{ label: string; days: RangeKey }> = [
  { label: "Gün", days: 1 },
  { label: "Hafta", days: 7 },
  { label: "Ay", days: 30 },
  { label: "Yıl", days: 365 },
];

function rangeButton(active: boolean) {
  return active
    ? "rounded-full border border-[#1a4f9d] bg-[#1a4f9d] px-3 py-1 text-xs font-semibold text-white"
    : "rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700 hover:border-[#1a4f9d] hover:bg-[#eef4ff] hover:text-[#0c2c64]";
}

function getSummary(map: Record<string, AnalyticsSummary>, days: RangeKey) {
  return map[String(days)] || map["7"];
}

const MONTH_NAMES = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];
const DAY_NAMES = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"];

type ChartPoint = { label: string; count: number };

function aggregateChartData(raw: DailyVisit[], days: RangeKey): ChartPoint[] {
  if (days === 365) {
    // group by ISO week (Mon-based), max ~53 points
    const weeks = new Map<string, { sum: number; label: string }>();
    for (const item of raw) {
      const d = new Date(item.date);
      const day = d.getDay() === 0 ? 6 : d.getDay() - 1; // 0=Mon
      const mon = new Date(d);
      mon.setDate(d.getDate() - day);
      const key = mon.toISOString().slice(0, 10);
      if (!weeks.has(key)) {
        weeks.set(key, { sum: 0, label: `${mon.getDate()} ${MONTH_NAMES[mon.getMonth()]}` });
      }
      weeks.get(key)!.sum += item.count;
    }
    return [...weeks.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, v]) => ({ label: v.label, count: v.sum }));
  }
  if (days === 30) {
    // group into 5-day buckets (~6 points)
    const buckets = new Map<number, { sum: number; label: string }>();
    for (const item of raw) {
      const d = new Date(item.date);
      const bucket = Math.floor(d.getDate() / 5);
      const key = d.getFullYear() * 1000 + d.getMonth() * 10 + bucket;
      if (!buckets.has(key)) {
        buckets.set(key, { sum: 0, label: `${d.getDate()} ${MONTH_NAMES[d.getMonth()]}` });
      }
      buckets.get(key)!.sum += item.count;
    }
    return [...buckets.entries()]
      .sort(([a], [b]) => a - b)
      .map(([, v]) => ({ label: v.label, count: v.sum }));
  }
  // 1 or 7 days — raw daily
  return raw.map((item) => {
    const d = new Date(item.date);
    return { label: `${DAY_NAMES[d.getDay()]} ${d.getDate()}`, count: item.count };
  });
}

function smoothPath(pts: { x: number; y: number }[]): { line: string; area: string } {
  if (pts.length === 1) {
    return { line: `M ${pts[0].x},${pts[0].y}`, area: `M ${pts[0].x},${pts[0].y}` };
  }
  let line = `M ${pts[0].x},${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const cpx = (pts[i].x + pts[i + 1].x) / 2;
    line += ` C ${cpx},${pts[i].y} ${cpx},${pts[i + 1].y} ${pts[i + 1].x},${pts[i + 1].y}`;
  }
  const bottom = pts[0].y > pts[pts.length - 1].y ? pts[0].y + 20 : pts[pts.length - 1].y + 20;
  const area = line + ` L ${pts[pts.length - 1].x},${bottom} L ${pts[0].x},${bottom} Z`;
  return { line, area };
}

function LineChart({ data, days }: { data: DailyVisit[]; days: RangeKey }) {
  const W = 600;
  const H = 200;
  const PAD = { top: 16, right: 12, bottom: 36, left: 12 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  const aggregated = aggregateChartData(data, days);
  const n = aggregated.length;

  if (n === 0) return <p className="mt-4 text-sm text-slate-500">Veri yok.</p>;

  const maxVal = Math.max(...aggregated.map((d) => d.count), 1);
  const pts = aggregated.map((item, i) => ({
    x: PAD.left + (n > 1 ? (i / (n - 1)) * chartW : chartW / 2),
    y: PAD.top + chartH - (item.count / maxVal) * chartH,
    label: item.label,
    count: item.count,
  }));

  const { line, area } = smoothPath(pts);
  const labelStep = Math.max(1, Math.ceil(n / 10));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="chart-animate w-full" style={{ height: 200 }}>
      <defs>
        <linearGradient id="lgArea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1a4f9d" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#1a4f9d" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {/* horizontal grid lines */}
      {[0.25, 0.5, 0.75, 1].map((t) => (
        <line
          key={t}
          x1={PAD.left}
          x2={W - PAD.right}
          y1={PAD.top + chartH * (1 - t)}
          y2={PAD.top + chartH * (1 - t)}
          stroke="#e2e8f0"
          strokeWidth="1"
        />
      ))}
      <path d={area} fill="url(#lgArea)" />
      <path
        d={line}
        fill="none"
        stroke="#1a4f9d"
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="4" fill="white" stroke="#1a4f9d" strokeWidth="2" />
          <circle cx={p.x} cy={p.y} r="2" fill="#0c2c64" />
        </g>
      ))}
      {pts.map(
        (p, i) =>
          i % labelStep === 0 && (
            <text key={i} x={p.x} y={H - 4} textAnchor="middle" fontSize="9" fill="#64748b">
              {p.label}
            </text>
          )
      )}
    </svg>
  );
}

export function DashboardAnalyticsPanels({ analyticsByRange }: PanelsProps) {
  const [visitsDays, setVisitsDays] = useState<RangeKey>(30);
  const [clicksDays, setClicksDays] = useState<RangeKey>(7);
  const [devicesDays, setDevicesDays] = useState<RangeKey>(7);
  const [sourcesDays, setSourcesDays] = useState<RangeKey>(7);

  const visitsAnalytics = getSummary(analyticsByRange, visitsDays);
  const clicksAnalytics = getSummary(analyticsByRange, clicksDays);
  const devicesAnalytics = getSummary(analyticsByRange, devicesDays);
  const sourcesAnalytics = getSummary(analyticsByRange, sourcesDays);
  const weeklyAnalytics = getSummary(analyticsByRange, 7);
  const monthlyAnalytics = getSummary(analyticsByRange, 30);

  const maxProject = Math.max(...clicksAnalytics.projectClicks.map((item) => item.count), 1);
  const maxDevice = Math.max(...devicesAnalytics.deviceBreakdown.map((item) => item.count), 1);
  const maxReferrer = Math.max(...sourcesAnalytics.referrerBreakdown.map((item) => item.count), 1);

  const avgDaily = Math.round(visitsAnalytics.totalVisits / Math.max(visitsDays, 1));
  const peakDay = visitsAnalytics.dailyVisits.reduce(
    (best, item) => (item.count > best.count ? item : best),
    visitsAnalytics.dailyVisits[0] ?? { date: "", count: 0 }
  );
  const peakDayName = peakDay.date
    ? ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"][new Date(peakDay.date).getDay()]
    : "-";

  const weeklyConversion =
    weeklyAnalytics.totalVisits > 0
      ? Math.round((weeklyAnalytics.totalProjectClicks / weeklyAnalytics.totalVisits) * 100)
      : 0;
  const monthlyConversion =
    monthlyAnalytics.totalVisits > 0
      ? Math.round((monthlyAnalytics.totalProjectClicks / monthlyAnalytics.totalVisits) * 100)
      : 0;

  return (
    <>
      <section className="grid gap-5">
        <article className="panel-card">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-[#0c2c64]">Ziyaret İnfografiği ({visitsDays} Gün)</h3>
            <div className="flex items-center gap-2">
              <p className="rounded-full bg-[#edf4ff] px-3 py-1 text-xs font-semibold text-[#1a4f9d]">Toplam: {visitsAnalytics.totalVisits}</p>
              <div className={`rounded-full px-2 py-1 text-xs font-semibold ${visitsAnalytics.visitsTrend >= 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                {visitsAnalytics.visitsTrend >= 0 ? "↑" : "↓"} {Math.abs(visitsAnalytics.visitsTrend)}%
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2">
            {RANGE_OPTIONS.map((range) => (
              <button key={range.days} type="button" className={rangeButton(visitsDays === range.days)} onClick={() => setVisitsDays(range.days)}>
                {range.label}
              </button>
            ))}
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Ortalama / Gün</p>
              <p className="mt-1 text-lg font-semibold text-[#0c2c64]">{avgDaily}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">En Yoğun Gün</p>
              <p className="mt-1 text-lg font-semibold text-[#0c2c64]">{peakDayName}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">En Yüksek Trafik</p>
              <p className="mt-1 text-lg font-semibold text-[#0c2c64]">{peakDay.count}</p>
            </div>
          </div>

          <div className="mt-5">
            <LineChart key={visitsDays} data={visitsAnalytics.dailyVisits} days={visitsDays} />
          </div>
        </article>

        <article className="panel-card">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-[#0c2c64]">Proje Tıklama ({clicksDays} Gün)</h3>
            <div className="flex items-center gap-2">
              <p className="rounded-full bg-[#edf4ff] px-3 py-1 text-xs font-semibold text-[#1a4f9d]">Toplam: {clicksAnalytics.totalProjectClicks}</p>
              <div className={`rounded-full px-2 py-1 text-xs font-semibold ${clicksAnalytics.clicksTrend >= 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                {clicksAnalytics.clicksTrend >= 0 ? "↑" : "↓"} {Math.abs(clicksAnalytics.clicksTrend)}%
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2">
            {RANGE_OPTIONS.map((range) => (
              <button key={range.days} type="button" className={rangeButton(clicksDays === range.days)} onClick={() => setClicksDays(range.days)}>
                {range.label}
              </button>
            ))}
          </div>

          {clicksAnalytics.projectClicks.length > 0 ? (
            <div className="mt-5 space-y-3">
              {clicksAnalytics.projectClicks.map((item) => (
                <div key={item.project} className="flex items-center gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs text-slate-700" title={item.project}>{item.project}</p>
                  </div>
                  <div className="flex w-16 items-center justify-between gap-1">
                    <div className="h-5 flex-1 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full bg-gradient-to-r from-[#0c2c64] to-[#1a4f9d]" style={{ width: `${Math.max((item.count / maxProject) * 100, 4)}%` }} />
                    </div>
                    <span className="w-8 text-right text-xs font-semibold text-slate-700">{item.count}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-5 text-sm text-slate-500">Henüz proje tıklama verisi oluşmadı.</p>
          )}
        </article>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <article className="panel-card min-h-[300px]">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-[#0c2c64]">Ziyaretçi Cihaz Dağılımı ({devicesDays} Gün)</h3>
            <p className="rounded-full bg-[#edf4ff] px-3 py-1 text-xs font-semibold text-[#1a4f9d]">Pageview</p>
          </div>

          <div className="mt-3 flex items-center gap-2">
            {RANGE_OPTIONS.map((range) => (
              <button key={range.days} type="button" className={rangeButton(devicesDays === range.days)} onClick={() => setDevicesDays(range.days)}>
                {range.label}
              </button>
            ))}
          </div>

          {devicesAnalytics.deviceBreakdown.length > 0 ? (
            <div className="mt-4 space-y-2">
              {devicesAnalytics.deviceBreakdown.map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <span className="w-28 text-xs capitalize text-slate-600">{item.label}</span>
                  <div className="h-3 flex-1 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full bg-gradient-to-r from-[#1f6bbf] to-[#58a5f6]" style={{ width: `${Math.max((item.count / maxDevice) * 100, 4)}%` }} />
                  </div>
                  <span className="w-8 text-right text-xs font-semibold text-slate-700">{item.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-500">Henüz cihaz verisi oluşmadı.</p>
          )}
        </article>

        <article className="panel-card min-h-[300px]">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-[#0c2c64]">Trafik Kaynağı Dağılımı ({sourcesDays} Gün)</h3>
            <p className="rounded-full bg-[#edf4ff] px-3 py-1 text-xs font-semibold text-[#1a4f9d]">Kaynak</p>
          </div>

          <div className="mt-3 flex items-center gap-2">
            {RANGE_OPTIONS.map((range) => (
              <button key={range.days} type="button" className={rangeButton(sourcesDays === range.days)} onClick={() => setSourcesDays(range.days)}>
                {range.label}
              </button>
            ))}
          </div>

          {sourcesAnalytics.referrerBreakdown.length > 0 ? (
            <div className="mt-4 space-y-2">
              {sourcesAnalytics.referrerBreakdown.map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <span className="flex-1 truncate text-xs text-slate-600" title={item.label}>{item.label}</span>
                  <div className="h-3 w-24 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full bg-gradient-to-r from-[#0c2c64] to-[#2f78d2]" style={{ width: `${Math.max((item.count / maxReferrer) * 100, 4)}%` }} />
                  </div>
                  <span className="w-8 text-right text-xs font-semibold text-slate-700">{item.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-500">Henüz trafik kaynağı verisi oluşmadı.</p>
          )}
        </article>
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
        <article className="panel-card min-h-[210px]">
          <p className="text-sm text-slate-500">Haftalık Dönüşüm</p>
          <p className="mt-2 text-3xl font-bold text-[#0c2c64]">%{weeklyConversion}</p>
          <p className="mt-2 text-sm text-slate-600">Proje tıklaması / ziyaret oranı (son 7 gün).</p>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-gradient-to-r from-[#1a4f9d] to-[#2f78d2]" style={{ width: `${Math.min(weeklyConversion, 100)}%` }} />
          </div>
        </article>

        <article className="panel-card min-h-[210px]">
          <p className="text-sm text-slate-500">Aylık Dönüşüm</p>
          <p className="mt-2 text-3xl font-bold text-[#0c2c64]">%{monthlyConversion}</p>
          <p className="mt-2 text-sm text-slate-600">Proje tıklaması / ziyaret oranı (son 30 gün).</p>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-gradient-to-r from-[#0c2c64] to-[#1a4f9d]" style={{ width: `${Math.min(monthlyConversion, 100)}%` }} />
          </div>
        </article>

        <article className="panel-card min-h-[210px]">
          <p className="text-sm text-slate-500">Trend Karşılaştırma</p>
          <p className="mt-2 text-sm text-slate-700">Son 7 gün ziyaret: <strong className="text-[#0c2c64]">{weeklyAnalytics.totalVisits}</strong></p>
          <p className="mt-1 text-sm text-slate-700">Son 30 gün ziyaret: <strong className="text-[#0c2c64]">{monthlyAnalytics.totalVisits}</strong></p>
          <p className="mt-3 text-xs text-slate-500">Haftalık trend: {weeklyAnalytics.visitsTrend >= 0 ? "↑" : "↓"} {Math.abs(weeklyAnalytics.visitsTrend)}%</p>
          <p className="mt-1 text-xs text-slate-500">Aylık trend: {monthlyAnalytics.visitsTrend >= 0 ? "↑" : "↓"} {Math.abs(monthlyAnalytics.visitsTrend)}%</p>
        </article>
      </section>
    </>
  );
}
