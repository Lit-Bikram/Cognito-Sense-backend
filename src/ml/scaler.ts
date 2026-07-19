import { SelectedFeatureVector } from "./types";
import { getAssets } from "./modelLoader";

/**
 * Reproduces sklearn StandardScaler.transform()
 */
export function scaleFeatures(
    features: SelectedFeatureVector
): SelectedFeatureVector {

    const { scaler } = getAssets();

    if (features.length !== scaler.mean.length) {
        throw new Error(
            `Scaler input length mismatch.
Expected ${scaler.mean.length}
Received ${features.length}`
        );
    }

    return features.map((value, index) => {

        const mean = scaler.mean[index];
        const scale = scaler.scale[index];

        if (scale === 0) {
            return 0;
        }

        return (value - mean) / scale;
    });
}