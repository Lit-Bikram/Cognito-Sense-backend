import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";
import { stringify } from "csv-stringify/sync";

const CSV_PATH = path.join(process.cwd(), "data", "cognito_sense_master.csv");
console.log("🔥 csvStore.ts loaded");
console.log("📁 CSV PATH =", path.join(process.cwd(), "data", "cognito_sense_master.csv"));

export const HEADERS = [
  "user_id",
  "email",
  "name",
  "questionnaire_response",
  "games_response",
  "eye_tracking_response", // ✅ NEW
  "q_total_score",
  "target_risk_class",
  "q_completed_at",
  "created_at",
  "last_updated",
];


function ensureCSV() {
  if (!fs.existsSync(CSV_PATH)) {
    fs.mkdirSync(path.dirname(CSV_PATH), { recursive: true });
    fs.writeFileSync(CSV_PATH, stringify([], { header: true, columns: HEADERS }));
  }
}

export function readRows(): any[] {
  ensureCSV();
  const content = fs.readFileSync(CSV_PATH, "utf-8");
  return parse(content, {
    columns: true,
    skip_empty_lines: true,
  });
}

function writeRows(rows: any[]) {
  // ✅ Ensure all headers exist in every row
  const normalizedRows = rows.map((row) => {
    const newRow: any = {};
    HEADERS.forEach((h) => {
      newRow[h] = row[h] ?? ""; // fill missing fields
    });
    return newRow;
  });

  const output = stringify(normalizedRows, {
    header: true,
    columns: HEADERS,
  });

  fs.writeFileSync(CSV_PATH, output);
}


/* ================= QUESTIONNAIRE ================= */

export function saveQuestionnaire(data: {
  userId: string;
  email: string;
  name: string;
  questionnaireResponse: any;
  totalScore: number;
  targetClass: number;
}) {
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
  } else {
    row.questionnaire_response = JSON.stringify(data.questionnaireResponse);
    row.q_total_score = data.totalScore;
    row.target_risk_class = data.targetClass;
    row.q_completed_at = now;
    row.last_updated = now;
  }

  writeRows(rows);
}

/* ================= GAMES ================= */

export function saveGameResult(params: {
  userId: string;
  gameKey: string;
  gameResult: any;
}) {
  const rows = readRows();
  const now = new Date().toISOString();

  const row = rows.find((r) => r.user_id === params.userId);
  if (!row) throw new Error("User not found");

  // ✅ STEP 1 — DEFAULT STRUCTURE (only used if no data exists yet)
  const defaultGames: Record<string, any> = {
    laundry_sorter: null,
    memory_dialer: null,
    money_manager: null,
    shopping_list_recall: null,
  };

  // ✅ STEP 2 — LOAD EXISTING DATA IF PRESENT
  let games: Record<string, any> =
    row.games_response && row.games_response.trim() !== ""
      ? JSON.parse(row.games_response)
      : { ...defaultGames };

  // ✅ STEP 3 — NORMALIZE KEYS FROM FRONTEND
  const normalizedKey =
    params.gameKey === "shopping_list"
      ? "shopping_list_recall"
      : params.gameKey === "memory_dialer_game"
      ? "memory_dialer"
      : params.gameKey;

  // ✅ STEP 4 — UPDATE ONLY THIS GAME (preserve others)
  games[normalizedKey] = params.gameResult;

  // ✅ STEP 5 — SAVE BACK TO CSV
  row.games_response = JSON.stringify(games);
  row.last_updated = now;

  writeRows(rows);

  console.log("🎮 Games after update:", games);
}



export function updateEyeTrackingCSV(userId: string, eyeTrackingResult: any) {
  const rows = readRows();
  const now = new Date().toISOString();

  // 🔥 VERY IMPORTANT: FIND EXISTING ROW ONLY
  const row = rows.find(
    (r) => String(r.user_id).trim() === String(userId).trim()
  );

  if (!row) {
    console.log("❌ User not found in CSV:", userId);
    return;
  }

  // ✅ BUILD EYE DATA
  const eyeData = {
    metrics: eyeTrackingResult.metrics,
    trials: eyeTrackingResult.trials,
    timestamp: now,
  };

  row.eye_tracking_response = JSON.stringify(eyeData);
  row.last_updated = now;

  writeRows(rows);

  console.log("✅ Eye tracking UPDATED EXISTING ROW for user:", userId);
}

export function isRowComplete(userId: string) {
  const rows = readRows();
  const row = rows.find((r) => r.user_id === userId);
  if (!row) return false;

  const games = row.games_response ? JSON.parse(row.games_response) : {};

  return (
    !!row.questionnaire_response &&
    !!row.eye_tracking_response &&
    !!games.laundry_sorter &&
    !!games.memory_dialer &&
    !!games.money_manager &&
    !!games.shopping_list_recall
  );
}
