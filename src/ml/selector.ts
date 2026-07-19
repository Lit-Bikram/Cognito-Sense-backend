import { FeatureVector, SelectedFeatureVector } from "./types";
import { getAssets } from "./modelLoader";

/**
 * Applies the RFECV feature-selection mask.
 *
 * Input:
 *   Full feature vector (63 features)
 *
 * Output:
 *   Selected feature vector (11 features)
 */
export function selectFeatures(features: FeatureVector): SelectedFeatureVector {
  const { selector } = getAssets();

  if (features.length !== selector.support.length) {
    throw new Error(
      `Feature vector length mismatch.
Expected ${selector.support.length},
Received ${features.length}`,
    );
  }

  const selected: number[] = [];

  for (let i = 0; i < selector.support.length; i++) {
    if (selector.support[i]) {
      selected.push(features[i]);
    }
  }

  return selected;
}
