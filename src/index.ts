import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import questionnaireRoute from "./routes/questionnaire";
import gameRoutes from "./routes/game";
import eyeTrackingRoute from "./routes/eyeTracking";
import { appendRowToDriveCSV } from "./googleDrive";

const app = express();

// ✅ TEMPORARY SESSION STORE (one per user)
const userSessions: Record<string, any> = {};

app.use(cors());
app.use(express.json());

// Make session store + checker available to routes
app.locals.userSessions = userSessions;
app.locals.tryFinalizeRow = tryFinalizeRow;

// Routes
app.use("/api/questionnaire", questionnaireRoute);
app.use("/api/game", gameRoutes);
app.use("/api/eye-tracking", eyeTrackingRoute);

// ---------------- CHECKER FUNCTION ----------------
const CSV_PATH = path.join(process.cwd(), "data", "cognito_sense_master.csv");

function tryFinalizeRow(userId: string) {
  const data = userSessions[userId];
  if (!data) return;

  // Only finalize when ALL THREE are present
  if (
    data.questionnaire &&
    data.games &&
    data.eyeTracking
  ) {
    const now = new Date().toISOString();

    const row = [
      userId,
      data.email,
      data.name,
      JSON.stringify(data.questionnaire),
      JSON.stringify(data.games),
      JSON.stringify(data.eyeTracking),
      data.q_total_score,
      data.target_risk_class,
      data.q_completed_at,
      data.created_at || now,
      now, // last_updated
    ].join(",");

    // Save locally
    fs.appendFileSync(CSV_PATH, row + "\n");

    // Upload to Google Drive
    appendRowToDriveCSV(row);

    console.log("✅ FINAL ROW SAVED FOR:", userId);

    // Prevent duplicate rows
    delete userSessions[userId];
  }
}
// -------------------------------------------------

app.get("/api/view-csv", (req, res) => {
  try {
    const csvPath = path.join(process.cwd(), "data", "cognito_sense_master.csv");

    if (!fs.existsSync(csvPath)) {
      return res.status(404).json({
        error: "CSV file not found",
        pathTried: csvPath,
      });
    }

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      "inline; filename=cognito_sense_master.csv"
    );

    const fileData = fs.readFileSync(csvPath, "utf8");
    res.send(fileData);
  } catch (err) {
    console.error("CSV read error:", err);
    res.status(500).json({ error: "Failed to read CSV file" });
  }
});

// Health check
app.get("/", (req, res) => {
  res.send("✅ CognitoSense Backend is Running");
});

const PORT = 4000;
app.listen(PORT, "0.0.0.0", () => {
  console.log("✅ Backend running on port", PORT);
});
