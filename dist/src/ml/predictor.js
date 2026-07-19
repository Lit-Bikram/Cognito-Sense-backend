"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.predict = void 0;
const ort = __importStar(require("onnxruntime-node"));
const modelLoader_1 = require("./modelLoader");
const featureBuilder_1 = require("./featureBuilder");
const selector_1 = require("./selector");
const scaler_1 = require("./scaler");
const utils_1 = require("./utils");
async function predict(assessment) {
    /*
    -----------------------------------------
    Build full feature vector
    -----------------------------------------
    */
    const fullVector = (0, featureBuilder_1.buildFeatureVector)(assessment);
    const scaled = (0, scaler_1.scaleFeatures)(fullVector);
    const selected = (0, selector_1.selectFeatures)(scaled);
    if ((0, utils_1.containsNaN)(scaled)) {
        throw new Error("Feature vector contains NaN.");
    }
    /*
    -----------------------------------------
    Split modalities
    -----------------------------------------
    */
    const { modalityIndices } = (0, modelLoader_1.getAssets)();
    const questionnaire = modalityIndices.questionnaire.map(i => scaled[i]);
    const games = modalityIndices.games.map(i => scaled[i]);
    const eye = modalityIndices.eye_tracking.map(i => scaled[i]);
    /*
    -----------------------------------------
    ONNX Input
    -----------------------------------------
    */
    const feeds = {
        questionnaire: new ort.Tensor("float32", Float32Array.from(questionnaire), [1, questionnaire.length]),
        games: new ort.Tensor("float32", Float32Array.from(games), [1, games.length]),
        eye_tracking: new ort.Tensor("float32", Float32Array.from(eye), [1, eye.length])
    };
    /*
    -----------------------------------------
    Inference
    -----------------------------------------
    */
    const session = (0, modelLoader_1.getSession)();
    const output = await session.run(feeds);
    const logits = Array.from(output.prediction.data);
    /*
    -----------------------------------------
    Softmax
    -----------------------------------------
    */
    const probabilities = (0, utils_1.softmax)(logits);
    const predictedClass = (0, utils_1.argMax)(probabilities);
    const confidence = probabilities[predictedClass];
    return {
        predictedClass,
        confidence,
        probabilities
    };
}
exports.predict = predict;
