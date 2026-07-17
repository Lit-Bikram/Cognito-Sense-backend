"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const assessmentStore_1 = require("../datastore/assessmentStore");
const authMiddleware_1 = require("../auth/authMiddleware");
const router = (0, express_1.Router)();
router.post("/", authMiddleware_1.requireAuth, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { eyeTrackingResult } = req.body;
        if (!eyeTrackingResult) {
            return res.status(400).json({ error: "Missing data" });
        }
        console.log("👁️ Eye-tracking API hit for:", userId);
        // Save into the user's assessments row (Postgres is the single store now).
        await (0, assessmentStore_1.updateEyeTracking)(userId, eyeTrackingResult);
        if (await (0, assessmentStore_1.isRowComplete)(userId)) {
            console.log("✅ FULL ASSESSMENT COMPLETE for user:", userId);
            return res.json({ success: true, complete: true });
        }
        const row = await (0, assessmentStore_1.getAssessment)(userId);
        const missing = (0, assessmentStore_1.missingTasks)(row);
        console.log("⏳ Incomplete — missing:", missing);
        res.json({ success: true, complete: false, missingTasks: missing });
    }
    catch (err) {
        console.error("❌ Eye tracking save error:", err);
        res.status(500).json({ error: "Server error" });
    }
});
exports.default = router;
