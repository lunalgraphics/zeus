import { FractalNoise } from './FractalNoise.js';
import { NumberCircle } from './NumberCircle.js';
import { ConvolveMatrixFilter } from './ConvolveMatrixFilter.js';
import { generateRealisticPath } from './pathGenerators.js';
import { drawPathTree } from './pathRenderer.js';

/**
 * Renders lightning onto the provided canvas set.
 *
 * @param {object} canvases - Object containing the canvas elements:
 *   { base, glow, final }
 * @param {object} options - Render parameters from the UI
 */
export function renderLightning(canvases, options) {
    const { base: baseCanv, glow: glowCanv, final: finalCanv } = canvases;
    const width = finalCanv.width;
    const height = finalCanv.height;

    // --- Generate path ---
    const path = generateRealisticPath(options, width, height);

    // --- Draw path onto base canvas ---
    const baseCtx = baseCanv.getContext("2d");
    baseCtx.clearRect(0, 0, width, height);
    drawPathTree(baseCtx, path);

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

    if (glowDistortionOpacity > 0) {
        finalCtx.globalCompositeOperation = "overlay";
        finalCtx.filter = `saturate(0) opacity(${glowDistortionOpacity}%) contrast(${glowDistortionContrast}%)`;
        finalCtx.drawImage(glowDistortionMap.canvas, 0, 0);
        finalCtx.restore();
        finalCtx.save();
    }

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

    // --- Edge fade: draw black-to-transparent gradients from each edge ---
    const edgeFade = options.edgeFade ?? 0;
    if (edgeFade > 0) {
        finalCtx.restore();
        finalCtx.save();
        finalCtx.globalCompositeOperation = "destination-in";

        // Create a gradient mask: fully opaque in the center, fading to transparent at edges
        // We draw a filled rect with a composite gradient
        const maskCanv = document.createElement("canvas");
        maskCanv.width = width;
        maskCanv.height = height;
        const maskCtx = maskCanv.getContext("2d");

        // Start fully opaque
        maskCtx.fillStyle = "white";
        maskCtx.fillRect(0, 0, width, height);

        // Fade from each edge using destination-out with gradients
        maskCtx.globalCompositeOperation = "destination-out";

        // Left edge
        let grad = maskCtx.createLinearGradient(0, 0, edgeFade, 0);
        grad.addColorStop(0, "white");
        grad.addColorStop(1, "transparent");
        maskCtx.fillStyle = grad;
        maskCtx.fillRect(0, 0, edgeFade, height);

        // Right edge
        grad = maskCtx.createLinearGradient(width, 0, width - edgeFade, 0);
        grad.addColorStop(0, "white");
        grad.addColorStop(1, "transparent");
        maskCtx.fillStyle = grad;
        maskCtx.fillRect(width - edgeFade, 0, edgeFade, height);

        // Top edge
        grad = maskCtx.createLinearGradient(0, 0, 0, edgeFade);
        grad.addColorStop(0, "white");
        grad.addColorStop(1, "transparent");
        maskCtx.fillStyle = grad;
        maskCtx.fillRect(0, 0, width, edgeFade);

        // Bottom edge
        grad = maskCtx.createLinearGradient(0, height, 0, height - edgeFade);
        grad.addColorStop(0, "white");
        grad.addColorStop(1, "transparent");
        maskCtx.fillStyle = grad;
        maskCtx.fillRect(0, height - edgeFade, width, edgeFade);

        // Apply the mask
        finalCtx.drawImage(maskCanv, 0, 0);
        finalCtx.restore();
        finalCtx.save();

        // Fill the faded areas with black (since we're on a black background)
        finalCtx.globalCompositeOperation = "destination-over";
        finalCtx.fillStyle = "black";
        finalCtx.fillRect(0, 0, width, height);
        finalCtx.restore();
    }
}
