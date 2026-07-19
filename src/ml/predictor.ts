import * as ort from "onnxruntime-node";

import {
    AssessmentData,
    PredictionResult
} from "./types";

import {
    getAssets,
    getSession
} from "./modelLoader";

import { buildFeatureVector } from "./featureBuilder";
import { selectFeatures } from "./selector";
import { scaleFeatures } from "./scaler";

import {
    softmax,
    argMax,
    containsNaN
} from "./utils";

export async function predict(
    assessment: AssessmentData
): Promise<PredictionResult> {

    /*
    -----------------------------------------
    Build full feature vector
    -----------------------------------------
    */

    const fullVector = buildFeatureVector(assessment);

    const scaled = scaleFeatures(fullVector);

    const selected = selectFeatures(scaled);


    if (containsNaN(scaled)) {
        throw new Error("Feature vector contains NaN.");
    }

    /*
    -----------------------------------------
    Split modalities
    -----------------------------------------
    */

    const {
        modalityIndices
    } = getAssets();

    const questionnaire = modalityIndices.questionnaire.map(i => scaled[i]);

    const games = modalityIndices.games.map(i => scaled[i]);

    const eye = modalityIndices.eye_tracking.map(i => scaled[i]);

    /*
    -----------------------------------------
    ONNX Input
    -----------------------------------------
    */

    const feeds: Record<string, ort.Tensor> = {

        questionnaire: new ort.Tensor(
            "float32",
            Float32Array.from(questionnaire),
            [1, questionnaire.length]
        ),

        games: new ort.Tensor(
            "float32",
            Float32Array.from(games),
            [1, games.length]
        ),

        eye_tracking: new ort.Tensor(
            "float32",
            Float32Array.from(eye),
            [1, eye.length]
        )

    };

    /*
    -----------------------------------------
    Inference
    -----------------------------------------
    */

    const session = getSession();

    const output = await session.run(feeds);

    const logits = Array.from(
        output.prediction.data as Float32Array
    );

    /*
    -----------------------------------------
    Softmax
    -----------------------------------------
    */

    const probabilities = softmax(logits);

    const predictedClass = argMax(probabilities);

    const confidence = probabilities[predictedClass];

    return {

        predictedClass,

        confidence,

        probabilities

    };

}