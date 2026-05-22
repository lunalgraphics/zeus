/**
 * Mulberry32 seeded PRNG.
 * Fast, deterministic, good distribution for visual randomness.
 */
export class SeededRandom {
    constructor(seed) {
        this._state = seed | 0;
    }

    /** Returns a float in [0, 1) */
    next() {
        let t = (this._state += 0x6D2B79F5);
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }

    /** Returns a float in [-1, 1) */
    nextSigned() {
        return this.next() * 2 - 1;
    }

    /** Returns a float in [min, max) */
    range(min, max) {
        return min + this.next() * (max - min);
    }
}
