"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const csvStore_1 = require("../datastore/csvStore");
const router = express_1.default.Router();
router.post("/", (req, res) => {
    try {
        const { userId, eyeTrackingResult } = req.body;
        if (!userId || !eyeTrackingResult) {
            return res.status(400).json({ error: "Missing data" });
        }
        console.log("👁️ Eye-tracking API hit for:", userId);
        // 1️⃣ Keep your existing local CSV behavior
        (0, csvStore_1.updateEyeTrackingCSV)(userId, eyeTrackingResult);
        // 2️⃣ Update session store + run checker
        const { userSessions, tryFinalizeRow } = req.app.locals;
        userSessions[userId] = {
            ...userSessions[userId],
            eyeTracking: eyeTrackingResult,
        };
        // 3️⃣ Ask backend: "Are all three tasks finished?"
        tryFinalizeRow(userId);
        res.json({ success: true });
    }
    catch (err) {
        console.error("❌ Eye tracking save error:", err);
        res.status(500).json({ error: "Server error" });
    }
});
exports.default = router;
