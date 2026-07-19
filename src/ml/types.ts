// src/ml/types.ts

/* ============================================================
 * Generic Numeric Types
 * ============================================================ */

export type FeatureVector = number[];
export type SelectedFeatureVector = number[];

/* ============================================================
 * Model Input
 * ============================================================ */

export interface ModelInput {
  questionnaire: Float32Array;
  games: Float32Array;
  eyeTracking: Float32Array;
}

/* ============================================================
 * Prediction
 * ============================================================ */

export interface PredictionResult {
  predictedClass: number;
  confidence: number;
  probabilities: number[];
}

/* ============================================================
 * Standard Scaler
 * ============================================================ */

export interface ScalerConfig {
  mean: number[];
  scale: number[];
}

/* ============================================================
 * RFECV Selector
 * ============================================================ */

export interface SelectorConfig {
  support: boolean[];
  ranking: number[];
}

/* ============================================================
 * Metadata
 * ============================================================ */

export interface MetadataConfig {
  all_features: string[];
  selected_features: string[];

  questionnaire_features: number;
  game_features: number;
  eye_features: number;

  num_classes: number;
}

/* ============================================================
 * Modality Indices
 * ============================================================ */

export interface ModalityIndices {
  questionnaire: number[];
  games: number[];
  eye_tracking: number[];
}

/* ============================================================
 * Cached Assets
 * ============================================================ */

export interface ModelAssets {
  metadata: MetadataConfig;
  scaler: ScalerConfig;
  selector: SelectorConfig;
  modalityIndices: ModalityIndices;
}

/* ============================================================
 * Assessment Data
 * ============================================================ */

export interface AssessmentData {
  questionnaire_response: any;
  games_response: any;
  eye_tracking_response: any;

  q_total_score: number;
}

/* ============================================================
 * ONNX Prediction Output
 * ============================================================ */

export interface ModelOutput {
  logits: number[];
}

/* ============================================================
 * Generic JSON
 * ============================================================ */

export type JsonObject = Record<string, any>;