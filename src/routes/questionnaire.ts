import { Router } from "express";
import { saveQuestionnaire } from "../datastore/csvStore";

const router = Router();

router.post("/", (req, res) => {
  try {
    console.log("✅ Questionnaire API hit");
    console.log("📦 Body received:", req.body);

    const {
      userId,
      email,
      name,
      questionnaireResponse,
      totalScore,
      targetClass,
    } = req.body;

    // 1️⃣ Keep your existing CSV behavior exactly as it is
    saveQuestionnaire(req.body);

    // 2️⃣ Update session store + run checker
    const { userSessions, tryFinalizeRow } = req.app.locals;

    userSessions[userId] = {
      ...userSessions[userId],
      email,
      name,
      questionnaire: questionnaireResponse,
      q_total_score: totalScore,
      target_risk_class: targetClass,
      q_completed_at: new Date().toISOString(),
      created_at:
        userSessions[userId]?.created_at || new Date().toISOString(),
    };

    // 3️⃣ Ask backend: "Is everything finished yet?"
    tryFinalizeRow(userId);

    res.json({ success: true });
  } catch (error) {
    console.error("❌ Error saving questionnaire:", error);
    res.status(500).json({ error: "Failed to save questionnaire" });
  }
});

export default router;
