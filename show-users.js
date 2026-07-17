require("dotenv").config();
const { pool } = require("./dist/src/db/pool");
(async () => {
  const users = await pool.query(
    "SELECT id, name, email, LEFT(password_hash, 20) AS password_hash_preview, created_at FROM users ORDER BY id"
  );
  console.log("\n=== USER ACCOUNTS ===");
  console.table(users.rows);

  const data = await pool.query(`
    SELECT u.email,
           (a.questionnaire_response IS NOT NULL) AS has_questionnaire,
           COALESCE(jsonb_object_keys_count(a.games_response), 0) AS games_done,
           (a.eye_tracking_response IS NOT NULL) AS has_eye_test,
           a.q_total_score, a.target_risk_class, a.last_updated
      FROM users u LEFT JOIN assessments a ON a.user_id = u.id
     ORDER BY u.id`).catch(async () => {
       // fallback without the helper function
       return pool.query(`
         SELECT u.email,
                (a.questionnaire_response IS NOT NULL) AS has_questionnaire,
                (a.eye_tracking_response IS NOT NULL) AS has_eye_test,
                a.q_total_score, a.target_risk_class, a.last_updated
           FROM users u LEFT JOIN assessments a ON a.user_id = u.id
          ORDER BY u.id`);
     });
  console.log("\n=== ASSESSMENTS ===");
  console.table(data.rows);
  await pool.end();
})().catch(e => { console.error(e); process.exit(1); });
