"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const init_1 = require("./db/init");
const pool_1 = require("./db/pool");
const authRoutes_1 = __importDefault(require("./auth/authRoutes"));
const questionnaire_1 = __importDefault(require("./routes/questionnaire"));
const game_1 = __importDefault(require("./routes/game"));
const eyeTracking_1 = __importDefault(require("./routes/eyeTracking"));
const status_1 = __importDefault(require("./routes/status"));
const database_1 = require("./config/database");
const modelLoader_1 = require("./ml/modelLoader");
const result_1 = __importDefault(require("./routes/result"));
const app = (0, express_1.default)();
const PORT = Number(process.env.PORT || 4000);
app.use((0, cors_1.default)());
app.use(express_1.default.json({ limit: "5mb" }));
// Auth (login / create account)
app.use("/api/auth", authRoutes_1.default);
// Data routes (all JWT-protected, all persisting to Postgres)
app.use("/api/questionnaire", questionnaire_1.default);
app.use("/api/game", game_1.default);
app.use("/api/eye-tracking", eyeTracking_1.default);
app.use("/api/status", status_1.default);
app.use("/api/result", result_1.default);
// Admin: dump all assessments joined with users (JSON).
app.get("/api/view-data", async (_req, res) => {
    try {
        const result = await (0, pool_1.query)(`SELECT u.id AS user_id, u.email, u.name,
      a.questionnaire_response, a.games_response, a.eye_tracking_response,
      a.q_total_score, a.target_risk_class, a.q_completed_at,
      a.created_at, a.last_updated
      FROM users u
      LEFT JOIN assessments a ON a.user_id = u.id
      ORDER BY u.id`);
        res.json(result.rows);
    }
    catch (err) {
        console.error("view-data error:", err);
        res.status(500).json({ error: "Failed to read data" });
    }
});
// Health check
app.get("/", (_req, res) => {
    res.send("✅ CognitoSense Backend is Running");
});
async function startServer() {
    try {
        await (0, init_1.initDb)();
        await (0, database_1.testDatabaseConnection)();
        await (0, modelLoader_1.initializeModel)();
        app.listen(PORT, "0.0.0.0", () => {
            console.log("✅ Backend running on port", PORT);
        });
    }
    catch (err) {
        console.error("❌ Failed to initialize database — server not started:", err);
        process.exit(1);
    }
}
void startServer();
