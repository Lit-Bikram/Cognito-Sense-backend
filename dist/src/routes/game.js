"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const csvStore_1 = require("../datastore/csvStore");
const router = (0, express_1.Router)();
router.post("/", (req, res) => {
    try {
        const { userId, gameKey, gameResult } = req.body;
        console.log("🎮 Game API hit:", userId, gameKey);
        if (!userId || !gameKey || !gameResult) {
            return res.status(400).json({ error: "Invalid payload" });
        }
        // 1️⃣ Keep your existing behavior (local CSV storage)
        (0, csvStore_1.saveGameResult)({
            userId,
            gameKey,
            gameResult,
        });
        // 2️⃣ Update session store + run checker
        const { userSessions, tryFinalizeRow } = req.app.locals;
        userSessions[userId] = {
            ...userSessions[userId],
            games: {
                gameKey,
                gameResult,
            },
        };
        // 3️⃣ Ask backend: "Are all tasks finished?"
        tryFinalizeRow(userId);
        res.json({ success: true });
    }
    catch (err) {
        console.error("❌ Game save failed", err);
        res.status(500).json({ error: "Failed to save game result" });
    }
});
exports.default = router;
