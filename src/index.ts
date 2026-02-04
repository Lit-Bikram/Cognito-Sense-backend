import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import questionnaireRoute from "./routes/questionnaire";
import gameRoutes from "./routes/game";
import eyeTrackingRoute from "./routes/eyeTracking";

const app = express();

app.use(cors());
app.use(express.json());

// ✅ Routes
app.use("/api/questionnaire", questionnaireRoute);
app.use("/api/game", gameRoutes);
app.use("/api/eye-tracking", eyeTrackingRoute);

app.get("/api/view-csv", (req, res) => {
  try {
    // 👉 IMPORTANT: point to ROOT /data folder, NOT dist/data
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

// ✅ Health check (optional but useful)
app.get("/", (req, res) => {
  res.send("✅ CognitoSense Backend is Running");
});

const PORT = 4000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("✅ Backend running on:");
  // console.log(`➡ http://localhost:${PORT}`);
  // console.log(`➡ http://192.168.1.2:${PORT}`);
});
