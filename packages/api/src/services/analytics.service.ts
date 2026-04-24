import { AnalyticsEventModel, connectToDatabase } from "@repo/db";
import { hasDatabaseConfig } from "../env";

type DailyVisit = {
  date: string;
  count: number;
};

type ProjectClick = {
  project: string;
  count: number;
};

type Breakdown = {
  label: string;
  count: number;
};

type TrackPayload = {
  path: string;
  deviceType: "mobile" | "desktop" | "tablet" | "unknown";
  referrerSource: string;
};

// Lokal saat dilimine gore YYYY-MM-DD anahtari uretir.
// (toISOString UTC'ye cevirdigi icin gece yarisi etrafindaki olaylar yanlis gune yaziliyordu.)
function localDayKey(value: Date | string | number): string {
  const d = value instanceof Date ? value : new Date(value);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export async function trackPageView(input: TrackPayload) {
  if (!hasDatabaseConfig()) return { ok: true };

  await connectToDatabase();
  await AnalyticsEventModel.create({
    type: "pageview",
    path: input.path || "/",
    deviceType: input.deviceType || "unknown",
    referrerSource: input.referrerSource || "direct",
  });

  return { ok: true };
}

export async function trackProjectClick(projectName: string, input: TrackPayload) {
  if (!hasDatabaseConfig()) return { ok: true };

  await connectToDatabase();
  await AnalyticsEventModel.create({
    type: "project_click",
    projectName: projectName || "Isimsiz Proje",
    path: input.path || "/projects",
    deviceType: input.deviceType || "unknown",
    referrerSource: input.referrerSource || "direct",
  });

  return { ok: true };
}

export async function getAnalyticsSummary(days = 14) {
  const normalizedDays = Math.max(1, Math.min(365, days));

  const now = new Date();
  const start = new Date(now);
  start.setDate(start.getDate() - (normalizedDays - 1));
  start.setHours(0, 0, 0, 0);

  // Calculate previous period for trend
  const prevStart = new Date(start);
  prevStart.setDate(prevStart.getDate() - normalizedDays);
  const prevEnd = new Date(start);
  prevEnd.setDate(prevEnd.getDate() - 1);
  prevEnd.setHours(23, 59, 59, 999);

  const dateKeys: string[] = [];
  const dailyMap: Record<string, number> = {};
  for (let i = normalizedDays - 1; i >= 0; i -= 1) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = localDayKey(d);
    dateKeys.push(key);
    dailyMap[key] = 0;
  }

  if (!hasDatabaseConfig()) {
    const dailyVisits: DailyVisit[] = dateKeys.map((date) => ({ date, count: 0 }));
    return {
      totalVisits: 0,
      totalProjectClicks: 0,
      visitsTrend: 0,
      clicksTrend: 0,
      dailyVisits,
      projectClicks: [] as ProjectClick[],
      deviceBreakdown: [] as Breakdown[],
      referrerBreakdown: [] as Breakdown[],
    };
  }

  await connectToDatabase();

  const events = await AnalyticsEventModel.find({ createdAt: { $gte: start } }).lean();
  const prevEvents = await AnalyticsEventModel.find({ createdAt: { $gte: prevStart, $lte: prevEnd } }).lean();

  let totalVisits = 0;
  let totalProjectClicks = 0;
  let prevTotalVisits = 0;
  let prevTotalClicks = 0;
  const projectMap: Record<string, number> = {};
  const deviceMap: Record<string, number> = {};
  const referrerMap: Record<string, number> = {};

  for (const event of events) {
    const key = localDayKey(event.createdAt as Date);

    if (event.type === "pageview") {
      totalVisits += 1;
      if (dailyMap[key] !== undefined) {
        dailyMap[key] += 1;
      }

      // Legacy records may contain unknown; merge them into desktop for a cleaner dashboard.
      const rawDevice = event.deviceType || "desktop";
      const device = rawDevice === "unknown" ? "desktop" : rawDevice;
      const referrer = event.referrerSource || "direct";
      deviceMap[device] = (deviceMap[device] || 0) + 1;
      referrerMap[referrer] = (referrerMap[referrer] || 0) + 1;
      continue;
    }

    if (event.type === "project_click") {
      totalProjectClicks += 1;
      const name = event.projectName || "Isimsiz Proje";
      projectMap[name] = (projectMap[name] || 0) + 1;
    }
  }

  for (const event of prevEvents) {
    if (event.type === "pageview") prevTotalVisits += 1;
    if (event.type === "project_click") prevTotalClicks += 1;
  }

  // Calculate trend percentages
  const visitsTrend = prevTotalVisits > 0 ? Math.round(((totalVisits - prevTotalVisits) / prevTotalVisits) * 100) : 0;
  const clicksTrend = prevTotalClicks > 0 ? Math.round(((totalProjectClicks - prevTotalClicks) / prevTotalClicks) * 100) : 0;

  const dailyVisits: DailyVisit[] = dateKeys.map((date) => ({ date, count: dailyMap[date] || 0 }));
  const projectClicks: ProjectClick[] = Object.entries(projectMap)
    .map(([project, count]) => ({ project, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  const deviceBreakdown: Breakdown[] = Object.entries(deviceMap)
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 4);

  const referrerBreakdown: Breakdown[] = Object.entries(referrerMap)
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  return {
    totalVisits,
    totalProjectClicks,
    visitsTrend,
    clicksTrend,
    dailyVisits,
    projectClicks,
    deviceBreakdown,
    referrerBreakdown,
  };
}
