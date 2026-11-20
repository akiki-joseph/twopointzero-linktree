// Creates the table on first use, so no manual database setup is needed.
let ready = false;

export async function getDb(env) {
  if (!env.DB) throw new Error("D1 binding 'DB' is missing");
  if (!ready) {
    await env.DB.batch([
      env.DB.prepare(`CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL,
        link TEXT,
        country TEXT,
        referrer TEXT,
        created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
      )`),
      env.DB.prepare(`CREATE INDEX IF NOT EXISTS events_created_at_idx ON events (created_at)`),
    ]);
    ready = true;
  }
  return env.DB;
}
