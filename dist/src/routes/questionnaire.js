"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const assessmentStore_1 = require("../datastore/assessmentStore");
const pool_1 = require("../db/pool");
const authMiddleware_1 = require("../auth/authMiddleware");
const router = (0, express_1.Router)();
// Identity comes from the JWT (requireAuth) — not from the request body.
router.post("/", authMiddleware_1.requireAuth, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { name, questionnaireResponse, totalScore, targetClass } = req.body;
        await (0, assessmentStore_1.saveQuestionnaire)({
            userId,
            questionnaireResponse,
            totalScore,
            targetClass,
        });
        // Keep the user's display name up to date if the questionnaire collected it.
        if (name && String(name).trim()) {
            await (0, pool_1.query)("UPDATE users SET name = $1, updated_at = now() WHERE id = $2", [String(name).trim(), userId]);
        }
        res.json({ success: true });
    }
    catch (error) {
        console.error("❌ Error saving questionnaire:", error);
        res.status(500).json({ error: "Failed to save questionnaire" });
    }
});
exports.default = router;
