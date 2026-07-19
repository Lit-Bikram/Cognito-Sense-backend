import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import { initDb } from "./db/init";
import { query } from "./db/pool";
import authRoutes from "./auth/authRoutes";
import questionnaireRoute from "./routes/questionnaire";
import gameRoutes from "./routes/game";
import eyeTrackingRoute from "./routes/eyeTracking";
import statusRoute from "./routes/status";
import { testDatabaseConnection } from "./config/database";
import { initializeModel } from "./ml/modelLoader";
import resultRoute from "./routes/result";

const app = express();
const PORT = Number(process.env.PORT || 4000);

app.use(cors());
app.use(express.json({ limit: "5mb" }));

// Auth (login / create account)
app.use("/api/auth", authRoutes);

// Data routes (all JWT-protected, all persisting to Postgres)
app.use("/api/questionnaire", questionnaireRoute);
app.use("/api/game", gameRoutes);
app.use("/api/eye-tracking", eyeTrackingRoute);
app.use("/api/status", statusRoute);
app.use("/api/result", resultRoute);

// Admin: dump all assessments joined with users (JSON).
app.get("/api/view-data", async (_req, res) => {
  try {
    const result = await query(
      `SELECT u.id AS user_id, u.email, u.name,
      a.questionnaire_response, a.games_response, a.eye_tracking_response,
      a.q_total_score, a.target_risk_class, a.q_completed_at,
      a.created_at, a.last_updated
      FROM users u
      LEFT JOIN assessments a ON a.user_id = u.id
      ORDER BY u.id`,
    );
    res.json(result.rows);
  } catch (err) {
    console.error("view-data error:", err);
    res.status(500).json({ error: "Failed to read data" });
  }
});

// Health check
app.get("/", (_req, res) => {
  res.send("✅ CognitoSense Backend is Running");
});

app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);

    await testDatabaseConnection();
});

initDb()
.then(() => {
  app.listen(PORT, "0.0.0.0", () => {
    console.log("✅ Backend running on port", PORT);
  });
  })
  .catch((err) => {
    console.error("❌ Failed to initialize database — server not started:", err);
    process.exit(1);
  });
  
initializeModel();