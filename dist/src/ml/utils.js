"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateLength = exports.containsNaN = exports.argMax = exports.softmax = void 0;
/**
 * Numerically stable softmax
 */
function softmax(values) {
    const max = Math.max(...values);
    const exps = values.map(v => Math.exp(v - max));
    const sum = exps.reduce((a, b) => a + b, 0);
    return exps.map(v => v / sum);
}
exports.softmax = softmax;
function argMax(values) {
    let index = 0;
    for (let i = 1; i < values.length; i++) {
        if (values[i] > values[index]) {
            index = i;
        }
    }
    return index;
}
exports.argMax = argMax;
function containsNaN(values) {
    return values.some(v => !Number.isFinite(v));
}
exports.containsNaN = containsNaN;
function validateLength(vector, expected, name) {
    if (vector.length !== expected) {
        throw new Error(`${name} length mismatch.
Expected ${expected}
Received ${vector.length}`);
    }
}
exports.validateLength = validateLength;
