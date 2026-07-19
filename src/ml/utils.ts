/**
 * Numerically stable softmax
 */
export function softmax(values: number[]): number[] {

    const max = Math.max(...values);

    const exps = values.map(v => Math.exp(v - max));

    const sum = exps.reduce((a, b) => a + b, 0);

    return exps.map(v => v / sum);
}

export function argMax(values: number[]): number {

    let index = 0;

    for (let i = 1; i < values.length; i++) {

        if (values[i] > values[index]) {
            index = i;
        }

    }

    return index;
}

export function containsNaN(values: number[]): boolean {

    return values.some(v => !Number.isFinite(v));
}

export function validateLength(
    vector: number[],
    expected: number,
    name: string
): void {

    if (vector.length !== expected) {

        throw new Error(
            `${name} length mismatch.
Expected ${expected}
Received ${vector.length}`
        );

    }

}