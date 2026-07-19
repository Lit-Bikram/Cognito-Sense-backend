"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const pool_1 = require("../db/pool");
const modelLoader_1 = require("./modelLoader");
const predictor_1 = require("./predictor");
async function main() {
    await (0, modelLoader_1.initializeModel)();
    console.log("USER =", process.env.POSTGRES_USER);
    console.log("PASSWORD =", process.env.POSTGRES_PASSWORD);
    console.log("HOST =", process.env.POSTGRES_HOST);
    const result = await (0, pool_1.query)(`
        SELECT *
        FROM assessments
        WHERE questionnaire_response IS NOT NULL
          AND games_response IS NOT NULL
          AND eye_tracking_response IS NOT NULL
        LIMIT 1
        `);
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
    const prediction = await (0, predictor_1.predict)(assessment);
    console.log("================================");
    console.log("Prediction");
    console.log("================================");
    console.log(prediction);
}
main().catch(err => {
    console.error(err);
    process.exit(1);
});
