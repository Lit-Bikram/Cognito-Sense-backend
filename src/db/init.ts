import fs from "fs";
import path from "path";
import { pool } from "./pool";

// Runs the schema on startup so the remote DB is provisioned automatically.
// schema.sql is idempotent (CREATE TABLE IF NOT EXISTS), so this is safe to
// run every time the server boots.
export async function initDb() {
  // When compiled, __dirname points at dist/src/db, so schema.sql (a non-.ts
  // file) is copied next to it by the build step — but during ts-node dev it
  // lives in src/db. Try both.
  const candidates = [
    path.join(__dirname, "schema.sql"),
    path.join(process.cwd(), "src", "db", "schema.sql"),
  ];

  const schemaPath = candidates.find((p) => fs.existsSync(p));
  if (!schemaPath) {
    throw new Error("Could not locate schema.sql in: " + candidates.join(", "));
  }

  const sql = fs.readFileSync(schemaPath, "utf8");
  await pool.query(sql);
  console.log("✅ Database schema ensured (users, assessments)");
}
