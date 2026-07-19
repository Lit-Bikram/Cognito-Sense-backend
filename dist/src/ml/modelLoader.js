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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAssets = exports.getSession = exports.initializeModel = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const ort = __importStar(require("onnxruntime-node"));
let session = null;
let assets = null;
/* ============================================================
 * Asset Paths
 * ============================================================ */
const ASSET_DIR = path_1.default.join(__dirname, "assets");
const MODEL_PATH = path_1.default.join(ASSET_DIR, "fusion_model.onnx");
const METADATA_PATH = path_1.default.join(ASSET_DIR, "metadata.json");
const SCALER_PATH = path_1.default.join(ASSET_DIR, "scaler.json");
const SELECTOR_PATH = path_1.default.join(ASSET_DIR, "selector.json");
const MODALITY_PATH = path_1.default.join(ASSET_DIR, "modality_indices.json");
/* ============================================================
 * Helpers
 * ============================================================ */
function readJson(filePath) {
    return JSON.parse(fs_1.default.readFileSync(filePath, "utf8"));
}
/* ============================================================
 * Initialization
 * ============================================================ */
async function initializeModel() {
    if (session && assets) {
        return;
    }
    console.log("======================================");
    console.log("Loading ML Assets...");
    console.log("======================================");
    assets = {
        metadata: readJson(METADATA_PATH),
        scaler: readJson(SCALER_PATH),
        selector: readJson(SELECTOR_PATH),
        modalityIndices: readJson(MODALITY_PATH),
    };
    session = await ort.InferenceSession.create(MODEL_PATH);
    console.log("✓ ONNX Model Loaded");
    console.log("✓ Features:", assets.metadata.selected_features.length);
    console.log("✓ Questionnaire:", assets.metadata.questionnaire_features);
    console.log("✓ Games:", assets.metadata.game_features);
    console.log("✓ Eye:", assets.metadata.eye_features);
    console.log("======================================");
}
exports.initializeModel = initializeModel;
/* ============================================================
 * Getters
 * ============================================================ */
function getSession() {
    if (!session) {
        throw new Error("Model not initialized.");
    }
    return session;
}
exports.getSession = getSession;
function getAssets() {
    if (!assets) {
        throw new Error("Assets not initialized.");
    }
    return assets;
}
exports.getAssets = getAssets;
