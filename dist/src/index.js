"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const questionnaire_1 = __importDefault(require("./routes/questionnaire"));
const game_1 = __importDefault(require("./routes/game"));
const eyeTracking_1 = __importDefault(require("./routes/eyeTracking"));
const googleDrive_1 = require("./googleDrive");
const app = (0, express_1.default)();
// ✅ TEMPORARY SESSION STORE (one per user)
const userSessions = {};
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Make session store + checker available to routes
app.locals.userSessions = userSessions;
app.locals.tryFinalizeRow = tryFinalizeRow;
// Routes
app.use("/api/questionnaire", questionnaire_1.default);
app.use("/api/game", game_1.default);
app.use("/api/eye-tracking", eyeTracking_1.default);
// ---------------- CHECKER FUNCTION ----------------
const CSV_PATH = path_1.default.join(process.cwd(), "data", "cognito_sense_master.csv");
function tryFinalizeRow(userId) {
    const data = userSessions[userId];
    if (!data)
        return;
    // Only finalize when ALL THREE are present
    if (data.questionnaire &&
        data.games &&
        data.eyeTracking) {
        const now = new Date().toISOString();
        const row = [
            userId,
            data.email,
            data.name,
            JSON.stringify(data.questionnaire),
            JSON.stringify(data.games),
            JSON.stringify(data.eyeTracking),
            data.q_total_score,
            data.target_risk_class,
            data.q_completed_at,
            data.created_at || now,
            now, // last_updated
        ].join(",");
        // Save locally
        fs_1.default.appendFileSync(CSV_PATH, row + "\n");
        // Upload to Google Drive
        (0, googleDrive_1.appendRowToDriveCSV)(row);
        console.log("✅ FINAL ROW SAVED FOR:", userId);
        // Prevent duplicate rows
        delete userSessions[userId];
    }
}
// -------------------------------------------------
app.get("/api/view-csv", (req, res) => {
    try {
        const csvPath = path_1.default.join(process.cwd(), "data", "cognito_sense_master.csv");
        if (!fs_1.default.existsSync(csvPath)) {
            return res.status(404).json({
                error: "CSV file not found",
                pathTried: csvPath,
            });
        }
        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", "inline; filename=cognito_sense_master.csv");
        const fileData = fs_1.default.readFileSync(csvPath, "utf8");
        res.send(fileData);
    }
    catch (err) {
        console.error("CSV read error:", err);
        res.status(500).json({ error: "Failed to read CSV file" });
    }
});
// Health check
app.get("/", (req, res) => {
    res.send("✅ CognitoSense Backend is Running");
});
const PORT = 4000;
app.listen(PORT, "0.0.0.0", () => {
    console.log("✅ Backend running on port", PORT);
});
