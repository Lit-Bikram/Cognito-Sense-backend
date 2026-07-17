"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const assessmentStore_1 = require("../datastore/assessmentStore");
const authMiddleware_1 = require("../auth/authMiddleware");
const router = (0, express_1.Router)();
router.post("/", authMiddleware_1.requireAuth, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { gameKey, gameResult } = req.body;
        console.log("🎮 Game API hit:", userId, gameKey);
        if (!gameKey || !gameResult) {
            return res.status(400).json({ error: "Invalid payload" });
        }
        await (0, assessmentStore_1.saveGameResult)({ userId, gameKey, gameResult });
        res.json({ success: true });
    }
    catch (err) {
        console.error("❌ Game save failed", err);
        res.status(500).json({ error: "Failed to save game result" });
    }
});
exports.default = router;
