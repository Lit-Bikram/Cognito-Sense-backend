import express from "express";
import { updateEyeTrackingCSV, isRowComplete } from "../datastore/csvStore";
import { appendRowToDriveCSV } from "../googleDrive";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { userId, eyeTrackingResult } = req.body;

    if (!userId || !eyeTrackingResult) {
      return res.status(400).json({ error: "Missing data" });
    }

    console.log("👁️ Eye-tracking API hit for:", userId);

    // ✅ STEP 1 — Update the EXISTING row only (never create a new one)
    updateEyeTrackingCSV(userId, eyeTrackingResult);

    // ✅ STEP 2 — Check if the row is now FULLY COMPLETE
    const rows = require("../datastore/csvStore").readRows?.() || [];
    const row = rows.find((r: any) => r.user_id === userId);

    if (!row) {
      console.log("⚠️ No CSV row found for user:", userId);
      return res.json({ success: true, note: "Row not found yet" });
    }

    if (isRowComplete(userId)) {
      console.log("✅ FULL ROW COMPLETE — uploading to Drive...");

      // Convert CSV row into a single line for Drive
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
