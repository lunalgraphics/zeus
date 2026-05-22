import { FractalNoise } from './FractalNoise.js';
import { PixelManipulator } from './PixelManipulator.js';
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
// DISPLACEMENT MODE (original algorithm wrapped in path interface)
// ============================================================

/**
 * Generate a lightning path using noise displacement (the original algorithm).
 *
 * @param {object} options - Render options from the UI
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 * @returns {LightningPath}
 */
export function generateDisplacedPath(options, width, height) {
    // Generate noise map
    const displacementMap = new FractalNoise(width, height, {
        baseFrequency: [options.twitchScale, options.twitchScale],
        type: options.noiseType === "Fractal" ? "fractalNoise" : "turbulence",
        numOctaves: options.twitchOctaves,
        seed: options.twitchSeed,
        stitchTiles: "stitch"
    });
    displacementMap.render();
    const manipulator = new PixelManipulator(displacementMap.canvas);

    let twitchAmount = options.twitchAmount;
    if (options.noiseType === "Perlin") twitchAmount /= 3;

    const centerY = height / 2;
    const startX = width / 2 - options.baseLength / 2;
    const endX = startX + options.baseLength;
    const baseThickness = options.coreSize;

    // --- Main trunk ---
    const trunkPoints = [];
    for (let x = startX; x <= endX; x += 1) {
        const [r, g, b] = manipulator.getPixel(Math.round(x), Math.round(centerY));
        const luma = (r + g + b) / (3 * 255);
        const deltaPos = (luma - 0.5) * twitchAmount;
        const displacedY = centerY + Math.round(deltaPos);

        const progress = (x - startX) / options.baseLength;
        const thickness = baseThickness * (1 - progress * options.taper / 100);
        trunkPoints.push({ x, y: displacedY, thickness });
    }

    // --- Branches ---
    const children = [];
    const branchAngleRad = options.branchAngle * Math.PI / 180;
    const branchSpace = options.baseLength / (options.numBranches + 1);

    for (let i = 0; i < options.numBranches; i++) {
        const flipBranch = (i % 2 === 0) ? 1 : -1;
        const branchLength = options.branchLen - options.branchLenDelta * i;
        const branchStartX = startX + (i + 1) * branchSpace;

        const branchPoints = [];
        for (let dist = 0; dist < branchLength; dist++) {
            const x = branchStartX + dist * Math.cos(branchAngleRad);
            const y = centerY + dist * Math.sin(branchAngleRad) * flipBranch;

            const [r, g, b] = manipulator.getPixel(Math.round(x), Math.round(y));
            const luma = (r + g + b) / (3 * 255);
            const deltaPos = (luma - 0.5) * twitchAmount;
            const displacedY = y + Math.round(deltaPos);

            const progress = dist / branchLength;
            const startRadius = baseThickness * (1 - (branchStartX - startX) / options.baseLength * options.taper / 100);
            const thickness = startRadius * (1 - progress * options.taper / 100);
            branchPoints.push({ x, y: displacedY, thickness });
        }
        children.push({ points: branchPoints, children: [] });
    }

    return { points: trunkPoints, children };
}

// ============================================================
// REALISTIC MODE (recursive midpoint displacement)
// ============================================================

/**
 * Generate a lightning path using recursive midpoint displacement.
 * Produces natural-looking branching with stochastic sub-branches.
 *
 * Uses separate RNG streams for shape vs. branching decisions so that
 * changing detail level doesn't alter which branches spawn.
 * Branching is evaluated by distance along the path (not by point index)
 * so branch density stays consistent regardless of subdivision depth.
 *
 * @param {object} options - Render options including realistic-mode params
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 * @returns {LightningPath}
 */
export function generateRealisticPath(options, width, height) {
    // Separate RNG streams: one for geometry, one for branching
    const seed = options.realisticSeed ?? 42;
    const shapeRng = new SeededRandom(seed);
    const branchRng = new SeededRandom(seed + 7919); // offset by a prime

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

    // Distance between branch evaluation points (in pixels along the path).
    // This keeps branch density independent of point count.
    const BRANCH_EVAL_SPACING = 12;

    /**
     * Recursively subdivide a line segment with random midpoint displacement.
     * Uses shapeRng so geometry is independent of branching.
     */
    function subdivide(rng, p1, p2, depth, scale) {
        if (depth === 0) {
            return [p1, p2];
        }

        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2;

        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const len = Math.sqrt(dx * dx + dy * dy);

        if (len === 0) return [p1, p2];

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
     * Generate a full branch (trunk or sub-branch) with recursive subdivision
     * and probabilistic child branches.
     */
    function generateBranch(p1, p2, depth, branchDepth, thickness) {
        // Each branch gets its own shape RNG derived from the parent branchRng
        // so that adding/removing branches doesn't shift sibling geometry.
        const branchShapeSeed = branchDepth === 0
            ? seed
            : Math.floor(branchRng.next() * 2147483647);
        const localShapeRng = branchDepth === 0 ? shapeRng : new SeededRandom(branchShapeSeed);

        const rawPoints = subdivide(localShapeRng, p1, p2, depth, displacement * (0.5 ** (branchDepth * 0.3)));
        const totalLen = computePathLength(rawPoints);

        // Assign thickness with taper
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

        // Spawn child branches by walking along the path at fixed distance intervals.
        // This makes branch density independent of point count (detail level).
        const children = [];
        if (branchDepth < maxBranchDepth && branchChance > 0) {
            let distSinceLastEval = 0;
            let accumDist = 0;

            for (let i = 1; i < points.length - 1; i++) {
                const dx = points[i].x - points[i - 1].x;
                const dy = points[i].y - points[i - 1].y;
                const segLen = Math.sqrt(dx * dx + dy * dy);
                accumDist += segLen;
                distSinceLastEval += segLen;

                if (distSinceLastEval < BRANCH_EVAL_SPACING) continue;
                distSinceLastEval = 0;

                // Use branchRng for the decision — independent of shape subdivision
                if (branchRng.next() < branchChance) {
                    const origin = points[i];
                    const progress = accumDist / totalLen;

                    // Branch direction: tangent + random angle offset
                    const next = points[Math.min(i + 1, points.length - 1)];
                    const tangentAngle = Math.atan2(next.y - origin.y, next.x - origin.x);
                    const branchAngle = tangentAngle + branchRng.range(-branchAngleRange, branchAngleRange) * Math.PI / 180;

                    const remainingLen = totalLen * (1 - progress);
                    const branchLen = remainingLen * branchLenFactor * branchRng.range(0.4, 1.0);

                    const branchEnd = {
                        x: origin.x + Math.cos(branchAngle) * branchLen,
                        y: origin.y + Math.sin(branchAngle) * branchLen,
                    };

                    const childThickness = origin.thickness * 0.6;
                    const childDepth = Math.max(depth - 2, 3);
                    const child = generateBranch(origin, branchEnd, childDepth, branchDepth + 1, childThickness);
                    children.push(child);
                }
            }
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

    return generateBranch(start, end, maxDepth, 0, baseThickness);
}
