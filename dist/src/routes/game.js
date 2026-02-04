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
        (0, csvStore_1.saveGameResult)({
            userId,
            gameKey,
            gameResult,
        });
        res.json({ success: true });
    }
    catch (err) {
        console.error("❌ Game save failed", err);
        res.status(500).json({ error: "Failed to save game result" });
    }
});
exports.default = router;
