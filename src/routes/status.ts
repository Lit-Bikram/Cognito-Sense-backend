import { Router } from "express";
import { getStatus } from "../datastore/assessmentStore";
import { requireAuth, AuthedRequest } from "../auth/authMiddleware";

const router = Router();

// Which of the 3 tasks the logged-in user has completed.
// Used by the main-menu screen to show pending tasks and unlock the
// "Check Final Result" button once everything is done.
router.get("/", requireAuth, async (req: AuthedRequest, res) => {
  try {
    const status = await getStatus(req.user!.userId);
    res.json(status);
  } catch (err) {
    console.error("❌ Status check failed:", err);
    res.status(500).json({ error: "Failed to load status" });
  }
});

export default router;
