import { FractalNoise } from './FractalNoise.js';
import { PixelManipulator } from './PixelManipulator.js';
import { NumberCircle } from './NumberCircle.js';
import { ConvolveMatrixFilter } from './ConvolveMatrixFilter.js';

/**
 * Renders lightning onto the provided canvas set.
 *
 * @param {object} canvases - Object containing the four canvas elements:
 *   { base, displacementMap, glow, final }
 * @param {object} options - Render parameters from the UI
 */
export function renderLightning(canvases, options) {
    const { base: baseCanv, displacementMap: displacementMapCanv, glow: glowCanv, final: finalCanv } = canvases;
    const width = finalCanv.width;
    const height = finalCanv.height;

    // --- Generate displacement noise map ---
    const displacementMapCtx = displacementMapCanv.getContext("2d");
    const displacementMap = new FractalNoise(width, height, {
        baseFrequency: [options.twitchScale, options.twitchScale],
        type: options.noiseType === "Fractal" ? "fractalNoise" : "turbulence",
        numOctaves: options.twitchOctaves,
        seed: options.twitchSeed,
        stitchTiles: "stitch"
    });
    displacementMap.render();
    displacementMapCtx.drawImage(displacementMap.canvas, 0, 0);
    const manipulator = new PixelManipulator(displacementMap.canvas);

    // --- Draw core bolt path ---
    const baseCtx = baseCanv.getContext("2d");
    baseCtx.clearRect(0, 0, width, height);

    let twitchAmount = options.twitchAmount;
    if (options.noiseType === "Perlin") twitchAmount /= 3;

    const centerY = height / 2;
    const startX = width / 2 - options.baseLength / 2;
    const endX = startX + options.baseLength;
    const baseThickness = options.coreSize;

    baseCtx.fillStyle = "white";
    for (let x = startX; x <= endX; x += 1) {
        let displacedY = centerY;
        const [r, g, b] = manipulator.getPixel(Math.round(x), Math.round(centerY));
        const luma = (r + g + b) / (3 * 255);
        const deltaPos = (luma - 0.5) * twitchAmount;
        displacedY += Math.round(deltaPos);

        const progress = (x - startX) / options.baseLength;
        const radius = baseThickness * (1 - progress * options.taper / 100);
        baseCtx.beginPath();
        baseCtx.arc(x, displacedY, radius, 0, 2 * Math.PI);
        baseCtx.fill();
    }

    // --- Draw branches ---
    const branchAngleRad = options.branchAngle * Math.PI / 180;
    const branchSpace = options.baseLength / (options.numBranches + 1);

    for (let i = 0; i < options.numBranches; i++) {
        const flipBranch = (i % 2 === 0) ? 1 : -1;
        const branchLength = options.branchLen - options.branchLenDelta * i;
        const branchStartX = startX + (i + 1) * branchSpace;

        for (let dist = 0; dist < branchLength; dist++) {
            const x = branchStartX + dist * Math.cos(branchAngleRad);
            const y = centerY + dist * Math.sin(branchAngleRad) * flipBranch;
            let displacedY = y;

            const [r, g, b] = manipulator.getPixel(Math.round(x), Math.round(y));
            const luma = (r + g + b) / (3 * 255);
            const deltaPos = (luma - 0.5) * twitchAmount;
            displacedY += Math.round(deltaPos);

            const progress = dist / branchLength;
            const startRadius = baseThickness * (1 - (branchStartX - startX) / options.baseLength * options.taper / 100);
            const radius = startRadius * (1 - progress * options.taper / 100);
            baseCtx.beginPath();
            baseCtx.arc(x, displacedY, radius, 0, 2 * Math.PI);
            baseCtx.fill();
        }
    }

    // --- Generate glow layer ---
    const glowCtx = glowCanv.getContext("2d");
    baseCtx.save();
    baseCtx.globalCompositeOperation = "source-atop";
    baseCtx.fillStyle = options.glowColor;
    baseCtx.fillRect(0, 0, width, height);
    baseCtx.restore();

    glowCtx.clearRect(0, 0, width, height);
    glowCtx.save();
    glowCtx.globalCompositeOperation = "screen";
    for (let i = 0; i < options.glowDepth; i++) {
        glowCtx.filter = `blur(${Math.pow(i + 1, 2) * options.glowRadius}px)`;
        glowCtx.drawImage(baseCanv, 0, 0);
    }
    glowCtx.restore();

    // --- Recolor core ---
    baseCtx.save();
    baseCtx.globalCompositeOperation = "source-atop";
    baseCtx.fillStyle = options.coreColor;
    baseCtx.fillRect(0, 0, width, height);
    baseCtx.restore();

    // --- Composite final output ---
    const finalCtx = finalCanv.getContext("2d");
    finalCtx.restore();
    finalCtx.fillStyle = "black";
    finalCtx.fillRect(0, 0, width, height);
    finalCtx.save();

    // Draw glow with softness blur
    finalCtx.filter = `blur(${options.softness}px)`;
    finalCtx.drawImage(glowCanv, 0, 0);
    finalCtx.restore();
    finalCtx.save();

    // --- Glow distortion overlay ---
    const glowDistortionMap = new FractalNoise(width, height, {
        baseFrequency: [options.glowTwitchScale, options.glowTwitchScale],
        type: options.glowNoiseType === "Fractal" ? "fractalNoise" : "turbulence",
        numOctaves: options.glowTwitchOctaves,
        seed: options.glowTwitchSeed,
        stitchTiles: "stitch",
    });
    glowDistortionMap.render();

    let glowDistortionOpacity = options.glowTwitchAmount;
    let glowDistortionContrast = 100;
    if (options.glowNoiseType === "Perlin") glowDistortionOpacity /= 3;
    if (glowDistortionOpacity > 100) glowDistortionContrast += glowDistortionOpacity - 100;

    finalCtx.globalCompositeOperation = "overlay";
    finalCtx.filter = `saturate(0) opacity(${glowDistortionOpacity}%) contrast(${glowDistortionContrast}%)`;
    finalCtx.drawImage(glowDistortionMap.canvas, 0, 0);
    finalCtx.restore();
    finalCtx.save();

    // --- Core with lens blur ---
    if (options.softness < 8) {
        const lensBlurMatrix = new NumberCircle(options.softness);
        const lensBlur = new ConvolveMatrixFilter(lensBlurMatrix.matrix);
        lensBlur.render();
        finalCtx.filter = lensBlur.getFilter();
        finalCtx.drawImage(baseCanv, 0, 0);
        lensBlur.destroy();
    } else if (options.softness < 15) {
        const tempCanv = document.createElement("canvas");
        tempCanv.width = width / 2;
        tempCanv.height = height / 2;
        const tempCtx = tempCanv.getContext("2d");
        const lensBlurMatrix = new NumberCircle(Math.round(options.softness / 2));
        const lensBlur = new ConvolveMatrixFilter(lensBlurMatrix.matrix);
        lensBlur.render();
        tempCtx.filter = lensBlur.getFilter();
        tempCtx.drawImage(baseCanv, 0, 0, tempCanv.width, tempCanv.height);
        lensBlur.destroy();
        finalCtx.drawImage(tempCanv, 0, 0, width, height);
    } else {
        const tempCanv = document.createElement("canvas");
        tempCanv.width = width / 4;
        tempCanv.height = height / 4;
        const tempCtx = tempCanv.getContext("2d");
        const lensBlurMatrix = new NumberCircle(Math.round(options.softness / 4));
        const lensBlur = new ConvolveMatrixFilter(lensBlurMatrix.matrix);
        lensBlur.render();
        tempCtx.filter = lensBlur.getFilter();
        tempCtx.drawImage(baseCanv, 0, 0, tempCanv.width, tempCanv.height);
        lensBlur.destroy();
        finalCtx.drawImage(tempCanv, 0, 0, width, height);
    }
}
