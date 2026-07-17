"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const assessmentStore_1 = require("../datastore/assessmentStore");
const authMiddleware_1 = require("../auth/authMiddleware");
const router = (0, express_1.Router)();
// Which of the 3 tasks the logged-in user has completed.
// Used by the main-menu screen to show pending tasks and unlock the
// "Check Final Result" button once everything is done.
router.get("/", authMiddleware_1.requireAuth, async (req, res) => {
    try {
        const status = await (0, assessmentStore_1.getStatus)(req.user.userId);
        res.json(status);
    }
    catch (err) {
        console.error("❌ Status check failed:", err);
        res.status(500).json({ error: "Failed to load status" });
    }
});
exports.default = router;
