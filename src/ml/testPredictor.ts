import dotenv from "dotenv";
dotenv.config();

import { query } from "../db/pool";

import { initializeModel } from "./modelLoader";
import { predict } from "./predictor";

async function main() {

    await initializeModel();
    console.log("USER =", process.env.POSTGRES_USER);
    console.log("PASSWORD =", process.env.POSTGRES_PASSWORD);
    console.log("HOST =", process.env.POSTGRES_HOST);
    const result = await query(
        `
        SELECT *
        FROM assessments
        WHERE questionnaire_response IS NOT NULL
          AND games_response IS NOT NULL
          AND eye_tracking_response IS NOT NULL
        LIMIT 1
        `
    );

    if (result.rows.length === 0) {
        throw new Error("No completed assessment found.");
    }

    const assessment = result.rows[0];

    console.log("================================");
    console.log("Assessment Loaded");
    console.log("================================");

    console.log({
        user: assessment.user_id,
        score: assessment.q_total_score
    });

    const prediction = await predict(assessment);

    console.log("================================");
    console.log("Prediction");
    console.log("================================");

    console.log(prediction);
}

main().catch(err => {

    console.error(err);

    process.exit(1);

});