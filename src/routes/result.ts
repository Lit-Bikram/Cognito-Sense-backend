import { Router } from "express";
import {
    getAssessment,
    isRowComplete,
    savePrediction
} from "../datastore/assessmentStore";
import {
    requireAuth,
    AuthedRequest
} from "../auth/authMiddleware";
import { predict } from "../ml/predictor";

const router = Router();

router.get("/", requireAuth, async (req: AuthedRequest, res) => {
    try {

        const userId = req.user!.userId;

        console.log("=================================");
        console.log("Prediction request");
        console.log("User:", userId);
        console.log("=================================");

        const complete = await isRowComplete(userId);

        if (!complete) {

            const assessment = await getAssessment(userId);

            return res.status(400).json({
                error: "Assessment is incomplete.",
                assessment
            });

        }

        const assessment = await getAssessment(userId);

        if (!assessment) {
            return res.status(404).json({
                error: "Assessment not found."
            });
        }

        console.log("Assessment loaded.");

        const prediction = await predict(assessment);

        const riskScore =
            (
                (0 * prediction.probabilities[0]) +
                (1 * prediction.probabilities[1]) +
                (2 * prediction.probabilities[2])
            ) / 2 * 100;

        await savePrediction({

            userId,

            predictedClass: prediction.predictedClass,

            confidence: prediction.confidence,

            probabilities: prediction.probabilities,

            riskScore

        });

        console.log("Prediction saved.");

        res.json({

            success: true,

            predictedClass: prediction.predictedClass,

            confidence: prediction.confidence,

            probabilities: prediction.probabilities,

            riskScore

        });

    }
    catch (err) {

        console.error("Prediction failed:", err);

        res.status(500).json({
            error: "Prediction failed."
        });

    }
});

export default router;