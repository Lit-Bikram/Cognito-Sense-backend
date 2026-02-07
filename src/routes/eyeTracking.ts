import express from "express";
import {
  updateEyeTrackingCSV,
  isRowComplete,
  readRows,
} from "../datastore/csvStore";
import { appendRowToDriveCSV } from "../googleDrive";

const router = express.Router();

/* --------- IMPORTANT: CSV SAFE HELPER --------- */
function csvSafe(value: any) {
  // If the value is already a JSON string, keep it;
  // otherwise stringify it.
  const text = typeof value === "string" ? value : JSON.stringify(value || {});

  // Escape internal quotes and wrap the whole thing in quotes
  return `"${text.replace(/"/g, '""')}"`;
}
/* ---------------------------------------------- */

router.post("/", async (req, res) => {
  try {
    const { userId, eyeTrackingResult } = req.body;

    if (!userId || !eyeTrackingResult) {
      return res.status(400).json({ error: "Missing data" });
    }

    console.log("👁️ Eye-tracking API hit for:", userId);

    // 1️⃣ Update existing CSV row (NEVER create a new one)
    updateEyeTrackingCSV(userId, eyeTrackingResult);

    // 2️⃣ Re-read the SAME CSV from disk
    const rows = readRows();
    const row = rows.find(
      (r: any) => String(r.user_id).trim() === String(userId).trim(),
    );

    if (!row) {
      console.log("⚠️ Still no CSV row found for:", userId);
      return res.json({ success: true, note: "Row not found yet" });
    }

    // 3️⃣ If everything is complete → upload to Drive
    if (isRowComplete(userId)) {
      console.log("✅ FULL ROW COMPLETE — uploading to Drive...");

      const csvLine = [
        row.user_id,
        row.email,
        row.name,
        csvSafe(row.questionnaire_response),
        csvSafe(row.games_response),
        csvSafe(row.eye_tracking_response),
        row.q_total_score,
        row.target_risk_class,
        row.q_completed_at,
        row.created_at,
        new Date().toISOString(),
      ].join(",");

      await appendRowToDriveCSV(csvLine);
    } else {
      console.log("⏳ Row not complete yet — skipping Drive upload");
    }

    if (isRowComplete(userId)) {
      console.log(
        "📤 Data uploaded to Drive — sending confirmation to frontend",
      );
      res.json({ success: true, uploadedToDrive: true });
    } else {
      // 👉 NEW: Tell frontend what is missing
      const missing = [];

      if (!row.questionnaire_response) missing.push("Questionnaire");
      if (!row.games_response) missing.push("Games");
      if (!row.eye_tracking_response) missing.push("Eye Tracking");

      console.log("⏳ Incomplete — missing:", missing);

      res.json({
        success: true,
        uploadedToDrive: false,
        missingTasks: missing,
      });
    }
  } catch (err) {
    console.error("❌ Eye tracking save error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
