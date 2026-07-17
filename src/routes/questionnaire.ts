import { Router } from "express";
import { saveQuestionnaire } from "../datastore/assessmentStore";
import { query } from "../db/pool";
import { requireAuth, AuthedRequest } from "../auth/authMiddleware";

const router = Router();

// Identity comes from the JWT (requireAuth) — not from the request body.
router.post("/", requireAuth, async (req: AuthedRequest, res) => {
  try {
    const userId = req.user!.userId;
    const { name, questionnaireResponse, totalScore, targetClass } = req.body;

    await saveQuestionnaire({
      userId,
      questionnaireResponse,
      totalScore,
      targetClass,
    });

    // Keep the user's display name up to date if the questionnaire collected it.
    if (name && String(name).trim()) {
      await query(
        "UPDATE users SET name = $1, updated_at = now() WHERE id = $2",
        [String(name).trim(), userId],
      );
    }

    res.json({ success: true });
  } catch (error) {
    console.error("❌ Error saving questionnaire:", error);
    res.status(500).json({ error: "Failed to save questionnaire" });
  }
});

export default router;
