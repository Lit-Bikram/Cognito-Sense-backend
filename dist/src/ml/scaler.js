"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scaleFeatures = void 0;
const modelLoader_1 = require("./modelLoader");
/**
 * Reproduces sklearn StandardScaler.transform()
 */
function scaleFeatures(features) {
    const { scaler } = (0, modelLoader_1.getAssets)();
    if (features.length !== scaler.mean.length) {
        throw new Error(`Scaler input length mismatch.
Expected ${scaler.mean.length}
Received ${features.length}`);
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
exports.scaleFeatures = scaleFeatures;
