"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateEyeTrackingCSV = exports.saveGameResult = exports.saveQuestionnaire = exports.HEADERS = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const sync_1 = require("csv-parse/sync");
const sync_2 = require("csv-stringify/sync");
const CSV_PATH = path_1.default.join(process.cwd(), "data", "cognito_sense_master.csv");
console.log("🔥 csvStore.ts loaded");
console.log("📁 CSV PATH =", path_1.default.join(process.cwd(), "data", "cognito_sense_master.csv"));
exports.HEADERS = [
    "user_id",
    "email",
    "name",
    "questionnaire_response",
    "games_response",
    "eye_tracking_response",
    "q_total_score",
    "target_risk_class",
    "q_completed_at",
    "created_at",
    "last_updated",
];
function ensureCSV() {
    if (!fs_1.default.existsSync(CSV_PATH)) {
        fs_1.default.mkdirSync(path_1.default.dirname(CSV_PATH), { recursive: true });
        fs_1.default.writeFileSync(CSV_PATH, (0, sync_2.stringify)([], { header: true, columns: exports.HEADERS }));
    }
}
function readRows() {
    ensureCSV();
    const content = fs_1.default.readFileSync(CSV_PATH, "utf-8");
    return (0, sync_1.parse)(content, {
        columns: true,
        skip_empty_lines: true,
    });
}
function writeRows(rows) {
    // ✅ Ensure all headers exist in every row
    const normalizedRows = rows.map((row) => {
        const newRow = {};
        exports.HEADERS.forEach((h) => {
            newRow[h] = row[h] ?? ""; // fill missing fields
        });
        return newRow;
    });
    const output = (0, sync_2.stringify)(normalizedRows, {
        header: true,
        columns: exports.HEADERS,
    });
    fs_1.default.writeFileSync(CSV_PATH, output);
}
/* ================= QUESTIONNAIRE ================= */
function saveQuestionnaire(data) {
    const rows = readRows();
    const now = new Date().toISOString();
    let row = rows.find((r) => r.user_id === data.userId);
    if (!row) {
        row = {
            user_id: data.userId,
            email: data.email,
            name: data.name,
            questionnaire_response: JSON.stringify(data.questionnaireResponse),
            games_response: "",
            q_total_score: data.totalScore,
            target_risk_class: data.targetClass,
            q_completed_at: now,
            created_at: now,
            last_updated: now,
        };
        rows.push(row);
    }
    else {
        row.questionnaire_response = JSON.stringify(data.questionnaireResponse);
        row.q_total_score = data.totalScore;
        row.target_risk_class = data.targetClass;
        row.q_completed_at = now;
        row.last_updated = now;
    }
    writeRows(rows);
}
exports.saveQuestionnaire = saveQuestionnaire;
/* ================= GAMES ================= */
function saveGameResult(params) {
    const rows = readRows();
    const now = new Date().toISOString();
    const row = rows.find((r) => r.user_id === params.userId);
    if (!row)
        throw new Error("User not found");
    let games = {
        laundry_sorter: null,
        memory_dialer: null,
        money_manager: null,
        shopping_list_recall: null,
    };
    if (row.games_response) {
        games = JSON.parse(row.games_response);
    }
    games[params.gameKey] = params.gameResult;
    row.games_response = JSON.stringify(games);
    row.last_updated = now;
    writeRows(rows);
}
exports.saveGameResult = saveGameResult;
function updateEyeTrackingCSV(userId, eyeTrackingResult) {
    const rows = readRows();
    const now = new Date().toISOString();
    const row = rows.find((r) => String(r.user_id).trim() === String(userId).trim());
    if (!row) {
        console.log("❌ User not found in CSV:", userId);
        return;
    }
    const eyeData = {
        metrics: eyeTrackingResult.metrics,
        trials: eyeTrackingResult.trials,
        timestamp: now,
    };
    const jsonResponse = JSON.stringify(eyeData);
    // ✅ PRINT WHAT WILL BE SAVED IN CSV
    console.log("🧠 Eye Tracking Data to be saved:");
    console.log(jsonResponse); // full JSON
    console.log("📏 JSON length:", jsonResponse.length);
    row.eye_tracking_response = jsonResponse;
    row.last_updated = now;
    writeRows(rows);
    console.log("✅ Eye tracking data written to CSV");
}
exports.updateEyeTrackingCSV = updateEyeTrackingCSV;
