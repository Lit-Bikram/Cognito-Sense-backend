"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const csvStore_1 = require("../datastore/csvStore");
const googleDrive_1 = require("../googleDrive");
const router = express_1.default.Router();
/* --------- IMPORTANT: CSV SAFE HELPER --------- */
function csvSafe(value) {
    // If the value is already a JSON string, keep it;
    // otherwise stringify it.
    const text = typeof value === "string" ? value : JSON.stringify(value || {});
    // Escape internal quotes and wrap the whole thing in quotes
    return `"${text.replace(/"/g, '""')}"`;
}
/* ---------------------------------------------- */
router.post("/", async (req, res) => {
    try {
        const { userId, eyeTrackingResult } = req.body;
        if (!userId || !eyeTrackingResult) {
            return res.status(400).json({ error: "Missing data" });
        }
        console.log("👁️ Eye-tracking API hit for:", userId);
        // 1️⃣ Update existing CSV row (NEVER create a new one)
        (0, csvStore_1.updateEyeTrackingCSV)(userId, eyeTrackingResult);
        // 2️⃣ Re-read the SAME CSV from disk
        const rows = (0, csvStore_1.readRows)();
        const row = rows.find((r) => String(r.user_id).trim() === String(userId).trim());
        if (!row) {
            console.log("⚠️ Still no CSV row found for:", userId);
            return res.json({ success: true, note: "Row not found yet" });
        }
        // 3️⃣ If everything is complete → upload to Drive
        if ((0, csvStore_1.isRowComplete)(userId)) {
            console.log("✅ FULL ROW COMPLETE — uploading to Drive...");
            const csvLine = [
                row.user_id,
                row.email,
                row.name,
                csvSafe(row.questionnaire_response),
                csvSafe(row.games_response),
                csvSafe(row.eye_tracking_response),
                row.q_total_score,
                row.target_risk_class,
                row.q_completed_at,
                row.created_at,
                new Date().toISOString(),
            ].join(",");
            await (0, googleDrive_1.appendRowToDriveCSV)(csvLine);
        }
        else {
            console.log("⏳ Row not complete yet — skipping Drive upload");
        }
        if ((0, csvStore_1.isRowComplete)(userId)) {
            console.log("📤 Data uploaded to Drive — sending confirmation to frontend");
            res.json({ success: true, uploadedToDrive: true });
        }
        else {
            const missing = [];
            // --- 1) Questionnaire ---
            if (!row.questionnaire_response ||
                row.questionnaire_response.trim() === "") {
                missing.push("Questionnaire");
            }
            // --- 2) Eye Tracking ---
            if (!row.eye_tracking_response ||
                row.eye_tracking_response.trim() === "") {
                missing.push("Eye Tracking");
            }
            // --- 3) GAMES → must PARSE JSON ---
            let gamesIncomplete = false;
            try {
                const games = JSON.parse(row.games_response || "{}");
                const gameKeys = [
                    "laundry_sorter",
                    "memory_dialer",
                    "money_manager",
                    "shopping_list_recall",
                ];
                const unfinished = gameKeys.filter((k) => games[k] === null || games[k] === undefined);
                if (unfinished.length > 0) {
                    gamesIncomplete = true;
                    missing.push("Games (" + unfinished.join(", ") + ")");
                }
            }
            catch (err) {
                console.warn("Could not parse games_response:", err);
                missing.push("Games (corrupt data)");
            }
            console.log("⏳ Incomplete — missing:", missing);
            res.json({
                success: true,
                uploadedToDrive: false,
                missingTasks: missing,
            });
        }
    }
    catch (err) {
        console.error("❌ Eye tracking save error:", err);
        res.status(500).json({ error: "Server error" });
    }
});
exports.default = router;
