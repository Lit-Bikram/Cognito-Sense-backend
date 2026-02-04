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
        (0, csvStore_1.updateEyeTrackingCSV)(userId, eyeTrackingResult);
        res.json({ success: true });
    }
    catch (err) {
        console.error("❌ Eye tracking save error:", err);
        res.status(500).json({ error: "Server error" });
    }
});
exports.default = router;
