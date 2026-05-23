import { SeededRandom } from './SeededRandom.js';

/**
 * @typedef {Object} PathPoint
 * @property {number} x
 * @property {number} y
 * @property {number} thickness - radius at this point
 */

/**
 * @typedef {Object} LightningPath
 * @property {PathPoint[]} points - ordered points along this segment
 * @property {LightningPath[]} children - branches spawning from this path
 */

// ============================================================
// REALISTIC MODE (recursive midpoint displacement)
// ============================================================

/**
 * Generate a lightning path using recursive midpoint displacement.
 *
 * Key design: branch slots are pre-allocated at normalized positions (0–1)
 * BEFORE subdivision happens. This means changing the detail level only
 * refines the geometry — it cannot change which branches exist or where
 * they attach, because those decisions were already made.
 *
 * Each branch (and sub-branch) gets its own isolated shape RNG seeded
 * deterministically from its slot data, so branches don't interfere with
 * each other's geometry.
 *
 * @param {object} options - Render options including realistic-mode params
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 * @returns {LightningPath}
 */
export function generateRealisticPath(options, width, height) {
    const seed = options.realisticSeed ?? 42;

    const centerY = height / 2;
    const startX = width / 2 - options.baseLength / 2;
    const endX = startX + options.baseLength;

    const start = { x: startX, y: centerY };
    const end = { x: endX, y: centerY };

    const maxDepth = options.realisticDetail ?? 7;
    const displacement = options.realisticDisplacement ?? 150;
    const branchChance = options.realisticBranchChance ?? 0.04;
    const branchLenFactor = options.realisticBranchLength ?? 0.5;
    const branchAngleRange = options.realisticBranchAngle ?? 35;
    const maxBranchDepth = options.realisticMaxBranchDepth ?? 4;
    const baseThickness = options.coreSize;
    const taper = options.taper;

    // Fixed spacing (in normalized 0–1 units) between branch evaluation slots.
    // For a 1000px bolt this means one evaluation every ~12px.
    const EVAL_SPACING_NORMALIZED = 0.012;

    /**
     * Pre-allocate branch slots for a segment.
     * Decides WHERE branches go and their parameters using a dedicated RNG,
     * completely independent of subdivision.
     *
     * Returns an array of branch slot descriptors sorted by normalized position.
     * Each slot has: { t, angleDelta, lengthFactor, childSeed }
     *   - t: normalized position along parent (0–1), excluding endpoints
     *   - angleDelta: angle offset from tangent (radians)
     *   - lengthFactor: fraction of remaining length for this branch
     *   - childSeed: seed for this child's own shape + sub-branch RNG
     */
    function allocateBranchSlots(branchDepth, slotSeed) {
        if (branchDepth >= maxBranchDepth || branchChance <= 0) return [];

        const slotRng = new SeededRandom(slotSeed);
        const slots = [];

        // Walk from just past the start to just before the end
        for (let t = EVAL_SPACING_NORMALIZED; t < 0.95; t += EVAL_SPACING_NORMALIZED) {
            if (slotRng.next() < branchChance) {
                slots.push({
                    t,
                    angleDelta: slotRng.range(-branchAngleRange, branchAngleRange) * Math.PI / 180,
                    lengthFactor: branchLenFactor * slotRng.range(0.4, 1.0),
                    childSeed: Math.floor(slotRng.next() * 2147483647),
                });
            }
        }

        return slots;
    }

    /**
     * Recursively subdivide a line segment with random midpoint displacement.
     * Uses its own RNG instance so it's fully isolated.
     */
    function subdivide(rng, p1, p2, depth, scale) {
        if (depth === 0) {
            return [p1, p2];
        }

        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const len = Math.sqrt(dx * dx + dy * dy);

        if (len === 0) return [p1, p2];

        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2;

        // Perpendicular unit vector
        const perpX = -dy / len;
        const perpY = dx / len;

        const offset = rng.nextSigned() * scale;
        const mid = {
            x: midX + perpX * offset,
            y: midY + perpY * offset,
        };

        const left = subdivide(rng, p1, mid, depth - 1, scale * 0.55);
        const right = subdivide(rng, mid, p2, depth - 1, scale * 0.55);

        // Merge (avoid duplicating the midpoint)
        return [...left.slice(0, -1), ...right];
    }

    /**
     * Given a subdivided path and a normalized position t (0–1),
     * find the interpolated point and tangent at that position.
     */
    function samplePathAt(points, totalLen, t) {
        const targetDist = t * totalLen;
        let accDist = 0;

        for (let i = 1; i < points.length; i++) {
            const dx = points[i].x - points[i - 1].x;
            const dy = points[i].y - points[i - 1].y;
            const segLen = Math.sqrt(dx * dx + dy * dy);

            if (accDist + segLen >= targetDist) {
                // Interpolate within this segment
                const remainder = targetDist - accDist;
                const frac = segLen > 0 ? remainder / segLen : 0;
                const x = points[i - 1].x + dx * frac;
                const y = points[i - 1].y + dy * frac;
                const thickness = points[i - 1].thickness + (points[i].thickness - points[i - 1].thickness) * frac;
                const tangentAngle = Math.atan2(dy, dx);
                return { x, y, thickness, tangentAngle };
            }
            accDist += segLen;
        }

        // Fallback: return last point
        const last = points[points.length - 1];
        const prev = points[points.length - 2] || last;
        const tangentAngle = Math.atan2(last.y - prev.y, last.x - prev.x);
        return { x: last.x, y: last.y, thickness: last.thickness, tangentAngle };
    }

    /**
     * Generate a full branch (trunk or sub-branch).
     *
     * Steps:
     * 1. Pre-allocate branch slots (positions + params) using slotSeed
     * 2. Subdivide the geometry using shapeSeed
     * 3. Map branch slots onto the subdivided path
     * 4. Recursively generate child branches
     */
    function generateBranch(p1, p2, depth, branchDepth, thickness, shapeSeed, slotSeed) {
        // Step 1: Pre-allocate branch slots (independent of subdivision)
        const branchSlots = allocateBranchSlots(branchDepth, slotSeed);

        // Step 2: Subdivide geometry with isolated RNG
        // Scale displacement relative to segment length to prevent short branches
        // from curling back on themselves. Use the lesser of the global displacement
        // and a fraction of the segment's straight-line length.
        const shapeRng = new SeededRandom(shapeSeed);
        const straightLen = Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
        const depthScale = 0.5 ** (branchDepth * 0.3);
        const maxDisplacement = Math.min(displacement * depthScale, straightLen * 0.4);
        const rawPoints = subdivide(shapeRng, p1, p2, depth, maxDisplacement);
        const totalLen = computePathLength(rawPoints);

        // Step 3: Assign thickness with taper
        const points = [];
        let accLen = 0;
        for (let i = 0; i < rawPoints.length; i++) {
            if (i > 0) {
                const dx = rawPoints[i].x - rawPoints[i - 1].x;
                const dy = rawPoints[i].y - rawPoints[i - 1].y;
                accLen += Math.sqrt(dx * dx + dy * dy);
            }
            const progress = accLen / totalLen;
            const t = thickness * (1 - progress * taper / 100);
            points.push({ x: rawPoints[i].x, y: rawPoints[i].y, thickness: Math.max(t, 0.5) });
        }

        // Step 4: Map pre-allocated slots onto the subdivided path and recurse
        const children = [];
        for (const slot of branchSlots) {
            const sample = samplePathAt(points, totalLen, slot.t);

            const branchAngle = sample.tangentAngle + slot.angleDelta;
            const remainingLen = totalLen * (1 - slot.t);
            const branchLen = remainingLen * slot.lengthFactor;

            const branchEnd = {
                x: sample.x + Math.cos(branchAngle) * branchLen,
                y: sample.y + Math.sin(branchAngle) * branchLen,
            };

            const childThickness = sample.thickness * 0.6;
            const childDepth = Math.max(depth - 2, 3);

            // Each child gets deterministic seeds derived from its slot
            const childShapeSeed = slot.childSeed;
            const childSlotSeed = slot.childSeed + 4919;

            const child = generateBranch(
                { x: sample.x, y: sample.y },
                branchEnd,
                childDepth,
                branchDepth + 1,
                childThickness,
                childShapeSeed,
                childSlotSeed
            );
            children.push(child);
        }

        return { points, children };
    }

    function computePathLength(pts) {
        let len = 0;
        for (let i = 1; i < pts.length; i++) {
            const dx = pts[i].x - pts[i - 1].x;
            const dy = pts[i].y - pts[i - 1].y;
            len += Math.sqrt(dx * dx + dy * dy);
        }
        return len;
    }

    // Trunk uses seed for shape, branchSeed for branch slot allocation
    const branchSeed = options.realisticBranchSeed ?? (seed + 7919);
    return generateBranch(start, end, maxDepth, 0, baseThickness, seed, branchSeed);
}
