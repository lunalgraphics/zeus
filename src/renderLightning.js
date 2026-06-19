import ConvolveMatrixFilter from "./utils/ConvolveMatrixFilter.js";
import FractalNoise from "./utils/FractalNoise.js";
import NumberCircle from "./utils/NumberCircle.js";
import PixelManipulator from "./utils/PixelManipulator.js";

/**
 * Seeded PRNG using xorshift32. Fast, deterministic, good distribution.
 * Returns a function that produces values in [0, 1) on each call.
 */
function createRng(seed) {
    let s = seed | 0;
    if (s === 0) s = 1; // xorshift can't have state 0
    return function() {
        s ^= s << 13;
        s ^= s >> 17;
        s ^= s << 5;
        return (s >>> 0) / 4294967296;
    };
}

/**
 * Recursively renders a strand (the main bolt or a branch).
 * @param {CanvasRenderingContext2D} ctx - The canvas context to draw on.
 * @param {PixelManipulator} manipulator - Shared displacement map pixel reader.
 * @param {Function} rng - Seeded random number generator returning [0, 1).
 * @param {object} params - Strand parameters.
 */
function renderStrand(ctx, manipulator, rng, params) {
    const {
        startX, startY, length, angle, startRadius,
        taper, twitchAmount, noiseType,
        numBranches, branchAngle, branchLenMax, branchLenMin,
        branchLenVariance, branchProbability,
        depth, options
    } = params;

    let adjustedTwitch = twitchAmount;
    if (noiseType == "Perlin") adjustedTwitch /= 3;

    ctx.fillStyle = "white";

    // Draw the strand itself
    for (let dist = 0; dist <= length; dist += 1) {
        let x = startX + dist * Math.cos(angle);
        let y = startY + dist * Math.sin(angle);
        let displacedX = x;
        let displacedY = y;

        let [r, g, b] = manipulator.getPixel(Math.round(x), Math.round(y));
        let luma = (r + g + b) / (3 * 255);
        let deltaPos = (luma - 0.5) * adjustedTwitch;
        displacedY += Math.round(deltaPos);

        let progress = dist / length;
        let radius = startRadius * (1 - progress * taper / 100);

        ctx.beginPath();
        ctx.arc(displacedX, displacedY, radius, 0, 2 * Math.PI);
        ctx.fill();
    }

    // Spawn branches if we haven't hit max depth
    if (depth < options["maxDepth"]) {
        let branchSpace = length / (numBranches + 1);

        for (let i = 0; i < numBranches; i++) {
            // Bernoulli: skip this branch with probability (1 - branchProbability)
            if (rng() > branchProbability) continue;

            let flipBranch = (i % 2 == 0) ? 1 : -1;

            // Linearly interpolate branch length from max to min across branches
            let t = numBranches > 1 ? i / (numBranches - 1) : 0;
            let thisBranchLen = branchLenMax + (branchLenMin - branchLenMax) * t;

            // Apply length variance: uniform in [-variance, +variance]
            let varianceFactor = 1 + (rng() * 2 - 1) * (branchLenVariance / 100);
            thisBranchLen *= varianceFactor;
            if (thisBranchLen <= 0) continue;

            // Position along the parent strand
            let distAlongParent = (i + 1) * branchSpace;
            let bStartX = startX + distAlongParent * Math.cos(angle);
            let bStartY = startY + distAlongParent * Math.sin(angle);

            // Branch angle relative to parent
            let childAngle = angle + branchAngle * flipBranch;

            // Radius at branch start matches parent's radius at that point
            let progress = distAlongParent / length;
            let childStartRadius = startRadius * (1 - progress * taper / 100);

            const shrinkFactor = 0.5;

            renderStrand(ctx, manipulator, rng, {
                startX: bStartX,
                startY: bStartY,
                length: thisBranchLen,
                angle: childAngle,
                startRadius: childStartRadius,
                taper,
                twitchAmount,
                noiseType,
                numBranches,
                branchAngle,
                branchLenMax: branchLenMax * shrinkFactor,
                branchLenMin: branchLenMin * shrinkFactor,
                branchLenVariance,
                branchProbability,
                depth: depth + 1,
                options
            });
        }
    }
}

export default function renderLightning(options, cooled=true) {

    let displacementMapCanv = document.getElementById("displacementMapCanv");
    let displacementMapCtx = displacementMapCanv.getContext("2d");
    let displacementMap = new FractalNoise(2000, 1000, {
        baseFrequency: [options["twitchScale"], options["twitchScale"]],
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

    // Render the main strand recursively (depth starts at 0)
    renderStrand(baseCtx, manipulator, rng, {
        startX: startX,
        startY: 500,
        length: options["baseLength"],
        angle: 0,  // main bolt goes horizontal
        startRadius: options["coreSize"],
        taper: options["taper"],
        twitchAmount: options["twitchAmount"],
        noiseType: options["noiseType"],
        numBranches: options["numBranches"],
        branchAngle: options["branchAngle"] * Math.PI / 180,
        branchLenMax: options["branchLenMax"],
        branchLenMin: options["branchLenMin"],
        branchLenVariance: options["branchLenVariance"],
        branchProbability: options["branchProbability"] / 100,
        depth: 0,
        options
    });

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
        baseFrequency: [options["glowTwitchScale"], options["glowTwitchScale"]],
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
    finalCtx.filter = `saturate(0) opacity(${glowDistortionOpacity}%) contrast(${glowDistortionContrast}%)`;
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
