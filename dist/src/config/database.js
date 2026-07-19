"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testDatabaseConnection = exports.pool = void 0;
const pg_1 = require("pg");
exports.pool = new pg_1.Pool({
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    host: process.env.POSTGRES_HOST,
    port: Number(process.env.POSTGRES_PORT),
    database: process.env.POSTGRES_DB,
    ssl: false, // change if your provider requires SSL
});
async function testDatabaseConnection() {
    try {
        const client = await exports.pool.connect();
        const result = await client.query("SELECT NOW();");
        console.log("=================================");
        console.log(" PostgreSQL Connected");
        console.log(" Time:", result.rows[0].now);
        console.log("=================================");
        client.release();
    }
    catch (err) {
        console.error("Database connection failed");
        console.error(err);
    }
}
exports.testDatabaseConnection = testDatabaseConnection;
