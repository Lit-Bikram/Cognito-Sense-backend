import { query } from "../db/pool";

// Latest-only store: exactly one `assessments` row per user, overwritten in
// place on each submission (mirrors the old CSV behaviour, now in Postgres).

const GAME_KEYS = [
  "laundry_sorter",
  "memory_dialer",
  "money_manager",
  "shopping_list_recall",
];

// Make sure an assessments row exists for this user before we update part of it.
async function ensureRow(userId: number) {
  await query(
    `INSERT INTO assessments (user_id)
     VALUES ($1)
     ON CONFLICT (user_id) DO NOTHING`,
    [userId],
  );
}

// Normalize game keys coming from the frontend.
function normalizeGameKey(gameKey: string) {
  if (gameKey === "shopping_list") return "shopping_list_recall";
  if (gameKey === "memory_dialer_game") return "memory_dialer";
  return gameKey;
}

/* ================= QUESTIONNAIRE ================= */
export async function saveQuestionnaire(data: {
  userId: number;
  questionnaireResponse: any;
  totalScore: number;
  targetClass: number;
}) {
  await query(
    `INSERT INTO assessments
        (user_id, questionnaire_response, q_total_score, target_risk_class, q_completed_at, last_updated)
     VALUES ($1, $2::jsonb, $3, $4, now(), now())
     ON CONFLICT (user_id) DO UPDATE SET
        questionnaire_response = EXCLUDED.questionnaire_response,
        q_total_score          = EXCLUDED.q_total_score,
        target_risk_class      = EXCLUDED.target_risk_class,
        q_completed_at         = now(),
        last_updated           = now()`,
    [
      data.userId,
      JSON.stringify(data.questionnaireResponse ?? {}),
      data.totalScore,
      data.targetClass,
    ],
  );
}

/* ================= GAMES ================= */
export async function saveGameResult(params: {
  userId: number;
  gameKey: string;
  gameResult: any;
}) {
  await ensureRow(params.userId);

  const key = normalizeGameKey(params.gameKey);
  const patch = JSON.stringify({ [key]: params.gameResult });

  // Merge the single game into the existing games_response object.
  await query(
    `UPDATE assessments
        SET games_response = COALESCE(games_response, '{}'::jsonb) || $2::jsonb,
            last_updated   = now()
      WHERE user_id = $1`,
    [params.userId, patch],
  );
}

/* ================= EYE TRACKING ================= */
export async function updateEyeTracking(userId: number, eyeTrackingResult: any) {
  await ensureRow(userId);

  const eyeData = {
    metrics: eyeTrackingResult?.metrics,
    trials: eyeTrackingResult?.trials,
    timestamp: new Date().toISOString(),
  };

  await query(
    `UPDATE assessments
        SET eye_tracking_response = $2::jsonb,
            last_updated          = now()
      WHERE user_id = $1`,
    [userId, JSON.stringify(eyeData)],
  );
}

/* ================= READ / COMPLETION ================= */
export async function getAssessment(userId: number) {
  const result = await query(
    `SELECT a.*, u.email, u.name
       FROM assessments a
       JOIN users u ON u.id = a.user_id
      WHERE a.user_id = $1`,
    [userId],
  );
  return result.rows[0] || null;
}

export async function isRowComplete(userId: number): Promise<boolean> {
  const row = await getAssessment(userId);
  if (!row) return false;

  const games = row.games_response || {};

  return (
    !!row.questionnaire_response &&
    !!row.eye_tracking_response &&
    GAME_KEYS.every((k) => games[k] !== null && games[k] !== undefined)
  );
}

// Detailed completion status for the main-menu screen.
export async function getStatus(userId: number) {
  const row = await getAssessment(userId);
  const games = row?.games_response || {};

  const gameStatus: Record<string, boolean> = {};
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

export function missingTasks(row: any): string[] {
  const missing: string[] = [];
  if (!row?.questionnaire_response) missing.push("Questionnaire");
  if (!row?.eye_tracking_response) missing.push("Eye Tracking");

  const games = row?.games_response || {};
  const unfinished = GAME_KEYS.filter(
    (k) => games[k] === null || games[k] === undefined,
  );
  if (unfinished.length > 0) {
    missing.push("Games (" + unfinished.join(", ") + ")");
  }
  return missing;
}



/* ================= MODEL PREDICTION ================= */

export async function savePrediction(params: {
    userId: number;
    predictedClass: number;
    confidence: number;
    probabilities: number[];
    riskScore: number;
}) {
    const test = await query(
      `SELECT predicted_class FROM assessments LIMIT 1`
    );

    console.log(test.rows);

    await query(
        `
        UPDATE assessments
        SET
            predicted_class = $2,
            prediction_confidence = $3,
            prediction_probabilities = $4::jsonb,
            risk_score = $5,
            predicted_at = NOW(),
            last_updated = NOW()
        WHERE user_id = $1
        `,
        [
            params.userId,
            params.predictedClass,
            params.confidence,
            JSON.stringify(params.probabilities),
            params.riskScore
        ]
    );

}