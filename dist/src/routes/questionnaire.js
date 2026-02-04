"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const csvStore_1 = require("../datastore/csvStore");
const router = (0, express_1.Router)();
router.post("/", (req, res) => {
    try {
        console.log("✅ Questionnaire API hit");
        console.log("📦 Body received:", req.body);
        (0, csvStore_1.saveQuestionnaire)(req.body);
        res.json({ success: true });
    }
    catch (error) {
        console.error("❌ Error saving questionnaire:", error);
        res.status(500).json({ error: "Failed to save questionnaire" });
    }
});
exports.default = router;
