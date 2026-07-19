import { Pool } from "pg";

export const pool = new Pool({
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    host: process.env.POSTGRES_HOST,
    port: Number(process.env.POSTGRES_PORT),
    database: process.env.POSTGRES_DB,
    ssl: false, // change if your provider requires SSL
});

export async function testDatabaseConnection() {
    try {
        const client = await pool.connect();

        const result = await client.query("SELECT NOW();");

        console.log("=================================");
        console.log(" PostgreSQL Connected");
        console.log(" Time:", result.rows[0].now);
        console.log("=================================");

        client.release();
    } catch (err) {
        console.error("Database connection failed");
        console.error(err);
    }
}