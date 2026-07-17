"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.missingTasks = exports.getStatus = exports.isRowComplete = exports.getAssessment = exports.updateEyeTracking = exports.saveGameResult = exports.saveQuestionnaire = void 0;
const pool_1 = require("../db/pool");
// Latest-only store: exactly one `assessments` row per user, overwritten in
// place on each submission (mirrors the old CSV behaviour, now in Postgres).
const GAME_KEYS = [
    "laundry_sorter",
    "memory_dialer",
    "money_manager",
    "shopping_list_recall",
];
// Make sure an assessments row exists for this user before we update part of it.
async function ensureRow(userId) {
    await (0, pool_1.query)(`INSERT INTO assessments (user_id)
     VALUES ($1)
     ON CONFLICT (user_id) DO NOTHING`, [userId]);
}
// Normalize game keys coming from the frontend.
function normalizeGameKey(gameKey) {
    if (gameKey === "shopping_list")
        return "shopping_list_recall";
    if (gameKey === "memory_dialer_game")
        return "memory_dialer";
    return gameKey;
}
/* ================= QUESTIONNAIRE ================= */
async function saveQuestionnaire(data) {
    await (0, pool_1.query)(`INSERT INTO assessments
        (user_id, questionnaire_response, q_total_score, target_risk_class, q_completed_at, last_updated)
     VALUES ($1, $2::jsonb, $3, $4, now(), now())
     ON CONFLICT (user_id) DO UPDATE SET
        questionnaire_response = EXCLUDED.questionnaire_response,
        q_total_score          = EXCLUDED.q_total_score,
        target_risk_class      = EXCLUDED.target_risk_class,
        q_completed_at         = now(),
        last_updated           = now()`, [
        data.userId,
        JSON.stringify(data.questionnaireResponse ?? {}),
        data.totalScore,
        data.targetClass,
    ]);
}
exports.saveQuestionnaire = saveQuestionnaire;
/* ================= GAMES ================= */
async function saveGameResult(params) {
    await ensureRow(params.userId);
    const key = normalizeGameKey(params.gameKey);
    const patch = JSON.stringify({ [key]: params.gameResult });
    // Merge the single game into the existing games_response object.
    await (0, pool_1.query)(`UPDATE assessments
        SET games_response = COALESCE(games_response, '{}'::jsonb) || $2::jsonb,
            last_updated   = now()
      WHERE user_id = $1`, [params.userId, patch]);
}
exports.saveGameResult = saveGameResult;
/* ================= EYE TRACKING ================= */
async function updateEyeTracking(userId, eyeTrackingResult) {
    await ensureRow(userId);
    const eyeData = {
        metrics: eyeTrackingResult?.metrics,
        trials: eyeTrackingResult?.trials,
        timestamp: new Date().toISOString(),
    };
    await (0, pool_1.query)(`UPDATE assessments
        SET eye_tracking_response = $2::jsonb,
            last_updated          = now()
      WHERE user_id = $1`, [userId, JSON.stringify(eyeData)]);
}
exports.updateEyeTracking = updateEyeTracking;
/* ================= READ / COMPLETION ================= */
async function getAssessment(userId) {
    const result = await (0, pool_1.query)(`SELECT a.*, u.email, u.name
       FROM assessments a
       JOIN users u ON u.id = a.user_id
      WHERE a.user_id = $1`, [userId]);
    return result.rows[0] || null;
}
exports.getAssessment = getAssessment;
async function isRowComplete(userId) {
    const row = await getAssessment(userId);
    if (!row)
        return false;
    const games = row.games_response || {};
    return (!!row.questionnaire_response &&
        !!row.eye_tracking_response &&
        GAME_KEYS.every((k) => games[k] !== null && games[k] !== undefined));
}
exports.isRowComplete = isRowComplete;
// Detailed completion status for the main-menu screen.
async function getStatus(userId) {
    const row = await getAssessment(userId);
    const games = row?.games_response || {};
    const gameStatus = {};
    GAME_KEYS.forEach((k) => {
        gameStatus[k] = games[k] !== null && games[k] !== undefined;
    });
    const questionnaire = !!row?.questionnaire_response;
    const eyeTracking = !!row?.eye_tracking_response;
    const gamesComplete = GAME_KEYS.every((k) => gameStatus[k]);
    return {
        questionnaire,
        games: gameStatus,
        gamesComplete,
        eyeTracking,
        complete: questionnaire && gamesComplete && eyeTracking,
        missingTasks: missingTasks(row),
    };
}
exports.getStatus = getStatus;
function missingTasks(row) {
    const missing = [];
    if (!row?.questionnaire_response)
        missing.push("Questionnaire");
    if (!row?.eye_tracking_response)
        missing.push("Eye Tracking");
    const games = row?.games_response || {};
    const unfinished = GAME_KEYS.filter((k) => games[k] === null || games[k] === undefined);
    if (unfinished.length > 0) {
        missing.push("Games (" + unfinished.join(", ") + ")");
    }
    return missing;
}
exports.missingTasks = missingTasks;
