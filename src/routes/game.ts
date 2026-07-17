import { Router } from "express";
import { saveGameResult } from "../datastore/assessmentStore";
import { requireAuth, AuthedRequest } from "../auth/authMiddleware";

const router = Router();

router.post("/", requireAuth, async (req: AuthedRequest, res) => {
  try {
    const userId = req.user!.userId;
    const { gameKey, gameResult } = req.body;

    console.log("🎮 Game API hit:", userId, gameKey);

    if (!gameKey || !gameResult) {
      return res.status(400).json({ error: "Invalid payload" });
    }

    await saveGameResult({ userId, gameKey, gameResult });

    res.json({ success: true });
  } catch (err) {
    console.error("❌ Game save failed", err);
    res.status(500).json({ error: "Failed to save game result" });
  }
});

export default router;
