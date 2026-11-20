import { getDb } from "../_db.js";

const COUNTRY_NAMES = (() => {
  try { return new Intl.DisplayNames(["en"], { type: "region" }); } catch { return null; }
})();

function hostOf(ref) {
  if (!ref) return "Direct";
  try { return new URL(ref).hostname.replace(/^www\./, "") || "Direct"; } catch { return ref; }
}

export async function onRequestGet({ env }) {
  const db = await getDb(env);
  const since7 = new Date(Date.now() - 7 * 864e5).toISOString();
  const since1 = new Date(Date.now() - 864e5).toISOString();
  const since30 = new Date(Date.now() - 30 * 864e5).toISOString();

  const [totals, daily, refs, countries] = await db.batch([
    db.prepare(`
      SELECT CASE WHEN type = 'view' THEN 'page_views' ELSE link END AS key,
             COUNT(*) AS all_time,
             SUM(created_at > ?1) AS last_7_days,
             SUM(created_at > ?2) AS last_24_hours
      FROM events
      WHERE type = 'view' OR (type = 'click' AND link IS NOT NULL)
      GROUP BY 1`).bind(since7, since1),
    db.prepare(`
      SELECT date(created_at, '+2 hours') AS day,
             SUM(type = 'view') AS views,
             SUM(type = 'click' AND link = 'whatsapp') AS whatsapp,
             SUM(type = 'click' AND link = 'facebook') AS facebook,
             SUM(type = 'click' AND link = 'instagram') AS instagram,
             SUM(type = 'click' AND link = 'location') AS location
      FROM events WHERE created_at > ?1
      GROUP BY 1 ORDER BY 1 DESC`).bind(since30),
    db.prepare(`SELECT referrer, COUNT(*) AS views FROM events WHERE type = 'view' GROUP BY referrer`),
    db.prepare(`SELECT COALESCE(country, '') AS country, COUNT(*) AS views FROM events
                WHERE type = 'view' GROUP BY 1 ORDER BY 2 DESC LIMIT 10`),
  ]);

  const n = (v) => Number(v) || 0;

  const byHost = {};
  for (const r of refs.results) {
    const h = hostOf(r.referrer);
    byHost[h] = (byHost[h] || 0) + n(r.views);
  }
  const referrers = Object.entries(byHost)
    .map(([referrer, views]) => ({ referrer, views }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 10);

  const body = {
    totals: totals.results.map((r) => ({ key: r.key, all_time: n(r.all_time), last_7_days: n(r.last_7_days), last_24_hours: n(r.last_24_hours) })),
    daily: daily.results.map((r) => ({ day: r.day, views: n(r.views), whatsapp: n(r.whatsapp), facebook: n(r.facebook), instagram: n(r.instagram), location: n(r.location) })),
    referrers,
    countries: countries.results.map((r) => ({
      country: r.country ? (COUNTRY_NAMES ? COUNTRY_NAMES.of(r.country) : r.country) : "Unknown",
      views: n(r.views),
    })),
  };

  return Response.json(body, { headers: { "Cache-Control": "no-store" } });
}
