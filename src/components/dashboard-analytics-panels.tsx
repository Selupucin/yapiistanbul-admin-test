"use client";

import { useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

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

const MONTH_NAMES = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];
const DAY_NAMES = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"];

const DEVICE_COLORS = ["#0c2c64", "#1a4f9d", "#2f78d2", "#58a5f6", "#9bc8f7"];

function rangeButton(active: boolean) {
  return active
    ? "rounded-full border border-[#1a4f9d] bg-[#1a4f9d] px-3 py-1 text-xs font-semibold text-white"
    : "rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700 hover:border-[#1a4f9d] hover:bg-[#eef4ff] hover:text-[#0c2c64]";
}

function getSummary(map: Record<string, AnalyticsSummary>, days: RangeKey) {
  return map[String(days)] || map["7"];
}

function aggregateChartData(raw: DailyVisit[], days: RangeKey) {
  if (days === 365) {
    const weeks = new Map<string, { sum: number; label: string }>();
    for (const item of raw) {
      const d = new Date(item.date);
      const day = d.getDay() === 0 ? 6 : d.getDay() - 1;
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
  return raw.map((item) => {
    const d = new Date(item.date);
    return { label: `${DAY_NAMES[d.getDay()]} ${d.getDate()}`, count: item.count };
  });
}

function VisitsAreaChart({ data, days }: { data: DailyVisit[]; days: RangeKey }) {
  const aggregated = aggregateChartData(data, days);
  if (aggregated.length === 0) return <p className="mt-4 text-sm text-slate-500">Veri yok.</p>;

  return (
    <div className="chart-animate mt-4 h-[260px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={aggregated} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="visitsArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1a4f9d" stopOpacity={0.32} />
              <stop offset="100%" stopColor="#1a4f9d" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="label" tick={{ fill: "#64748b", fontSize: 11 }} tickLine={false} axisLine={{ stroke: "#cbd5e1" }} interval="preserveStartEnd" />
          <YAxis tick={{ fill: "#64748b", fontSize: 11 }} tickLine={false} axisLine={false} width={32} allowDecimals={false} />
          <Tooltip
            contentStyle={{ borderRadius: 12, border: "1px solid #cbd5e1", fontSize: 12 }}
            labelStyle={{ color: "#0c2c64", fontWeight: 600 }}
            formatter={(value) => [String(value), "Ziyaret"]}
          />
          <Area type="monotone" dataKey="count" stroke="#0c2c64" strokeWidth={2.5} fill="url(#visitsArea)" dot={{ fill: "#0c2c64", r: 3 }} activeDot={{ r: 5 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function ProjectClicksBarChart({ data }: { data: ProjectClick[] }) {
  if (data.length === 0) return <p className="mt-5 text-sm text-slate-500">Henüz proje tıklama verisi oluşmadı.</p>;

  const sorted = [...data].sort((a, b) => b.count - a.count).slice(0, 10);
  const chartData = sorted.map((item) => ({
    name: item.project.length > 22 ? `${item.project.slice(0, 22)}…` : item.project,
    fullName: item.project,
    count: item.count,
  }));

  return (
    <div className="chart-animate mt-4 w-full" style={{ height: Math.max(chartData.length * 36, 160) }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} layout="vertical" margin={{ top: 4, right: 16, left: 0, bottom: 4 }} barCategoryGap={6}>
          <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" tick={{ fill: "#64748b", fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
          <YAxis type="category" dataKey="name" tick={{ fill: "#475569", fontSize: 11 }} tickLine={false} axisLine={false} width={140} />
          <Tooltip
            contentStyle={{ borderRadius: 12, border: "1px solid #cbd5e1", fontSize: 12 }}
            labelFormatter={(_l, payload) => payload?.[0]?.payload?.fullName ?? ""}
            formatter={(value) => [String(value), "Tıklama"]}
          />
          <Bar dataKey="count" fill="#1a4f9d" radius={[0, 6, 6, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function DeviceDonut({ data }: { data: Breakdown[] }) {
  if (data.length === 0) return <p className="mt-4 text-sm text-slate-500">Henüz cihaz verisi oluşmadı.</p>;

  const total = data.reduce((acc, d) => acc + d.count, 0);
  const chartData = data.map((d) => ({ name: d.label, value: d.count }));

  return (
    <div className="chart-animate mt-4 grid items-center gap-4 sm:grid-cols-[1fr_auto]">
      <div className="h-[220px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={56} outerRadius={88} paddingAngle={2} stroke="#fff" strokeWidth={2}>
              {chartData.map((_, i) => (
                <Cell key={i} fill={DEVICE_COLORS[i % DEVICE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ borderRadius: 12, border: "1px solid #cbd5e1", fontSize: 12 }}
              formatter={(value, name) => {
                const v = Number(value) || 0;
                const pct = total ? Math.round((v / total) * 100) : 0;
                return [`${v} (${pct}%)`, String(name)];
              }}
            />
            <Legend
              verticalAlign="bottom"
              height={28}
              iconType="circle"
              wrapperStyle={{ fontSize: 11, color: "#475569" }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="space-y-2">
        {chartData.map((item, i) => {
          const pct = total ? Math.round((item.value / total) * 100) : 0;
          return (
            <div key={item.name} className="flex items-center gap-2 text-xs">
              <span className="inline-block h-3 w-3 rounded-full" style={{ backgroundColor: DEVICE_COLORS[i % DEVICE_COLORS.length] }} />
              <span className="capitalize text-slate-700">{item.name}</span>
              <span className="ml-auto font-semibold text-[#0c2c64]">{item.value}</span>
              <span className="text-slate-400">({pct}%)</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ReferrerBarChart({ data }: { data: Breakdown[] }) {
  if (data.length === 0) return <p className="mt-4 text-sm text-slate-500">Henüz trafik kaynağı verisi oluşmadı.</p>;

  const chartData = [...data]
    .sort((a, b) => b.count - a.count)
    .slice(0, 8)
    .map((item) => ({
      name: item.label.length > 20 ? `${item.label.slice(0, 20)}…` : item.label,
      fullName: item.label,
      count: item.count,
    }));

  return (
    <div className="chart-animate mt-4 w-full" style={{ height: Math.max(chartData.length * 32, 160) }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} layout="vertical" margin={{ top: 4, right: 16, left: 0, bottom: 4 }} barCategoryGap={6}>
          <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" tick={{ fill: "#64748b", fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
          <YAxis type="category" dataKey="name" tick={{ fill: "#475569", fontSize: 11 }} tickLine={false} axisLine={false} width={130} />
          <Tooltip
            contentStyle={{ borderRadius: 12, border: "1px solid #cbd5e1", fontSize: 12 }}
            labelFormatter={(_l, payload) => payload?.[0]?.payload?.fullName ?? ""}
            formatter={(value) => [String(value), "Ziyaret"]}
          />
          <Bar dataKey="count" fill="#2f78d2" radius={[0, 6, 6, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
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

  const avgDaily = Math.round(visitsAnalytics.totalVisits / Math.max(visitsDays, 1));
  const peakDay = visitsAnalytics.dailyVisits.reduce(
    (best, item) => (item.count > best.count ? item : best),
    visitsAnalytics.dailyVisits[0] ?? { date: "", count: 0 }
  );
  const peakDayName = peakDay.date ? DAY_NAMES[new Date(peakDay.date).getDay()] : "-";

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
            <h3 className="text-lg font-semibold text-[#0c2c64]">Ziyaret Trendi ({visitsDays} Gün)</h3>
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

          <VisitsAreaChart key={visitsDays} data={visitsAnalytics.dailyVisits} days={visitsDays} />
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

          <ProjectClicksBarChart key={clicksDays} data={clicksAnalytics.projectClicks} />
        </article>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <article className="panel-card min-h-[300px]">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-[#0c2c64]">Cihaz Dağılımı ({devicesDays} Gün)</h3>
            <p className="rounded-full bg-[#edf4ff] px-3 py-1 text-xs font-semibold text-[#1a4f9d]">Pageview</p>
          </div>

          <div className="mt-3 flex items-center gap-2">
            {RANGE_OPTIONS.map((range) => (
              <button key={range.days} type="button" className={rangeButton(devicesDays === range.days)} onClick={() => setDevicesDays(range.days)}>
                {range.label}
              </button>
            ))}
          </div>

          <DeviceDonut key={devicesDays} data={devicesAnalytics.deviceBreakdown} />
        </article>

        <article className="panel-card min-h-[300px]">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-[#0c2c64]">Trafik Kaynağı ({sourcesDays} Gün)</h3>
            <p className="rounded-full bg-[#edf4ff] px-3 py-1 text-xs font-semibold text-[#1a4f9d]">Kaynak</p>
          </div>

          <div className="mt-3 flex items-center gap-2">
            {RANGE_OPTIONS.map((range) => (
              <button key={range.days} type="button" className={rangeButton(sourcesDays === range.days)} onClick={() => setSourcesDays(range.days)}>
                {range.label}
              </button>
            ))}
          </div>

          <ReferrerBarChart key={sourcesDays} data={sourcesAnalytics.referrerBreakdown} />
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
          <p className="mt-2 text-sm text-slate-700">
            Son 7 gün ziyaret: <strong className="text-[#0c2c64]">{weeklyAnalytics.totalVisits}</strong>
          </p>
          <p className="mt-1 text-sm text-slate-700">
            Son 30 gün ziyaret: <strong className="text-[#0c2c64]">{monthlyAnalytics.totalVisits}</strong>
          </p>
          <p className="mt-3 text-xs text-slate-500">
            Haftalık trend: {weeklyAnalytics.visitsTrend >= 0 ? "↑" : "↓"} {Math.abs(weeklyAnalytics.visitsTrend)}%
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Aylık trend: {monthlyAnalytics.visitsTrend >= 0 ? "↑" : "↓"} {Math.abs(monthlyAnalytics.visitsTrend)}%
          </p>
        </article>
      </section>
    </>
  );
}
