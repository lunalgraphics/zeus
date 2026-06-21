// All GUI field definitions and their default values, organized by section.
// Each section maps to a collapsible panel in the UI.

export const guiSections = {
    Dimensions: [
        { label: "Length", key: "baseLength", type: "number", value: 1000, attr: { step: 1 }, tooltip: "Length of the main bolt in pixels" },
        { label: "Taper", key: "taper", type: "number", value: 70, attr: { step: 1, min: 0, max: 100 }, tooltip: "How much the bolt thins toward its end (0 = uniform, 100 = full taper)" },
    ],
    Twitch: [
        { label: "Noise Type", key: "noiseType", type: "select", value: "Fractal", options: ["Perlin", "Fractal"], tooltip: "Type of noise used for displacement (Perlin is smoother, Fractal is more erratic)" },
        { label: "Amount", key: "twitchAmount", type: "number", value: 400, attr: { step: 1 }, tooltip: "Strength of the vertical displacement applied to the bolt" },
        { label: "Scale", key: "twitchScale", type: "number", value: 50, attr: { step: 1, min: 0 }, tooltip: "Frequency of the noise pattern (higher = more detail, lower = broader waves)" },
        { label: "Complexity", key: "twitchOctaves", type: "number", value: 5, attr: { step: 1, min: 1, max: 9 }, tooltip: "Number of noise octaves layered together (more = finer detail)" },
        { label: "Seed", key: "twitchSeed", type: "number", value: 8, attr: { step: 1 }, tooltip: "Random seed for the displacement noise (same seed = same shape)" },
    ],
    Branches: [
        { label: "Max Branches", key: "maxBranches", type: "number", value: 5, attr: { step: 1, min: 0 }, tooltip: "Max branches at depth 0 (sampled uniformly from 0 to this value, decreases with depth)" },
        { label: "Max Length", key: "branchLenMax", type: "number", value: 300, attr: { step: 1, min: 0 }, tooltip: "Branch length at the start of the parent strand (pixels)" },
        { label: "Min Length", key: "branchLenMin", type: "number", value: 80, attr: { step: 1, min: 0 }, tooltip: "Branch length at the end of the parent strand (pixels)" },
        { label: "Length Variance", key: "branchLenVariance", type: "number", value: 10, attr: { step: 1, min: 0, max: 100 }, tooltip: "Random length variation applied to each branch (±%)" },
        { label: "Depth Shrink", key: "branchShrink", type: "number", value: 50, attr: { step: 1, min: 0, max: 100 }, tooltip: "How much sub-branches shrink per depth level (0 = no shrink, 100 = zero length)" },
        { label: "Angle", key: "branchAngle", type: "number", value: 42, attr: { step: 1, min: 0, max: 360 }, tooltip: "Angle of branches relative to their parent strand (degrees)" },
        { label: "Max Depth", key: "maxDepth", type: "number", value: 3, attr: { step: 1, min: 1, max: 5 }, tooltip: "How many levels of recursive branching to render" },
        { label: "Seed", key: "branchSeed", type: "number", value: 1, attr: { step: 1 }, tooltip: "Random seed for branch count and length variance" },
    ],
    Core: [
        { label: "Size", key: "coreSize", type: "number", value: 5, attr: { step: 1 }, tooltip: "Radius of the bolt's bright inner core in pixels" },
        { label: "Softness", key: "softness", type: "number", value: 2, attr: { step: 1, min: 0, max: 29 }, tooltip: "Lens blur radius applied to the core (simulates camera bokeh)" },
        { label: "Color", key: "coreColor", type: "color", value: "#FFFFFF", tooltip: "Color of the bolt's bright inner core" },
    ],
    Glow: [
        { label: "Depth", key: "glowDepth", type: "number", value: 8, attr: { step: 1, min: 0, max: 20 }, tooltip: "Number of blur passes stacked to build the glow" },
        { label: "Radius", key: "glowRadius", type: "number", value: 2, attr: { step: 0.1, min: 0 }, tooltip: "Base blur radius for each glow pass (grows quadratically per pass)" },
        { label: "Color", key: "glowColor", type: "color", value: "#6771fe", tooltip: "Color of the outer glow surrounding the bolt" },
    ],
    "Glow Distortion": [
        { label: "Noise Type", key: "glowNoiseType", type: "select", value: "Fractal", options: ["Perlin", "Fractal"], tooltip: "Type of noise used to distort the glow" },
        { label: "Amount", key: "glowTwitchAmount", type: "number", value: 0, attr: { step: 1 }, tooltip: "Strength of noise distortion overlaid on the glow" },
        { label: "Scale", key: "glowTwitchScale", type: "number", value: 80, attr: { step: 1, min: 0 }, tooltip: "Frequency of the glow distortion noise" },
        { label: "Complexity", key: "glowTwitchOctaves", type: "number", value: 7, attr: { step: 1, min: 1, max: 9 }, tooltip: "Number of noise octaves for glow distortion" },
        { label: "Seed", key: "glowTwitchSeed", type: "number", value: 1, attr: { step: 1 }, tooltip: "Random seed for the glow distortion noise" },
    ],
};

// Build a flat options object from the sections (key -> default value).
export function getDefaultOptions() {
    const options = {};
    for (const fields of Object.values(guiSections)) {
        for (const field of fields) {
            options[field.key] = field.value;
        }
    }
    return options;
}
