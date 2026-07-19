import fs from "fs";
import path from "path";
import * as ort from "onnxruntime-node";

import {
  MetadataConfig,
  ModalityIndices,
  ModelAssets,
  ScalerConfig,
  SelectorConfig,
} from "./types";

let session: ort.InferenceSession | null = null;
let assets: ModelAssets | null = null;

/* ============================================================
 * Asset Paths
 * ============================================================ */

const ASSET_DIR = path.join(__dirname, "assets");

const MODEL_PATH = path.join(ASSET_DIR, "fusion_model.onnx");
const METADATA_PATH = path.join(ASSET_DIR, "metadata.json");
const SCALER_PATH = path.join(ASSET_DIR, "scaler.json");
const SELECTOR_PATH = path.join(ASSET_DIR, "selector.json");
const MODALITY_PATH = path.join(ASSET_DIR, "modality_indices.json");

/* ============================================================
 * Helpers
 * ============================================================ */

function readJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as T;
}

/* ============================================================
 * Initialization
 * ============================================================ */

export async function initializeModel(): Promise<void> {
  if (session && assets) {
    return;
  }

  console.log("======================================");
  console.log("Loading ML Assets...");
  console.log("======================================");

  assets = {
    metadata: readJson<MetadataConfig>(METADATA_PATH),
    scaler: readJson<ScalerConfig>(SCALER_PATH),
    selector: readJson<SelectorConfig>(SELECTOR_PATH),
    modalityIndices: readJson<ModalityIndices>(MODALITY_PATH),
  };

  session = await ort.InferenceSession.create(MODEL_PATH);

  console.log("✓ ONNX Model Loaded");

  console.log(
    "✓ Features:",
    assets.metadata.selected_features.length
  );

  console.log(
    "✓ Questionnaire:",
    assets.metadata.questionnaire_features
  );

  console.log(
    "✓ Games:",
    assets.metadata.game_features
  );

  console.log(
    "✓ Eye:",
    assets.metadata.eye_features
  );

  console.log("======================================");
}

/* ============================================================
 * Getters
 * ============================================================ */

export function getSession(): ort.InferenceSession {
  if (!session) {
    throw new Error("Model not initialized.");
  }

  return session;
}

export function getAssets(): ModelAssets {
  if (!assets) {
    throw new Error("Assets not initialized.");
  }

  return assets;
}