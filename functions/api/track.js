import { getDb } from "../_db.js";

const LINKS = new Set(["whatsapp", "facebook", "tiktok", "instagram", "location"]);

export async function onRequestPost({ request, env }) {
  let data;
  try {
    data = JSON.parse(await request.text());
  } catch {
    return new Response("Bad request", { status: 400 });
  }

  const type = data && data.type;
  if (type !== "view" && type !== "click") return new Response("Bad request", { status: 400 });

  const link = type === "click" ? String(data.link || "").toLowerCase() : null;
  if (type === "click" && !LINKS.has(link)) return new Response("Bad request", { status: 400 });

  const referrer = type === "view" && data.referrer ? String(data.referrer).slice(0, 500) : null;
  const country = (request.cf && request.cf.country) || null;

  const db = await getDb(env);
  await db.prepare("INSERT INTO events (type, link, country, referrer) VALUES (?, ?, ?, ?)")
    .bind(type, link, country, referrer)
    .run();

  return new Response(null, { status: 204 });
}
