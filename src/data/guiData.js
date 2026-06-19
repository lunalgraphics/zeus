// All GUI field definitions and their default values, organized by section.
// Each section maps to a collapsible panel in the UI.

export const guiSections = {
    Dimensions: [
        { label: "Length", key: "baseLength", type: "number", value: 1000, attr: { step: 1 } },
        { label: "Taper", key: "taper", type: "number", value: 70, attr: { step: 1, min: 0, max: 100 } },
    ],
    Twitch: [
        { label: "Noise Type", key: "noiseType", type: "select", value: "Fractal", options: ["Perlin", "Fractal"] },
        { label: "Amount", key: "twitchAmount", type: "number", value: 400, attr: { step: 1 } },
        { label: "Scale", key: "twitchScale", type: "number", value: 0.005, attr: { step: 0.001 } },
        { label: "Complexity", key: "twitchOctaves", type: "number", value: 5, attr: { step: 1, min: 1, max: 9 } },
        { label: "Seed", key: "twitchSeed", type: "number", value: 8, attr: { step: 1 } },
    ],
    Branches: [
        { label: "Max Branches", key: "numBranches", type: "number", value: 5, attr: { step: 1 } },
        { label: "Branch Probability", key: "branchProbability", type: "number", value: 60, attr: { step: 1, min: 0, max: 100 } },
        { label: "Max Length", key: "branchLenMax", type: "number", value: 300, attr: { step: 1, min: 0 } },
        { label: "Min Length", key: "branchLenMin", type: "number", value: 80, attr: { step: 1, min: 0 } },
        { label: "Length Variance", key: "branchLenVariance", type: "number", value: 10, attr: { step: 1, min: 0, max: 100 } },
        { label: "Angle", key: "branchAngle", type: "number", value: 42, attr: { step: 1, min: 0, max: 360 } },
        { label: "Max Depth", key: "maxDepth", type: "number", value: 3, attr: { step: 1, min: 1, max: 5 } },
        { label: "Seed", key: "branchSeed", type: "number", value: 1, attr: { step: 1 } },
    ],
    Core: [
        { label: "Size", key: "coreSize", type: "number", value: 5, attr: { step: 1 } },
        { label: "Softness", key: "softness", type: "number", value: 2, attr: { step: 1, min: 0, max: 29 } },
        { label: "Color", key: "coreColor", type: "color", value: "#FFFFFF" },
    ],
    Glow: [
        { label: "Depth", key: "glowDepth", type: "number", value: 8, attr: { step: 1, min: 0, max: 20 } },
        { label: "Radius", key: "glowRadius", type: "number", value: 2, attr: { step: 0.1, min: 0 } },
        { label: "Color", key: "glowColor", type: "color", value: "#0080FF" },
    ],
    "Glow Distortion": [
        { label: "Noise Type", key: "glowNoiseType", type: "select", value: "Fractal", options: ["Perlin", "Fractal"] },
        { label: "Amount", key: "glowTwitchAmount", type: "number", value: 0, attr: { step: 1 } },
        { label: "Scale", key: "glowTwitchScale", type: "number", value: 0.008, attr: { step: 0.001 } },
        { label: "Complexity", key: "glowTwitchOctaves", type: "number", value: 7, attr: { step: 1, min: 1, max: 9 } },
        { label: "Seed", key: "glowTwitchSeed", type: "number", value: 1, attr: { step: 1 } },
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
