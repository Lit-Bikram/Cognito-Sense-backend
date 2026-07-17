import { Router } from "express";
import {
  updateEyeTracking,
  isRowComplete,
  getAssessment,
  missingTasks,
} from "../datastore/assessmentStore";
import { requireAuth, AuthedRequest } from "../auth/authMiddleware";

const router = Router();

router.post("/", requireAuth, async (req: AuthedRequest, res) => {
  try {
    const userId = req.user!.userId;
    const { eyeTrackingResult } = req.body;

    if (!eyeTrackingResult) {
      return res.status(400).json({ error: "Missing data" });
    }

    console.log("👁️ Eye-tracking API hit for:", userId);

    // Save into the user's assessments row (Postgres is the single store now).
    await updateEyeTracking(userId, eyeTrackingResult);

    if (await isRowComplete(userId)) {
      console.log("✅ FULL ASSESSMENT COMPLETE for user:", userId);
      return res.json({ success: true, complete: true });
    }

    const row = await getAssessment(userId);
    const missing = missingTasks(row);
    console.log("⏳ Incomplete — missing:", missing);

    res.json({ success: true, complete: false, missingTasks: missing });
  } catch (err) {
    console.error("❌ Eye tracking save error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
