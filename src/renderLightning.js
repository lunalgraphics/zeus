import ConvolveMatrixFilter from "./utils/ConvolveMatrixFilter.js";
import FractalNoise from "./utils/FractalNoise.js";
import NumberCircle from "./utils/NumberCircle.js";
import PixelManipulator from "./utils/PixelManipulator.js";

/**
 * Seeded PRNG using mulberry32. Well-distributed even for small seeds.
 * Returns a function that produces values in [0, 1) on each call.
 */
function createRng(seed) {
    let s = seed | 0;
    return function() {
        s |= 0; s = s + 0x6D2B79F5 | 0;
        let t = Math.imul(s ^ s >>> 15, 1 | s);
        t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
}

/**
 * Checks if two line segments (p1-p2) and (p3-p4) intersect.
 */
function segmentsIntersect(p1, p2, p3, p4) {
    let d1x = p2.x - p1.x, d1y = p2.y - p1.y;
    let d2x = p4.x - p3.x, d2y = p4.y - p3.y;
    let cross = d1x * d2y - d1y * d2x;
    if (Math.abs(cross) < 1e-10) return false;
    let dx = p3.x - p1.x, dy = p3.y - p1.y;
    let t = (dx * d2y - dy * d2x) / cross;
    let u = (dx * d1y - dy * d1x) / cross;
    return t > 0 && t < 1 && u > 0 && u < 1;
}

/**
 * Checks if a line segment crosses any existing segment in the list.
 */
function segmentCrossesExisting(segStart, segEnd, existingSegments) {
    for (let seg of existingSegments) {
        if (segmentsIntersect(segStart, segEnd, seg.start, seg.end)) return true;
    }
    return false;
}

/**
 * Recursively builds the lightning tree using pre-displaced (straight) segments.
 * Each strand is stored as a segment {start, end} for crossing checks,
 * plus the full params needed to render it later with displacement.
 */
function buildTree(manipulator, rng, allSegments, strandParams, params) {
    const {
        startX, startY, length, angle, startRadius,
        taper, twitchAmount, noiseType,
        maxBranches, branchAngle, branchLenMax, branchLenMin,
        branchLenVariance,
        depth, options
    } = params;

    // This strand's pre-displaced segment (straight line)
    let segStart = { x: startX, y: startY };
    let segEnd = { x: startX + length * Math.cos(angle), y: startY + length * Math.sin(angle) };
    allSegments.push({ start: segStart, end: segEnd });

    // Store params for rendering later
    strandParams.push(params);

    // Spawn branches if we haven't hit max depth
    if (depth < options["maxDepth"] && maxBranches > 0) {
        let depthFraction = depth / options["maxDepth"];
        let maxAtThisDepth = Math.round(maxBranches * (1 - depthFraction));
        let numBranches = Math.floor(rng() * (maxAtThisDepth + 1));

        if (numBranches > 0) {
            let branchSpace = length / (numBranches + 1);

            for (let i = 0; i < numBranches; i++) {
                let flipBranch = (i % 2 == 0) ? 1 : -1;

                let t = numBranches > 1 ? i / (numBranches - 1) : 0;
                let thisBranchLen = branchLenMax + (branchLenMin - branchLenMax) * t;

                let varianceFactor = 1 + (rng() * 2 - 1) * (branchLenVariance / 100);
                thisBranchLen *= varianceFactor;
                if (thisBranchLen <= 0) continue;

                let distAlongParent = (i + 1) * branchSpace;
                let bStartX = startX + distAlongParent * Math.cos(angle);
                let bStartY = startY + distAlongParent * Math.sin(angle);

                let childAngle = angle + branchAngle * flipBranch;

                let progress = distAlongParent / length;
                let childStartRadius = startRadius * (1 - progress * taper / 100);

                const shrinkFactor = 1 - options["branchShrink"] / 100;

                // Check if this branch's straight segment crosses any existing one
                let childEnd = {
                    x: bStartX + thisBranchLen * Math.cos(childAngle),
                    y: bStartY + thisBranchLen * Math.sin(childAngle)
                };
                if (segmentCrossesExisting({ x: bStartX, y: bStartY }, childEnd, allSegments)) {
                    continue;
                }

                buildTree(manipulator, rng, allSegments, strandParams, {
                    startX: bStartX,
                    startY: bStartY,
                    length: thisBranchLen,
                    angle: childAngle,
                    startRadius: childStartRadius,
                    taper,
                    twitchAmount,
                    noiseType,
                    maxBranches,
                    branchAngle,
                    branchLenMax: branchLenMax * shrinkFactor,
                    branchLenMin: branchLenMin * shrinkFactor,
                    branchLenVariance,
                    depth: depth + 1,
                    options
                });
            }
        }
    }
}

/**
 * Renders a strand with displacement applied, drawing connected line segments
 * with round caps between consecutive displaced points.
 */
function renderStrand(ctx, manipulator, params) {
    const { startX, startY, length, angle, startRadius, taper, twitchAmount, noiseType } = params;

    let adjustedTwitch = twitchAmount;
    if (noiseType == "Perlin") adjustedTwitch /= 3;

    ctx.strokeStyle = "white";
    ctx.fillStyle = "white";
    ctx.lineCap = "round";

    let prevX = null, prevY = null, prevRadius = 0;

    for (let dist = 0; dist <= length; dist += 1) {
        let x = startX + dist * Math.cos(angle);
        let y = startY + dist * Math.sin(angle);

        let [r, g, b] = manipulator.getPixel(Math.round(x), Math.round(y));
        let luma = (r + g + b) / (3 * 255);
        let deltaPos = (luma - 0.5) * adjustedTwitch;
        let displacedY = y + Math.round(deltaPos);

        let progress = dist / length;
        let radius = startRadius * (1 - progress * taper / 100);

        if (prevX !== null) {
            let lineWidth = Math.min(prevRadius, radius) * 2;
            ctx.lineWidth = lineWidth;
            ctx.beginPath();
            ctx.moveTo(prevX, prevY);
            ctx.lineTo(x, displacedY);
            ctx.stroke();
        } else {
            // Draw the first point as a circle
            ctx.beginPath();
            ctx.arc(x, displacedY, radius, 0, 2 * Math.PI);
            ctx.fill();
        }

        prevX = x;
        prevY = displacedY;
        prevRadius = radius;
    }
}

export default function renderLightning(options, cooled=true) {

    let displacementMapCanv = document.getElementById("displacementMapCanv");
    let displacementMapCtx = displacementMapCanv.getContext("2d");
    let displacementMap = new FractalNoise(2000, 1000, {
        baseFrequency: [options["twitchScale"] / 10000, options["twitchScale"] / 10000],
        type: (options["noiseType"] == "Fractal")?"fractalNoise":"turbulence",
        numOctaves: options["twitchOctaves"],
        seed: options["twitchSeed"],
        stitchTiles: "stitch"
    });
    displacementMap.render();
    displacementMapCtx.drawImage(displacementMap.canvas, 0, 0);
    let manipulator = new PixelManipulator(displacementMap.canvas);

    let baseCanv = document.getElementById("baseCanv");
    let baseCtx = baseCanv.getContext("2d");

    baseCtx.clearRect(0, 0, 2000, 1000);

    let startX = 1000 - options["baseLength"] / 2;

    // Create seeded RNG for stochastic branching
    let rng = createRng(options["branchSeed"]);

    // Build the lightning tree (straight segments, prune crossings)
    let allSegments = [];
    let strandParams = [];
    buildTree(manipulator, rng, allSegments, strandParams, {
        startX: startX,
        startY: 500,
        length: options["baseLength"],
        angle: 0,
        startRadius: options["coreSize"],
        taper: options["taper"],
        twitchAmount: options["twitchAmount"],
        noiseType: options["noiseType"],
        maxBranches: options["maxBranches"],
        branchAngle: options["branchAngle"] * Math.PI / 180,
        branchLenMax: options["branchLenMax"],
        branchLenMin: options["branchLenMin"],
        branchLenVariance: options["branchLenVariance"],
        depth: 0,
        options
    });

    // Render all surviving strands with displacement
    for (let params of strandParams) {
        renderStrand(baseCtx, manipulator, params);
    }

    let glowCanv = document.getElementById("glowCanv");
    let glowCtx = glowCanv.getContext("2d");
    baseCtx.save();
    baseCtx.globalCompositeOperation = "source-atop";
    baseCtx.fillStyle = options["glowColor"];
    baseCtx.fillRect(0, 0, 2000, 1000);
    baseCtx.restore();
    glowCtx.clearRect(0, 0, 2000, 1000);
    glowCtx.save();
    glowCtx.globalCompositeOperation = "screen";
    for (let i = 0; i < options["glowDepth"]; i++) {
        glowCtx.filter = `blur(${Math.pow(i + 1, 2) * options["glowRadius"]}px)`;
        glowCtx.drawImage(baseCanv, 0, 0);
    }
    glowCtx.restore();

    baseCtx.save();
    baseCtx.globalCompositeOperation = "source-atop";
    baseCtx.fillStyle = options["coreColor"];
    baseCtx.fillRect(0, 0, 2000, 1000);
    baseCtx.restore();

    let finalCanv = document.getElementById("finalCanv");
    let finalCtx = finalCanv.getContext("2d");
    finalCtx.restore();
    finalCtx.fillStyle = "black";
    finalCtx.fillRect(0, 0, 2000, 1000);
    finalCtx.save();

    finalCtx.filter = `blur(${options["softness"]}px)`;
    finalCtx.drawImage(glowCanv, 0, 0);
    finalCtx.restore(); finalCtx.save();

    let glowDistortionMap = new FractalNoise(2000, 1000, {
        baseFrequency: [options["glowTwitchScale"] / 10000, options["glowTwitchScale"] / 10000],
        type: (options["glowNoiseType"] == "Fractal")?"fractalNoise":"turbulence",
        numOctaves: options["glowTwitchOctaves"],
        seed: options["glowTwitchSeed"],
        stitchTiles: "stitch",
    });
    glowDistortionMap.render();

    let glowDistortionOpacity = options["glowTwitchAmount"], glowDistortionContrast = 100;
    if (options["glowNoiseType"] == "Perlin") glowDistortionOpacity /= 3;
    if (glowDistortionOpacity > 100) glowDistortionContrast += glowDistortionOpacity - 100;
    finalCtx.globalCompositeOperation = "overlay";
    finalCtx.filter = `saturate(0)
        opacity(${glowDistortionOpacity}%)
        contrast(${glowDistortionContrast}%)
        ${options["glowNoiseType"] === "Perlin" ? "invert(1)" : ""}`;
    finalCtx.drawImage(glowDistortionMap.canvas, 0, 0);
    finalCtx.restore(); finalCtx.save();

    if (options["softness"] < 8) {
        let lensBlurMatrix = new NumberCircle(options["softness"]);
        let lensBlur = new ConvolveMatrixFilter(lensBlurMatrix.matrix);
        lensBlur.render();
        finalCtx.filter = lensBlur.getFilter();
        finalCtx.drawImage(baseCanv, 0, 0);
        lensBlur.destroy();
    }
    else if (options["softness"] < 15) {
        let tempCanv = document.createElement("canvas");
        tempCanv.width = 1000;
        tempCanv.height = 500;
        let tempCtx = tempCanv.getContext("2d");
        let lensBlurMatrix = new NumberCircle(Math.round(options["softness"] / 2));
        let lensBlur = new ConvolveMatrixFilter(lensBlurMatrix.matrix);
        lensBlur.render();
        tempCtx.filter = lensBlur.getFilter();
        tempCtx.drawImage(baseCanv, 0, 0, 1000, 500);
        lensBlur.destroy();
        finalCtx.drawImage(tempCanv, 0, 0, 2000, 1000);
    }
    else {
        let tempCanv = document.createElement("canvas");
        tempCanv.width = 500;
        tempCanv.height = 250;
        let tempCtx = tempCanv.getContext("2d");
        let lensBlurMatrix = new NumberCircle(Math.round(options["softness"] / 4));
        let lensBlur = new ConvolveMatrixFilter(lensBlurMatrix.matrix);
        lensBlur.render();
        tempCtx.filter = lensBlur.getFilter();
        tempCtx.drawImage(baseCanv, 0, 0, 500, 250);
        lensBlur.destroy();
        finalCtx.drawImage(tempCanv, 0, 0, 2000, 1000);
    }

}
