import express from "express";
import {
  updateEyeTrackingCSV,
  isRowComplete,
  readRows,
} from "../datastore/csvStore";
import { appendRowToDriveCSV } from "../googleDrive";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { userId, eyeTrackingResult } = req.body;

    if (!userId || !eyeTrackingResult) {
      return res.status(400).json({ error: "Missing data" });
    }

    console.log("👁️ Eye-tracking API hit for:", userId);

    // 1️⃣ Update existing CSV row (NO new rows)
    updateEyeTrackingCSV(userId, eyeTrackingResult);

    // 2️⃣ Re-read the SAME CSV file from disk
    const rows = readRows();
    const row = rows.find(
      (r: any) => String(r.user_id).trim() === String(userId).trim()
    );

    if (!row) {
      console.log("⚠️ Still no CSV row found for:", userId);
      return res.json({ success: true, note: "Row not found yet" });
    }

    // 3️⃣ If everything is complete → send to Drive
    if (isRowComplete(userId)) {
      console.log("✅ FULL ROW COMPLETE — uploading to Drive...");

      const csvLine = [
        row.user_id,
        row.email,
        row.name,
        row.questionnaire_response,
        row.games_response,
        row.eye_tracking_response,
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

    res.json({ success: true });
  } catch (err) {
    console.error("❌ Eye tracking save error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
