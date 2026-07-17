import { Pool, QueryResultRow } from "pg";

// Central Postgres connection pool.
// Reads connection details from the POSTGRES_* env vars (see .env).
const useSSL = String(process.env.PGSSL).toLowerCase() === "true";

export const pool = new Pool({
  host: process.env.POSTGRES_HOST,
  port: Number(process.env.POSTGRES_PORT || 5432),
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  ssl: useSSL ? { rejectUnauthorized: false } : undefined,
});

pool.on("error", (err) => {
  console.error("❌ Unexpected Postgres pool error:", err);
});

// Small helper so callers don't have to grab/release clients manually.
export function query<T extends QueryResultRow = any>(
  text: string,
  params?: any[],
) {
  return pool.query<T>(text, params);
}
