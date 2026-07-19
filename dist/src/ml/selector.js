"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectFeatures = void 0;
const modelLoader_1 = require("./modelLoader");
/**
 * Applies the RFECV feature-selection mask.
 *
 * Input:
 *   Full feature vector (63 features)
 *
 * Output:
 *   Selected feature vector (11 features)
 */
function selectFeatures(features) {
    const { selector } = (0, modelLoader_1.getAssets)();
    if (features.length !== selector.support.length) {
        throw new Error(`Feature vector length mismatch.
Expected ${selector.support.length},
Received ${features.length}`);
    }
    const selected = [];
    for (let i = 0; i < selector.support.length; i++) {
        if (selector.support[i]) {
            selected.push(features[i]);
        }
    }
    return selected;
}
exports.selectFeatures = selectFeatures;
