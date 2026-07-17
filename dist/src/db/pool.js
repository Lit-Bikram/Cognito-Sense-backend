"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.query = exports.pool = void 0;
const pg_1 = require("pg");
// Central Postgres connection pool.
// Reads connection details from the POSTGRES_* env vars (see .env).
const useSSL = String(process.env.PGSSL).toLowerCase() === "true";
exports.pool = new pg_1.Pool({
    host: process.env.POSTGRES_HOST,
    port: Number(process.env.POSTGRES_PORT || 5432),
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    ssl: useSSL ? { rejectUnauthorized: false } : undefined,
});
exports.pool.on("error", (err) => {
    console.error("❌ Unexpected Postgres pool error:", err);
});
// Small helper so callers don't have to grab/release clients manually.
function query(text, params) {
    return exports.pool.query(text, params);
}
exports.query = query;
