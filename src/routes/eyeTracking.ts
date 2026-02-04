import express from "express";
import { updateEyeTrackingCSV } from "../datastore/csvStore";

const router = express.Router();

router.post("/", (req, res) => {
  try {
    const { userId, eyeTrackingResult } = req.body;

    if (!userId || !eyeTrackingResult) {
      return res.status(400).json({ error: "Missing data" });
    }

    console.log("👁️ Eye-tracking API hit for:", userId);

    // 1️⃣ Keep your existing local CSV behavior
    updateEyeTrackingCSV(userId, eyeTrackingResult);

    // 2️⃣ Update session store + run checker
    const { userSessions, tryFinalizeRow } = req.app.locals;

    userSessions[userId] = {
      ...userSessions[userId],
      eyeTracking: eyeTrackingResult,
    };

    // 3️⃣ Ask backend: "Are all three tasks finished?"
    tryFinalizeRow(userId);

    res.json({ success: true });
  } catch (err) {
    console.error("❌ Eye tracking save error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
