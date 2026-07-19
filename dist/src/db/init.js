"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initDb = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const pool_1 = require("./pool");
// Runs the schema on startup so the remote DB is provisioned automatically.
// schema.sql is idempotent (CREATE TABLE IF NOT EXISTS), so this is safe to
// run every time the server boots.
async function initDb() {
    // When compiled, __dirname points at dist/src/db, so schema.sql (a non-.ts
    // file) is copied next to it by the build step — but during ts-node dev it
    // lives in src/db. Try both.
    const candidates = [
        path_1.default.join(__dirname, "schema.sql"),
        path_1.default.join(process.cwd(), "src", "db", "schema.sql"),
    ];
    const schemaPath = candidates.find((p) => fs_1.default.existsSync(p));
    if (!schemaPath) {
        throw new Error("Could not locate schema.sql in: " + candidates.join(", "));
    }
    const sql = fs_1.default.readFileSync(schemaPath, "utf8");
    await pool_1.pool.query(sql);
    const cols = await pool_1.pool.query(`
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'assessments'
ORDER BY ordinal_position
`);
    console.log("Assessment columns:");
    console.table(cols.rows);
    const dbInfo = await pool_1.pool.query(`
SELECT current_database(), current_schema(), current_user
`);
    console.log(dbInfo.rows[0]);
    console.log("✅ Database schema ensured (users, assessments)");
}
exports.initDb = initDb;
